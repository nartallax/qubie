import {ordersSource} from "sources"
import {allTests} from "test_project_main"

allTests.push({
	src: ordersSource.filter(x => x.id > 5 && x.id < 8),
	selectResult: [{
		id: 6,
		addressFrom: "Washington",
		addressTo: "New York",
		needCarriers: false
	},
	{
		id: 7,
		addressFrom: "Tokyo",
		addressTo: "Kyoto",
		needCarriers: true
	}]
})