import {QubiePg} from "@nartallax/qubie-pg"
import {withDbAndConnection} from "db/db_creation"
import {insertInitialDbData} from "db/db_data"
import {createSchemeTables} from "db/db_scheme"

export const allTests = [] as {src: QubiePg.Source<unknown>, selectQuery?: string, selectResult?: unknown[]}[]

export async function main(): Promise<void> {
	await withDbAndConnection(async() => {
		await createSchemeTables()
		await insertInitialDbData()

		let failCount = 0

		for(let {src, selectQuery, selectResult} of allTests){
			if(selectQuery !== undefined){
				let q = src.buildSelectQuery()
				if(q.text !== selectQuery){
					console.error(`Select query test failed: wrong query text. Expected:\n${selectQuery}\nGot:\n${q}`)
					failCount++
					continue
				}
			}
			if(selectResult !== undefined){
				let res = await src.select()
				if(!deepEquals(res, selectResult)){
					console.error(`Select query test failed: wrong query result. Expected:\n${JSON.stringify(selectResult, null, 4)}\nGot:\n${JSON.stringify(res, null, 4)}`)
					failCount++
					continue
				}
			}
		}

		if(failCount > 0){
			console.error(`Testing failed: ${failCount} / ${allTests.length}`)
			process.exit(1)
		} else {
			console.error(`Testing successful: ${allTests.length} tests completed.`)
		}
	})
}

/* eslint-disable @typescript-eslint/ban-types */
export function deepEquals(a: unknown, b: unknown): boolean {
	if(a === b){
		return true
	}

	let ta = typeof(a)
	let tb = typeof(b)
	if(ta !== tb){
		return false
	}

	switch(ta){
		case "object":{
			if(Array.isArray(a) || Array.isArray(b)){
				if(!Array.isArray(a) || !Array.isArray(b)){
					return false
				}
				if(a.length !== b.length){
					return false
				}
				for(let i = 0; i < a.length; i++){
					if(!deepEquals(a[i], b[i])){
						return false
					}
				}
				return true
			}

			if(!a || !b){ // проверка на null
				return false
			}

			let ka = Object.keys(a as object)
			let kb = Object.keys(b as object)
			if(ka.length !== kb.length){
				return false
			}
			for(let key in a as object){
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				if(!(key in (b as object)) || !deepEquals((a as any)[key], (b as any)[key])){
					return false
				}
			}
			return true
		}
		default: // числа, строки, булевы переменнные, функции и т.д.
			return false // a === b проверили выше
	}
}