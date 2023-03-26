export type Nullable<T> = T | null;

export function toNullable<T>(data?: T) {
  return typeof data === "undefined" ? null : data;
}
