import { APIErrorResponse } from "@puyodead1/fosscord-api";
import { messageFromFieldError } from "../util/utils";

interface FieldError {
  [key: string]: {
    _errors: {
      message: string;
      code: string;
    }[];
  };
}

export default class APIError extends Error {
  code: number;
  fieldErrors?: {
    field: string | undefined;
    error: string;
  };

  constructor(data: APIErrorResponse) {
    super();
    this.name = "APIError";
    this.code = data.code;
    this.message = data.message;

    if (data.errors) {
      // FIXME: fix in types
      const fieldError = messageFromFieldError(data.errors as FieldError);
      if (fieldError) this.fieldErrors = fieldError;
    }
  }
}
