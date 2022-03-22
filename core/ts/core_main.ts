import {emptyList} from "immutable_linked_list"

export namespace Qubie {

	export type BoolExpression = ComparisonExpression
	| BoolBinaryOperationExpression
	| BoolUnaryOperationExpression

	export function isBoolExpression(expr: Expression): expr is BoolExpression {
		return isComparisonExpression(expr)
		|| isBoolBinaryOperationExpression(expr)
		|| isBoolUnaryOperationExpression(expr)
	}

	export type Expression = ConstantExpression
	| FieldAccessExpression
	| BoolExpression
	| BinaryOperationExpression
	| UnaryOperationExpression


	const comparisonOps = {"==": 1, "<": 1, "<=": 1, ">": 1, ">=": 1, "!=": 1}
	export interface ComparisonExpression {
		readonly type: keyof typeof comparisonOps
		readonly a: Expression
		readonly b: Expression
	}
	export function isComparisonExpression(expr: Expression): expr is ComparisonExpression {
		return expr.type in comparisonOps
	}

	const boolBinOps = {"&&": 1, "||": 1}
	export interface BoolBinaryOperationExpression {
		readonly type: keyof typeof boolBinOps
		readonly a: BoolExpression
		readonly b: BoolExpression
	}
	export function isBoolBinaryOperationExpression(expr: Expression): expr is BoolBinaryOperationExpression {
		return expr.type in boolBinOps
	}

	const boolUnOps = {"!": 1, "!!": 1}
	export interface BoolUnaryOperationExpression {
		readonly type: keyof typeof boolUnOps
		readonly a: Expression
	}
	export function isBoolUnaryOperationExpression(expr: Expression): expr is BoolUnaryOperationExpression {
		return expr.type in boolUnOps
	}

	export interface BinaryOperationExpression {
		readonly type: "+" | "-" | "*" | "/" | "<<" | ">>" | "&" | "|"
		readonly a: Expression
		readonly b: Expression
	}

	export interface ConstantExpression {
		readonly type: "constant"
		readonly value: string | number | boolean | null | undefined
	}

	export interface FieldAccessExpression {
		readonly type: "field"
		readonly field: string
	}

	export interface UnaryOperationExpression {
		readonly type: "~"
		readonly a: Expression
	}

	export interface ImmutableLinkedList<T> {
		prepend(value: T): ImmutableLinkedList<T>
		toArray(): T[]
		[Symbol.iterator](): IterableIterator<T>
	}

	export namespace ImmutableLinkedList {
		export function create<T>(): ImmutableLinkedList<T> {
			return emptyList as ImmutableLinkedList<T>
		}
	}

	export const markerName = "QUBIE_EXPRESSION_MARKER"
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	export interface QUBIE_EXPRESSION_MARKER {
		// this interface is empty for a reason
	}

}