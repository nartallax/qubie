import {QubiePg} from "@nartallax/qubie-pg"
import {getDbConnection} from "db/db_connection"

let connector: QubiePg.DbConnector = {
	doWithConnection(action) {
		return action(getDbConnection())
	}
}

export const ordersSource = new QubiePg.Source({
	connector, tableName: "orders",
	fields: {
		id: QubiePg.intField(),
		addressFrom: QubiePg.stringField(),
		addressTo: QubiePg.stringField(),
		needCarriers: QubiePg.boolField()
	}
})