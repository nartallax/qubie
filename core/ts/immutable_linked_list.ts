import {Qubie} from "core_main"

export const emptyList: Qubie.ImmutableLinkedList<unknown> = {
	toArray(): unknown[] {
		return []
	},

	prepend(value: unknown): Qubie.ImmutableLinkedList<unknown> {
		return new ImmutableLinkedListImpl(value, null)
	},

	* [Symbol.iterator](): IterableIterator<unknown> {
		// nothing here, it's empty list
	}
}

export class ImmutableLinkedListImpl<T> implements Qubie.ImmutableLinkedList<T> {

	private readonly next: ImmutableLinkedListImpl<T> | null
	private readonly value: T

	constructor(value: T, next: ImmutableLinkedListImpl<T> | null) {
		this.next = next
		this.value = value
	}

	toArray(): T[] {
		let result: T[] = []
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		let el: ImmutableLinkedListImpl<T> | null = this
		while(el !== null){
			result.push(el.value)
			el = el.next
		}
		return result
	}

	* [Symbol.iterator](): IterableIterator<T> {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		let el: ImmutableLinkedListImpl<T> | null = this
		while(el !== null){
			yield el.value
			el = el.next
		}
	}

	prepend(value: T): Qubie.ImmutableLinkedList<T> {
		return new ImmutableLinkedListImpl(value, this)
	}

}