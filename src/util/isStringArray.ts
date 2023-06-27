export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && !value.some((item) => typeof item !== "string");
