import { AxiosError, AxiosHeaders, CanceledError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";

import {
  ApiError,
  extractDetail,
  extractFieldErrors,
  isOfflineError,
  toApiError,
} from "./errors";

function responseWith(status: number, data: unknown): AxiosResponse {
  return {
    status,
    statusText: "",
    data,
    headers: {},
    config: { headers: new AxiosHeaders() },
  } as AxiosResponse;
}

function httpError(status: number, data: unknown): AxiosError {
  return new AxiosError(
    "Request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    responseWith(status, data),
  );
}

describe("extractFieldErrors", () => {
  it("collects DRF field errors", () => {
    expect(
      extractFieldErrors({
        amount: ["This field is required."],
        borrower: ["Invalid pk."],
      }),
    ).toEqual({
      amount: ["This field is required."],
      borrower: ["Invalid pk."],
    });
  });

  it("ignores the detail key and non-string values", () => {
    expect(extractFieldErrors({ detail: "Not found.", nested: { a: 1 } })).toEqual(
      {},
    );
  });

  it("returns nothing for non-object bodies", () => {
    expect(extractFieldErrors("oops")).toEqual({});
    expect(extractFieldErrors(null)).toEqual({});
  });
});

describe("extractDetail", () => {
  it("reads DRF's detail key", () => {
    expect(extractDetail({ detail: "Authentication credentials were not provided." })).toBe(
      "Authentication credentials were not provided.",
    );
  });

  it("falls back to non_field_errors", () => {
    expect(extractDetail({ non_field_errors: ["Bad combination."] })).toBe(
      "Bad combination.",
    );
  });

  it("never surfaces Django's HTML error page", () => {
    expect(extractDetail("<!doctype html><h1>Not Found</h1>")).toBeNull();
  });
});

describe("toApiError", () => {
  it("passes an existing ApiError through untouched", () => {
    const original = new ApiError({ message: "Already normalised." });

    expect(toApiError(original)).toBe(original);
  });

  it("maps a 401 to the auth code", () => {
    const error = toApiError(httpError(401, { detail: "Not authenticated." }));

    expect(error.code).toBe("auth");
    expect(error.isAuthError).toBe(true);
    expect(error.status).toBe(401);
  });

  it("maps a 400 with field errors to validation", () => {
    const error = toApiError(httpError(400, { amount: ["Enter a number."] }));

    expect(error.code).toBe("validation");
    expect(error.fieldError("amount")).toBe("Enter a number.");
    expect(error.messages).toEqual(["Enter a number."]);
  });

  it("gives an HTML 404 a readable message", () => {
    const error = toApiError(httpError(404, "<!doctype html><h1>Not Found</h1>"));

    expect(error.code).toBe("not-found");
    expect(error.isNotFound).toBe(true);
    expect(error.message).toBe("That resource does not exist on the server.");
  });

  it("maps a 500 to the server code", () => {
    expect(toApiError(httpError(500, { detail: "Boom." })).code).toBe("server");
  });

  it("treats a missing response as offline", () => {
    const error = toApiError(new AxiosError("Network Error", "ERR_NETWORK"));

    expect(error.code).toBe("network");
    expect(error.isOffline).toBe(true);
    expect(isOfflineError(error)).toBe(true);
  });

  it("reports timeouts separately from other network failures", () => {
    const error = toApiError(new AxiosError("timeout", "ECONNABORTED"));

    expect(error.code).toBe("timeout");
  });

  it("maps axios cancellations to aborted", () => {
    expect(toApiError(new CanceledError()).code).toBe("aborted");
  });

  it("wraps unknown throwables", () => {
    const error = toApiError(new Error("Something odd"));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("unknown");
    expect(error.message).toBe("Something odd");
  });
});
