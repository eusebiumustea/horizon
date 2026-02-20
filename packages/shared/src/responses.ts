import { ErrorCode } from "./error-codes";
import { HttpStatus } from "./http-status";

export { ErrorCode };

export class ApiError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function createApiError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
): ApiError {
  return new ApiError(code, message, details);
}

export interface ResponseMeta {
  timestamp?: string;
  requestId?: string;
  [key: string]: unknown;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: ResponseMeta;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  pagination: PaginationMeta;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export function createSuccessResponse<T>(
  data: T,
  options?: { message?: string; meta?: ResponseMeta },
): SuccessResponse<T> {
  return {
    success: true,
    data,
    ...(options?.message && { message: options.message }),
    ...(options?.meta && { meta: options.meta }),
  };
}

export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: { total: number; page: number; limit: number },
  options?: { message?: string; meta?: ResponseMeta },
): PaginatedResponse<T> {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return {
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
    ...(options?.message && { message: options.message }),
    ...(options?.meta && { meta: options.meta }),
  };
}

export function isSuccessResponse<T>(
  response: ApiResponse<T>,
): response is SuccessResponse<T> {
  return response.success === true;
}

export function isErrorResponse<T>(
  response: ApiResponse<T>,
): response is ErrorResponse {
  return response.success === false;
}

export const errorCodeToHttpStatus: Record<ErrorCode, HttpStatus> = {
  [ErrorCode.INVALID_TOKEN]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.TOKEN_EXPIRED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.FORBIDDEN]: HttpStatus.FORBIDDEN,
  [ErrorCode.INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.SESSION_EXPIRED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
  [ErrorCode.INVALID_INPUT]: HttpStatus.BAD_REQUEST,
  [ErrorCode.MISSING_REQUIRED_FIELD]: HttpStatus.BAD_REQUEST,
  [ErrorCode.INVALID_FORMAT]: HttpStatus.BAD_REQUEST,
  [ErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [ErrorCode.CONFLICT]: HttpStatus.CONFLICT,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS,
  [ErrorCode.TOO_MANY_REQUESTS]: HttpStatus.TOO_MANY_REQUESTS,
  [ErrorCode.INTERNAL_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.SERVICE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [ErrorCode.DATABASE_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: HttpStatus.SERVICE_UNAVAILABLE,
  [ErrorCode.INSUFFICIENT_BALANCE]: HttpStatus.BAD_REQUEST,
  [ErrorCode.OPERATION_NOT_ALLOWED]: HttpStatus.FORBIDDEN,
  [ErrorCode.EXPIRED]: HttpStatus.BAD_REQUEST,
};

export function getHttpStatusForErrorCode(code: ErrorCode): HttpStatus {
  return errorCodeToHttpStatus[code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
}
