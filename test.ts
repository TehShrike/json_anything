import { test } from 'node:test'
import assert from 'node:assert/strict'

import json_anything from './index.ts'

test(`serialize and deserialize with nicely inferred types`, () => {
	const { serialize, deserialize } = json_anything({
		unique_key: `0D32262C-83D0-4158-A70B-08EBF2E48690`,
		types: serializer => ({
			date: serializer({
				can_serialize: (value): value is Date => value instanceof Date,
				serialize: value => value.valueOf(),
				deserialize: value => new Date(value),
			}),
			bigint: serializer({
				can_serialize: (value): value is bigint => typeof value === `bigint`,
				serialize: value => value.toString(),
				deserialize: value => BigInt(value),
			}),
		}),
	})

	const input = {
		child: {
			wat: new Date(1648065974847),
			eh: 420,
		},
		hullo: 13,
		cool_integer: 123n,
	}

	const serialized = serialize(input)

	const serialized_js_value = JSON.parse(serialized) as any
	assert.strictEqual(serialized_js_value.child.wat[`0D32262C-83D0-4158-A70B-08EBF2E48690`], `date`)
	assert.strictEqual(serialized_js_value.child.wat.value, 1648065974847)

	const deserialized = deserialize(serialized) as any

	assert.ok(deserialized.child.wat instanceof Date)
	assert.strictEqual(deserialized.child.wat.valueOf(), 1648065974847)
	assert.strictEqual(deserialized.child.eh, 420)
	assert.strictEqual(deserialized.hullo, 13)
	assert.strictEqual(deserialized.cool_integer, 123n)

	assert.deepStrictEqual(deserialized, input)
})

test(`serialize and deserialize without nicely inferred types`, () => {
	const { serialize, deserialize } = json_anything({
		unique_key: `13DCF055-B8B4-49C0-84DB-270E90719AC8`,
		types: {
			date: {
				can_serialize: (value): value is Date => value instanceof Date,
				serialize: value => value.valueOf(),
				deserialize: value => new Date(value),
			},
			bigint: {
				can_serialize: (value): value is bigint => typeof value === `bigint`,
				serialize: value => value.toString(),
				deserialize: value => BigInt(value),
			},
		},
	})

	const serialized = serialize({
		child: {
			wat: new Date(1648065974847),
			eh: 420,
		},
		hullo: 13,
		cool_integer: 123n,
	})

	console.log(serialized)

	const serialized_js_value = JSON.parse(serialized) as any
	assert.strictEqual(serialized_js_value.child.wat[`13DCF055-B8B4-49C0-84DB-270E90719AC8`], `date`)
	assert.strictEqual(serialized_js_value.child.wat.value, 1648065974847)

	const deserialized = deserialize(serialized) as any

	assert.ok(deserialized.child.wat instanceof Date)
	assert.strictEqual(deserialized.child.wat.valueOf(), 1648065974847)
	assert.strictEqual(deserialized.child.eh, 420)
	assert.strictEqual(deserialized.hullo, 13)
	assert.strictEqual(deserialized.cool_integer, 123n)
})

test(`serializing arrays`, () => {
	const { serialize, deserialize } = json_anything({
		unique_key: `derp`,
		types: serializer => ({
			date: serializer({
				can_serialize: (value): value is Date => value instanceof Date,
				serialize: value => value.valueOf(),
				deserialize: value => new Date(value),
			}),
		}),
	})

	assert.deepStrictEqual(
		deserialize(serialize([ 111, new Date(1648065974847) ])),
		[ 111, new Date(1648065974847) ]
	)

	assert.deepStrictEqual(
		deserialize(serialize({
			some_array: [{ cool_number: 111 }, new Date(1648065974847) ],
		})),
		{
			some_array: [{ cool_number: 111 }, new Date(1648065974847) ],
		}
	)
})

test(`serializing a string`, () => {
	const { serialize, deserialize } = json_anything({
		unique_key: `derp`,
		types: serializer => ({
			date: serializer({
				can_serialize: (value): value is Date => value instanceof Date,
				serialize: value => value.valueOf(),
				deserialize: value => new Date(value),
			}),
		}),
	})

	assert.deepStrictEqual(
		deserialize(serialize(`testz`)),
		`testz`
	)
})
