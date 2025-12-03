type JsonablePrimitives = string | number | boolean | null
type JsonableValue = JsonablePrimitives | JsonableValue[] | {
	[key: string]: JsonableValue
}

type SerializerDeserializer<T, INBETWEEN extends JsonableValue> = {
	can_serialize: (value: unknown) => value is T
	serialize: (value: T) => INBETWEEN
	deserialize: (value: INBETWEEN) => T
}

type SerializerFn = <T, INBETWEEN extends JsonableValue>(
	def: SerializerDeserializer<T, INBETWEEN>
) => SerializerDeserializer<T, INBETWEEN>

const serializerFn: SerializerFn = def => def

function assert(condition: unknown, message: string): asserts condition {
	if (!condition) {
		throw new Error(message)
	}
}

// https://github.com/sindresorhus/is-plain-obj/blob/6a4cfe72714db0b90fcf6e1f78a9b118b98d44fa/index.js
const is_plain_object = (value: unknown): value is {
	[key: string]: unknown
} => {
	if (Object.prototype.toString.call(value) !== `[object Object]`) {
		return false
	}

	const prototype = Object.getPrototypeOf(value)
	return prototype === null || prototype === Object.prototype
}

const make_recursive_transform = ({
	unique_key,
	types,
}: {
	unique_key: string
	types: Record<string, SerializerDeserializer<unknown, JsonableValue>>
}) => {
	const types_array = Object.entries(types).map(([ type, functions ]) => ({ type, ...functions }))

	const recursive_transform = (value: unknown): unknown => {
		if (Array.isArray(value)) {
			return value.map(element => recursive_transform(element))
		}

		const serialization_instructions = types_array.find(
			({ can_serialize }) => can_serialize(value)
		)

		if (serialization_instructions) {
			return {
				[unique_key]: serialization_instructions.type,
				value: serialization_instructions.serialize(value),
			}
		} else if (is_plain_object(value)) {
			return Object.fromEntries(Object.entries(value).map(([ key, value ]) => [
				key,
				recursive_transform(value),
			]))
		}

		return value
	}

	return recursive_transform
}

export default <T extends Record<string, SerializerDeserializer<any, any>>>({
	unique_key,
	types
}: {
	unique_key: string
	types: ((serializer: SerializerFn) => T) | T
}) => {
	const resolvedTypes = typeof types === 'function' ? types(serializerFn) : types
	const recursive_transform = make_recursive_transform({ unique_key, types: resolvedTypes })

	return {
		serialize: (input: unknown) => JSON.stringify(recursive_transform(input)),
		deserialize: (input: string) => JSON.parse(input, (key, value: unknown) => {
			if (is_plain_object(value) && unique_key in value) {
				const type = value[unique_key] as keyof T
				const type_handler = resolvedTypes[type]
				assert(type_handler, `Type handler must exist for type: ${String(type)}`)
				return type_handler.deserialize(value.value as JsonableValue)
			}

			return value
		}),
	}
}
