import {Qubie} from "@nartallax/qubie"
import {QubiePg} from "pg_main"
import {QubiePgQueryBuilder} from "pg_query_builder"



export class QubiePgSource<T> {

	constructor(
		private readonly description: QubiePg.SourceDescription<T>,
		private readonly actions = Qubie.ImmutableLinkedList.create<QubiePg.Action>()
	) {}

	// eslint-disable-next-line @typescript-eslint/ban-types
	protected extractExpression(x: Function | Qubie.Expression): Qubie.Expression {
		if(typeof(x) === "function"){
			throw new Error("Cannot extract expression from function. Transformer probably did not run, or you did something wrong in your code. Function is: " + x)
		}

		return x
	}

	filter(predicate: ((value: T) => boolean) & Qubie.QUBIE_EXPRESSION_MARKER): QubiePgSource<T> {
		let expr = this.extractExpression(predicate)
		if(!Qubie.isBoolExpression(expr)){
			throw new Error("Expected filter predicate to be bool expression, but it's not: " + JSON.stringify(expr))
		}
		let actions = this.actions.prepend({type: "filter", predicate: expr})
		return new QubiePgSource(this.description, actions)
	}

	buildSelectQuery(): QubiePg.Query {
		return new QubiePgQueryBuilder(this.description, this.actions.toArray().reverse()).buildSelect()
	}

	async select(): Promise<T[]> {
		let result = null as T[] | null
		let query = this.buildSelectQuery()
		await this.description.connector.doWithConnection(async conn => {
			let queryResult = await conn.query(query.text, query.arguments)
			result = queryResult.rows
		})
		if(result === null){
			throw new Error("Result is not set at the end of select()! doWithConnection() probably never invokes its argument.")
		}
		return result
	}

}