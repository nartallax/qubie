import {QubiePg} from "@nartallax/qubie-pg"
import {getDbConnection} from "db/db_connection"
import {ordersSource} from "sources"

async function insertPack<T extends Record<string, unknown>>(tableName: string, data: [T, ...T[]]): Promise<void> {
	let firstData = data[0]
	let fields = Object.keys(firstData)
	// let fieldEnumeration =
	let query = `insert into "${tableName}" (${fields.map(x => `"${x}"`).join(",")}) values\n`
	let args = [] as unknown[]
	for(let item of data){
		if(item !== firstData){
			query += ",\n"
		}
		query += "("
		let firstField = true
		for(let field of fields){
			args.push(item[field])
			if(firstField){
				firstField = false
			} else {
				query += ","
			}
			query += "$" + args.length
		}
		query += ")"
	}

	await getDbConnection().query(query, args)
}

type SourceContent<T> = T extends QubiePg.Source<infer X>? X: never

export async function insertInitialDbData(): Promise<void> {
	await insertPack<Omit<SourceContent<typeof ordersSource>, "id">>("orders", [
		{addressFrom: "Moscow", addressTo: "Piter", needCarriers: false},
		{addressFrom: "Punkt A", addressTo: "Punkt B", needCarriers: true},
		{addressFrom: "Arzamas", addressTo: "Saratov", needCarriers: false},
		{addressFrom: "Akademgorodok", addressTo: "Novosibirsk", needCarriers: true},
		{addressFrom: "Novosibirsk", addressTo: "Akademgorodok", needCarriers: false},
		{addressFrom: "Washington", addressTo: "New York", needCarriers: false},
		{addressFrom: "Tokyo", addressTo: "Kyoto", needCarriers: true},
		{addressFrom: "Melbourne", addressTo: "Sydney", needCarriers: false},
		{addressFrom: "Paris", addressTo: "London", needCarriers: false},
		{addressFrom: "Vatican", addressTo: "Montreal", needCarriers: true}
	])
}