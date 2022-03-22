import {Qubie} from "@nartallax/qubie"
import * as Pg from "pg"
import {QubiePgSource} from "pg_source"

export namespace QubiePg {

	export class Source<T> extends QubiePgSource<T> {}

	export type Action = FilterAction

	export interface FilterAction {
		readonly type: "filter"
		readonly predicate: Qubie.BoolExpression
	}

	export interface TableDescription<T> {
		tableName: string
		fields: {
			[k in keyof T]: TableFieldDescription<T[k]>
		}
	}

	export interface SourceDescription<T> extends TableDescription<T>{
		connector: DbConnector
	}

	export function stringField(params: TableFieldDescriptionParameters = {}): TableFieldDescription<string> {
		return {type: "string", ...params}
	}

	export function intField(params: TableFieldDescriptionParameters = {}): TableFieldDescription<number> {
		return {type: "int", ...params}
	}

	export function floatField(params: TableFieldDescriptionParameters = {}): TableFieldDescription<number> {
		return {type: "float", ...params}
	}

	export function boolField(params: TableFieldDescriptionParameters = {}): TableFieldDescription<boolean> {
		return {type: "bool", ...params}
	}

	export interface TableFieldDescriptionParameters {
		dbName?: string
	}


	export interface TableFieldDescription<T> {
		type: "string" | "int" | "float" | "bool"
		/** If name of field in DB does not match name of field in code, you can set DB name here */
		dbName?: string
		thisValueHereIsJustForTypeInferrence?: T & never
	}

	export interface DbConnector {
		doWithConnection(action: (connection: Pg.Client) => Promise<void>): Promise<void>
	}

	export interface Query {
		text: string
		arguments: unknown[]
	}

}