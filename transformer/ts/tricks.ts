import {ToolboxTransformer} from "@nartallax/toolbox-transformer"
import * as Tsc from "typescript"

export class QubieTransformerTricks extends ToolboxTransformer.TransformerTricks {

	constructor(tsc: typeof Tsc, checker: Tsc.TypeChecker, transformContext: Tsc.TransformationContext) {
		super(tsc, checker, transformContext)
	}

	// copypasted right from the original tricks
	// needed it to support identifiers
	createLiteralOfValue(value: unknown): Tsc.Expression {
		switch(typeof(value)){
			case "undefined": return this.tsc.factory.createVoidZero()
			case "string": return this.tsc.factory.createStringLiteral(value)
			case "number": return this.tsc.factory.createNumericLiteral(value)
			case "boolean": return value ? this.tsc.factory.createTrue() : this.tsc.factory.createFalse()
			case "object":{
				if(value === null){
					return this.tsc.factory.createNull()
				}

				if(Array.isArray(value)){
					return this.tsc.factory.createArrayLiteralExpression(
						value.map(item => this.createLiteralOfValue(item))
					)
				}

				if(value instanceof Set){
					let valExprs = [] as Tsc.Expression[]
					for(let val of value.values()){
						valExprs.push(this.createLiteralOfValue(val))
					}
					return this.tsc.factory.createNewExpression(
						this.tsc.factory.createIdentifier("Set"),
						undefined,
						[this.tsc.factory.createArrayLiteralExpression(valExprs, false)]
					)
				}

				if(value instanceof Map){
					let valExprs = [] as Tsc.Expression[]
					for(let [k, v] of value.entries()){
						valExprs.push(this.tsc.factory.createArrayLiteralExpression([
							this.createLiteralOfValue(k),
							this.createLiteralOfValue(v)
						]))
					}
					return this.tsc.factory.createNewExpression(
						this.tsc.factory.createIdentifier("Map"),
						undefined,
						[this.tsc.factory.createArrayLiteralExpression(valExprs, false)]
					)
				}

				if(this.isNode(value) && this.tsc.isIdentifier(value)){
					return value
				}

				return this.tsc.factory.createObjectLiteralExpression(
					(Object.keys(value) as (string)[]).map(propName => {
						let propValue = value[propName as keyof typeof value]

						let nameNode: Tsc.PropertyName
						if(propName.match(/^[a-zA-Z_\d]+$/)){
							nameNode = this.tsc.factory.createIdentifier(propName)
						} else {
							nameNode = this.tsc.factory.createStringLiteral(propName)
						}

						return this.tsc.factory.createPropertyAssignment(
							nameNode,
							this.createLiteralOfValue(propValue)
						)
					})
				)
			}
			default: throw new Error("Cannot create literal of type " + typeof(value))
		}
	}

	/** Parse identifiers of maybe destructurized name
	 * Key is identifier, value is path to identifier. Empty path is "just this identifier"
	 */
	bindingNameToIdentifiers(name: Tsc.BindingName, result: Map<string, (string | number)[]> = new Map<string, (string | number)[]>(), path: (string | number)[] = []): Map<string, (string | number)[]> {
		if(this.tsc.isIdentifier(name)){
			result.set(name.text, path)
		} else if(this.tsc.isObjectBindingPattern(name)){
			for(let el of name.elements){
				let propName = el.propertyName
				if(!propName || !Tsc.isIdentifier(propName)){
					throw new Error("Cannot parse destructurizing assignment: object destructurization has no name/unsupported name type: " + name.getText())
				}
				return this.bindingNameToIdentifiers(el.name, result, [...path, propName.text])
			}
		} else {
			for(let i = 0; i < name.elements.length; i++){
				let el = name.elements[i]!
				if(Tsc.isOmittedExpression(el)){
					continue
				}
				return this.bindingNameToIdentifiers(el.name, result, [...path, i])
			}
		}
		return result
	}

	isPrimitiveTypeExpression(expr: Tsc.Expression): boolean {
		return this.isPrimimitiveType(this.checker.getTypeAtLocation(expr))
	}

	isPrimimitiveType(type: Tsc.Type): boolean {
		if(type.flags & (Tsc.TypeFlags.BooleanLiteral | Tsc.TypeFlags.StringLiteral | Tsc.TypeFlags.NumberLiteral | Tsc.TypeFlags.Null | Tsc.TypeFlags.Undefined | Tsc.TypeFlags.Number | Tsc.TypeFlags.String | Tsc.TypeFlags.Boolean)
		){
			return true
		} else if(type.isUnionOrIntersection()){
			if(type.types.length === 0){
				return false
			}
			for(let subtype of type.types){
				if(!this.isPrimimitiveType(subtype)){
					return false
				}
			}
			return true
		}

		return false
	}

	private isNode(x: unknown): x is Tsc.Node {
		return !!x && !!this.tsc.SyntaxKind[(x as Tsc.Node).kind] && !!(x as Tsc.Node).parent
	}

	propertyAccessToArray(node: Tsc.PropertyAccessExpression | Tsc.ElementAccessExpression, result: (string | number)[] = []): (string | number)[] {
		if(this.tsc.isPropertyAccessExpression(node)){
			result.push(node.name.text)
		} else {
			let arg = node.argumentExpression
			if(this.tsc.isStringLiteral(arg)){
				result.push(arg.text)
			} else if(this.tsc.isNumericLiteral(arg)){
				let value = parseFloat(arg.text)
				if(Number.isNaN(value)){
					throw new Error("Cannot parse numeric argument in element access expression: " + node.getText())
				}
				result.push(value)
			} else {
				throw new Error("Cannot convert element access expression to literal: only string/numeric literals are supported: " + node.getText())
			}
		}
		if(this.tsc.isPropertyAccessExpression(node.expression) || this.tsc.isElementAccessExpression(node.expression)){
			return this.propertyAccessToArray(node.expression, result)
		} else if(this.tsc.isIdentifier(node.expression)){
			result.push(node.expression.text)
			return result.reverse()
		} else {
			throw new Error("Cannot convert property access expression to literals: unsupported expression type: " + node.getText())
		}
	}

}