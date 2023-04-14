import { APIErrorResponse } from "@puyodead1/spacebar-api";
import { convertFieldErrors, IAPIError } from "../util/utils";

export interface FieldError {
  [key: string]: {
    _errors: {
      message: string;
      code: string;
    }[];
  };
}

export class APIError extends Error {
  code: number;
  fieldErrors: {
    field: string | undefined;
    error: string;
  }[];

  constructor(data: APIErrorResponse) {
    super();
    this.name = "APIError";
    this.code = data.code;
    this.message = data.message;
    this.fieldErrors = convertFieldErrors(data as IAPIError);
  }
}
