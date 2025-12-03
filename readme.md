```ts
import json_anything from '@tehshrike/json_anything'
```

# @tehshrike/json_anything

use JSON to transfer values that JSON.stringify won't normally encode.

```ts
const { serialize, deserialize } = json_anything({
	unique_key: `13DCF055-B8B4-49C0-84DB-270E90719AC8`,
	types: {
		date: {
			can_serialize: (value): value is Date => value instanceof Date,
			serialize: (value: Date) => value.valueOf(),
			deserialize: (value: number) => new Date(value),
		},
		bigint: {
			can_serialize: (value): value is bigint => typeof value === `bigint`,
			serialize: (value: bigint) => value.toString(),
			deserialize: (value: string) => BigInt(value),
		}
	},
})

const serialized = serialize({
	child: {
		wat: new Date(1648065974847),
		eh: 420,
	},
	hullo: 13,
	cool_bigint: 123n,
})

serialized /* => {
	"child":{
		"wat":{
			"13DCF055-B8B4-49C0-84DB-270E90719AC8":"date",
			"value":1648065974847
		},
		"eh":420
	},
	"hullo":13,
	"cool_integer":{
		"13DCF055-B8B4-49C0-84DB-270E90719AC8":"bigint",
		"value":"123"
	}
}
*/
```

- Your `can_serialize` functions must be a type predicate for type T.
- Your `serialize` functions must turn T into any value or object that can be safely transformed by `JSON.stringify`.
- Your `deserialize` function must transform the JSONable value returned by `serialize` back into type T.

TypeScript can't properly infer all the types in your serializers, unfortunately – if you want nice type checking and type inference on your implementation functions, you can pass a function to `types` like so:

```ts
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
```
