import * as R from 'remeda';

type PrimitiveValue = string | number | boolean | null;
type ExtendedValue = Date | File;
type SerializedValue = { __type: 'Date' | 'File'; __value: string };
type JSONTree<T = never> =
  | T
  | PrimitiveValue
  | { [key: string]: JSONTree<PrimitiveValue | T> }
  | JSONTree<PrimitiveValue | T>[];
type SerializedJSON = {
  __json: JSONTree<SerializedValue>;
  __files: [id: string, file: File][];
};

export type JSONValue = JSONTree<ExtendedValue>;

export function deserialize(formData: FormData): JSONValue {
  const serialized = fromFormData(formData);
  const files = new Map(serialized.__files);
  return transformJSON(
    serialized.__json,
    (value) => {
      if (value.__type == 'File') {
        const file = files.get(value.__value);
        if (!file) {
          throw new Error(`File not found: ${value.__value}`);
        }
        return file;
      }
      return new Date(value.__value);
    },
    isSerializedValue
  );
}

export function serialize(value: JSONValue): FormData {
  const files = new Map<string, File>();
  const __json: JSONTree<SerializedValue> = transformJSON(
    value,
    (value) => {
      if (value instanceof File) {
        const id = crypto.randomUUID();
        files.set(id, value);
        return { __type: 'File', __value: id };
      }
      return { __type: 'Date', __value: value.toISOString() };
    },
    isExtendedValue
  );
  return toFormData({ __json, __files: Array.from(files) });
}

function isExtendedValue(
  value: JSONTree<ExtendedValue>
): value is ExtendedValue {
  return R.isDate(value) || value instanceof File;
}

function isSerializedValue(
  value: JSONTree<SerializedValue>
): value is SerializedValue {
  return R.isPlainObject(value) && '__type' in value;
}

function toFormData(serialized: SerializedJSON): FormData {
  const formData = new FormData();
  formData.set('__json', JSON.stringify(serialized.__json));
  for (const [id, file] of serialized.__files) {
    formData.append(id, file);
  }
  return formData;
}

function fromFormData(formData: FormData): SerializedJSON {
  const files = new Map<string, File>();
  const json = formData.get('__json');
  if (typeof json != 'string') {
    throw new Error('Missing __json field');
  }
  for (const [id, value] of formData.entries()) {
    if (id != '__json' && value instanceof File) {
      files.set(id, value);
    }
  }
  const __json = JSON.parse(json);
  return { __json, __files: Array.from(files) };
}

function transformJSON<T, K>(
  json: JSONTree<T>,
  transform: (value: T) => K,
  canTransform: (value: JSONTree<T>) => value is T
): JSONTree<K> {
  if (canTransform(json)) {
    return transform(json);
  } else if (R.isPlainObject(json)) {
    return R.pipe(
      json,
      R.entries(),
      R.map(
        ([key, value]) =>
          [key, transformJSON(value, transform, canTransform)] as const
      ),
      R.fromEntries()
    );
  } else if (Array.isArray(json)) {
    return json.map((value) => transformJSON(value, transform, canTransform));
  }
  return json;
}
