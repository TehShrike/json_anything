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

serialized /* => {
	"child": {
		"wat": {
			"13DCF055-B8B4-49C0-84DB-270E90719AC8": "date",
			"value":1648065974847
		},
		"eh": 420
	},
	"hullo": 13
}
*/
```
