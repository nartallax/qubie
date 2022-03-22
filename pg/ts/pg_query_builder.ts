import {Qubie} from "@nartallax/qubie"
import {QubiePg} from "pg_main"

export class QubiePgQueryBuilder<T> {

	constructor(
		private readonly description: QubiePg.SourceDescription<T>,
		private readonly actions: readonly QubiePg.Action[]
	) {}

	buildSelect(): QubiePg.Query {
		let query = new QueryStructure(this.description)

		for(let action of this.actions){
			switch(action.type){
				case "filter":
					query.addFilter(action.predicate)
					break
			}
		}

		let args = [] as unknown[]
		let text = query.toSelect(args)

		return {text, arguments: args}
	}

}

class QueryStructure<T> {
	constructor(
		readonly description: QubiePg.TableDescription<T>,
		readonly fields: (string & keyof T)[] = Object.keys(description.fields) as (string & keyof T)[],
		readonly filters: Qubie.BoolExpression[] = []) {}

	addFilter(filter: Qubie.BoolExpression): void {
		if(filter.type === "&&"){
			this.addFilter(filter.a)
			this.addFilter(filter.b)
		} else {
			this.filters.push(filter)
		}
	}

	toSelect(args: unknown[]): string {
		let query = ""

		query += "select\n"
		{
			let first = true
			for(let fieldName of this.fields){
				let fieldDescription = this.description.fields[fieldName]
				if(first){
					first = false
				} else {
					query += ",\n"
				}
				query += "\t" + this.escapeFieldName(this.description.tableName, fieldDescription.dbName || fieldName)
			}
		}
		query += `\nfrom ${this.escapeIdentifier(this.description.tableName)}\n`

		{
			let first = true
			for(let filter of this.filters){
				if(first){
					first = false
					query += "where\n\t"
				} else {
					query += "\n\tand "
				}
				query += this.exprToStr(filter, args)
			}
		}

		return query
	}

	private exprToStr(expr: Qubie.Expression, args: unknown[]): string {
		switch(expr.type){
			case "&&":
			case "||":
			case "==":
			case "!=":
			case "<":
			case "<=":
			case ">":
			case ">=":
			case "+":
			case "-":
			case "*":
			case "/":
			case "&":
			case "|":
			case "<<":
			case ">>": return `(${this.exprToStr(expr.a, args)} ${expr.type} ${this.exprToStr(expr.b, args)})`
			case "~":
			case "!":
			case "!!": return `(!${this.exprToStr(expr.a, args)})`
			case "constant":
				args.push(expr.value)
				return "$" + args.length
			case "field": return this.escapeFieldName(this.description.tableName, expr.field)
		}
	}

	private escapeFieldName(table: string, field: string): string {
		return this.escapeIdentifier(table) + "." + this.escapeIdentifier(field)
	}

	private escapeIdentifier(identifier: string): string {
		// I could check here if identifier is "safe" to not put into quotes
		// (say, /^[a-z_]+$/ )
		// but then I discovered that SQL standard treats unquoted identifiers differently than Postgres
		// by SQL standard, everything unquoted is uppercased; by Postgres', lowercased
		// so it's just generally safer to quote everything
		return "\"" + identifier + "\""
	}
}