import { test } from 'node:test'
import assert from 'node:assert/strict'

import json_anything from './index.ts'

test(`serialize and deserialize`, () => {
	const { serialize, deserialize } = json_anything({
		unique_key: `derp`,
		types: {
			date: {
				can_serialize: (value): value is Date => value instanceof Date,
				serialize: value => value.valueOf(),
				deserialize: value => new Date(value),
			},
		},
	})

	const serialized = serialize({
		child: {
			wat: new Date(1648065974847),
			eh: 420,
		},
		hullo: 13,
	})

	console.log(serialized)

	const serialized_js_value = JSON.parse(serialized) as any
	assert.strictEqual(serialized_js_value.child.wat.derp, `date`)
	assert.strictEqual(serialized_js_value.child.wat.value, 1648065974847)

	const deserialized = deserialize(serialized) as any

	assert.ok(deserialized.child.wat instanceof Date)
	assert.strictEqual(deserialized.child.wat.valueOf(), 1648065974847)
	assert.strictEqual(deserialized.child.eh, 420)
	assert.strictEqual(deserialized.hullo, 13)
})

test(`serializing arrays`, () => {
	const { serialize, deserialize } = json_anything({
		unique_key: `derp`,
		types: {
			date: {
				can_serialize: (value): value is Date => value instanceof Date,
				serialize: value => value.valueOf(),
				deserialize: value => new Date(value),
			},
		},
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
		types: {
			date: {
				can_serialize: (value): value is Date => value instanceof Date,
				serialize: value => value.valueOf(),
				deserialize: value => new Date(value),
			},
		},
	})

	assert.deepStrictEqual(
		deserialize(serialize(`testz`)),
		`testz`
	)
})
