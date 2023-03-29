export interface IAPIError {
  code: number;
  message: string;
  errors?: {
    [key: string]: {
      _errors: {
        message: string;
        code: string;
      }[];
    };
  };
}

export type Nullable<T> = T | null;

export function toNullable<T>(data?: T) {
  return typeof data === "undefined" ? null : data;
}

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}

export function convertFieldErrors(errors: IAPIError) {
  const fieldErrors = errors.errors;
  if (!fieldErrors) return [];

  const errorArray: { field: string; error: string }[] = [];
  Object.keys(fieldErrors).forEach((key) => {
    if (key !== "_errors") {
      errorArray.push({
        field: key,
        error: fieldErrors[key]._errors[0].message,
      });
    }
  });
  return errorArray;
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
