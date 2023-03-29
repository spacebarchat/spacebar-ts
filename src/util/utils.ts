export type Nullable<T> = T | null;

export function toNullable<T>(data?: T) {
  return typeof data === "undefined" ? null : data;
}

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}

export function messageFromFieldError(
  e:
    | {
        [key: string]: {
          _errors: {
            code: string;
            message: string;
          }[];
        };
      }
    | {
        [key: string]: {
          code: string;
          message: string;
        }[];
      },
  prevKey?: string
): { field: string | undefined; error: string } | null {
  for (var key in e) {
    var obj = e[key];
    if (obj) {
      if (key === "_errors" && Array.isArray(obj)) {
        const r = obj[0];
        return r ? { field: prevKey, error: r.message } : null;
      }
      if (typeof obj === "object") {
        return messageFromFieldError(obj as any, key);
      }
    }
  }
  return null;
}

export function getAxiosErrorContent<T>(error: any): T {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx

    // fuck ;charset=utf-8
    if (error.response.headers["content-type"].startsWith("application/json")) {
      return error.response.data;
    }
    return error.res;
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    return error.request;
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message;
  }
}
