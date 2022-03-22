import {Qubie} from "@nartallax/qubie"
import {QubieTransformerTricks} from "tricks"
import * as Tsc from "typescript"

export interface TransformerParams {
	coreModuleName: string
	coreModuleIdentifier: string
}

export class Transformer {
	private knownFnSymbols = new Map<Tsc.Symbol, Set<number> | null>()

	constructor(
		private readonly tricks: QubieTransformerTricks,
		private readonly params: TransformerParams
	) {
		void this.params
	}

	transform(file: Tsc.SourceFile): Tsc.SourceFile {
		let visitor = (node: Tsc.Node): Tsc.Node => {
			if(Tsc.isCallExpression(node)){
				const markedArgNums = this.getMarkedArgPositions(node)
				if(markedArgNums){
					return Tsc.factory.updateCallExpression(node,
						node.expression,
						node.typeArguments,
						node.arguments.map((argValue, argPos) => {
							if(markedArgNums.has(argPos)){
								let expr = this.nodeToExpressionStructure(argValue)
								return this.tricks.createLiteralOfValue(expr)
							} else {
								return Tsc.visitEachChild(argValue, visitor, this.tricks.transformContext)
							}
						}))
				}
			}
			return Tsc.visitEachChild(node, visitor, this.tricks.transformContext)
		}
		return Tsc.visitEachChild(file, visitor, this.tricks.transformContext)
	}

	private nodeToExpressionStructure(node: Tsc.Node): Qubie.Expression {
		if(!Tsc.isFunctionExpression(node) && !Tsc.isArrowFunction(node)){
			throw new Error("Cannot transform node to expression: node is not a function: " + node.getText())
		}
		let params = this.extractParameterNames(node)
		let expr = this.extractExpressionNode(node)
		try {
			return this.expressionNodeToExpressionStructure(expr, params)
		} catch(e){
			if(!(e instanceof Error)){
				throw e
			}
			throw new Error(e.message + " (while processing " + node.getText() + ")")
		}

	}

	private extractParameterNames(fn: Tsc.ArrowFunction | Tsc.FunctionExpression): Map<string, (string | number)[]> {
		let result = new Map<string, (string | number)[]>()
		for(let i = 0; i < fn.parameters.length; i++){
			let param = fn.parameters[i]!
			let part = this.tricks.bindingNameToIdentifiers(param.name)
			for(let [name, path] of part){
				result.set(name, [i, ...path])
			}
		}
		return result
	}

	private expressionNodeToExpressionStructure(expr: Tsc.Expression, params: Map<string, (string | number)[]>): Qubie.Expression {
		if(Tsc.isBinaryExpression(expr)){
			let a = this.expressionNodeToExpressionStructure(expr.left, params)
			let b = this.expressionNodeToExpressionStructure(expr.right, params)
			switch(expr.operatorToken.kind){
				case Tsc.SyntaxKind.PlusToken: return {a, b, type: "+"}
				case Tsc.SyntaxKind.MinusToken: return {a, b, type: "-"}
				case Tsc.SyntaxKind.SlashToken: return {a, b, type: "/"}
				case Tsc.SyntaxKind.AsteriskToken: return {a, b, type: "*"}
				case Tsc.SyntaxKind.LessThanLessThanToken: return {a, b, type: "<<"}
				case Tsc.SyntaxKind.GreaterThanGreaterThanToken: return {a, b, type: ">>"}
				case Tsc.SyntaxKind.AmpersandToken: return {a, b, type: "&"}
				case Tsc.SyntaxKind.BarToken: return {a, b, type: "|"}
				case Tsc.SyntaxKind.EqualsEqualsEqualsToken: return {a, b, type: "=="}
				case Tsc.SyntaxKind.ExclamationEqualsEqualsToken: return {a, b, type: "!="}
				case Tsc.SyntaxKind.LessThanToken: return {a, b, type: "<"}
				case Tsc.SyntaxKind.LessThanEqualsToken: return {a, b, type: "<="}
				case Tsc.SyntaxKind.GreaterThanToken: return {a, b, type: ">"}
				case Tsc.SyntaxKind.GreaterThanEqualsToken: return {a, b, type: ">="}
				case Tsc.SyntaxKind.AmpersandAmpersandToken: return {
					a: this.wrapBoolIfNeeded(a),
					b: this.wrapBoolIfNeeded(b),
					type: "&&"
				}
				case Tsc.SyntaxKind.BarBarToken: return {
					a: this.wrapBoolIfNeeded(a),
					b: this.wrapBoolIfNeeded(b),
					type: "||"
				}
				default: throw new Error("Cannot transform binary expression to structure: unknown/unsupported operator: " + expr.getText())
			}
		} else if(Tsc.isPrefixUnaryExpression(expr)){
			let a = this.expressionNodeToExpressionStructure(expr.operand, params)
			switch(expr.operator){
				case Tsc.SyntaxKind.ExclamationToken:
					if(a.type === "!"){
						return {a: a.a, type: "!!"}
					} else if(a.type === "!!"){
						return {a: a.a, type: "!"}
					} else {
						return {a, type: "!"}
					}
				default: throw new Error("Cannot transform prefix unary expression to structure: unknown/unsupported operator: " + expr.getText())
			}
		} else if(Tsc.isStringLiteral(expr)){
			return {type: "constant", value: expr.text}
		} else if(Tsc.isNumericLiteral(expr)){
			let value = parseFloat(expr.text)
			if(Number.isNaN(value)){
				throw new Error("Cannot convert numeric literal to expression: unparseable value: " + expr.getText())
			}
			return {type: "constant", value: value}
		} else if(expr.kind === Tsc.SyntaxKind.FalseKeyword){
			return {type: "constant", value: false}
		} else if(expr.kind === Tsc.SyntaxKind.TrueKeyword){
			return {type: "constant", value: true}
		} else if(expr.kind === Tsc.SyntaxKind.NullKeyword){
			return {type: "constant", value: null}
		} else if(expr.kind === Tsc.SyntaxKind.UndefinedKeyword){
			return {type: "constant", value: undefined}
		} else if(Tsc.isIdentifier(expr) || Tsc.isPropertyAccessExpression(expr) || Tsc.isElementAccessExpression(expr)){
			let path: (string | number)[] | undefined = undefined
			if(Tsc.isIdentifier(expr)){
				path = params.get(expr.text)
			} else {
				let pathEnd = this.tricks.propertyAccessToArray(expr)
				let firstPathPart = pathEnd[0]
				if(typeof(firstPathPart) === "string"){
					let pathStart = params.get(firstPathPart)
					if(pathStart){
						path = [...pathStart, ...pathEnd.slice(1)]
					}
				}
			}
			if(path){
				switch(path.length){
					case 1: throw new Error("Using function arguments as-is is not supported (yet): " + expr.getText())
					case 2:{ // it's field then
						if(!this.tricks.isPrimitiveTypeExpression(expr)){
							throw new Error("Value of this expression can be non-primitive; that's not supported: " + expr.getText())
						}
						let lastPathPart = path[path.length - 1]
						if(typeof(lastPathPart) !== "string"){
							throw new Error("Field name can only be string: " + expr.getText())
						}
						return {type: "field", field: lastPathPart}
					}
					default: throw new Error("It's unclear what you trying to achieve with this expression: " + expr.getText())
				}
			}
			if(!this.tricks.isPrimitiveTypeExpression(expr)){
				throw new Error("Value of this expression can be non-primitive; that's not supported: " + expr.getText())
			}
			// ewww! but that's the best of what I came up with
			return {type: "constant", value: expr as unknown as null}
		} else {
			throw new Error("Unsupported expression type: " + expr.getText())
		}
	}

