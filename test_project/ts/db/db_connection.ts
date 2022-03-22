import * as Pg from "pg"

export const dbCredentials = {
	host: "127.0.0.1",
	port: 5432,
	user: "postgres",
	password: "postgres"
}

export const dbName = "qubie_test_temp_db"

let conn = null as null | Pg.Client
export async function withDbConnection<T>(action: (conn: Pg.Client) => Promise<T>, noDbName = false): Promise<T> {
	if(conn){
		throw new Error("No double-connect")
	}

	try {
		conn = new Pg.Client({
			...dbCredentials,
			...(noDbName ? {} : {database: dbName})
		})
		await conn.connect()
		return await action(conn)
	} finally {
		if(conn){
			await conn.end()
			conn = null
		}
	}


}

export function getDbConnection(): Pg.Client {
	if(!conn){
		throw new Error("Not connected to DB")
	}
	return conn
}