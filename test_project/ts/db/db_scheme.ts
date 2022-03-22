import {getDbConnection} from "db/db_connection"

export async function createSchemeTables(): Promise<void> {
	await getDbConnection().query(`
	create table orders(
		id serial,
		"addressFrom" text not null,
		"addressTo" text not null,
		"needCarriers" boolean not null
	)
	`)
}