	private wrapBoolIfNeeded(expr: Qubie.Expression): Qubie.BoolExpression {
		if(Qubie.isBoolExpression(expr)){
			return expr
		} else {
			return {type: "!!", a: expr}
		}
	}

	private extractExpressionNode(node: Tsc.FunctionExpression | Tsc.ArrowFunction): Tsc.Expression {
		if(!Tsc.isBlock(node.body)){
			return node.body
		}
		if(node.body.statements.length !== 1){
			throw new Error("Cannot transform function body to expression: expected exactly one statement, got " + node.body.statements.length + ": " + node.getText())
		}
		let statement = node.body.statements[0]!
		if(!Tsc.isReturnStatement(statement)){
			throw new Error("Cannot transform function body to expression: expected only statement to be return statement: " + node.getText())
		}
		if(!statement.expression){
			throw new Error("Cannot transform function body to expression: the only statement returns nothing: " + node.getText())
		}
		return statement.expression
	}

	private getMarkedArgPositions(call: Tsc.CallExpression): Set<number> | null {
		let symbol = this.tricks.checker.getSymbolAtLocation(call.expression)
		if(!symbol){
			return null
		}

		let markedArgNums = this.knownFnSymbols.get(symbol)
		if(markedArgNums !== undefined){
			return markedArgNums
		}
		markedArgNums = new Set()

		let decls = symbol?.declarations || []
		for(let decl of decls){
			if(!Tsc.isMethodDeclaration(decl) && !Tsc.isFunctionDeclaration(decl)){
				continue
			}
			for(let paramIndex = 0; paramIndex < decl.parameters.length; paramIndex++){
				let paramDecl = decl.parameters[paramIndex]!
				if(!paramDecl.type){
					continue
				}
				if(this.hasMarker(paramDecl.type)){
					markedArgNums.add(paramIndex)
				}
			}

		}

		if(markedArgNums.size === 0){
			markedArgNums = null
		}
		this.knownFnSymbols.set(symbol, markedArgNums)
		return markedArgNums
	}

	private hasMarker(type: Tsc.TypeNode): boolean {
		if(Tsc.isTypeReferenceNode(type)){
			let identifier = Tsc.isIdentifier(type.typeName) ? type.typeName : type.typeName.right
			return identifier.text === Qubie.markerName
		} else if(Tsc.isUnionTypeNode(type) || Tsc.isIntersectionTypeNode(type)){
			for(let subtype of type.types){
				if(this.hasMarker(subtype)){
					return true
				}
			}
			return false
		}
		return false
	}

}