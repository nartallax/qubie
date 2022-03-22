import {dbCredentials, dbName, withDbConnection} from "db/db_connection"
import * as Pg from "pg"

export async function withDbAndConnection<T>(action: () => Promise<T>): Promise<T> {
	await createDb()
	try {
		return await withDbConnection(action)
	} finally {
		await dropDb()
	}
}

async function createDb(): Promise<void> {
	await withDbConnection(async conn => {
		await doDropDbQuery(conn)
		await conn.query(`
			CREATE DATABASE "${dbName}"
				WITH 
				OWNER = ${dbCredentials.user}
				ENCODING = 'UTF8'
				LC_COLLATE = 'en_US.UTF-8'
				LC_CTYPE = 'en_US.UTF-8'
				TABLESPACE = pg_default
				CONNECTION LIMIT = -1
				TEMPLATE template0`)
	}, true)
}

async function dropDb(): Promise<void> {
	await withDbConnection(conn => doDropDbQuery(conn), true)
}

async function doDropDbQuery(conn: Pg.Client): Promise<void> {
	await conn.query(`DROP DATABASE IF EXISTS "${dbName}"`)
}