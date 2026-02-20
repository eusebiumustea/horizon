import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  createErrorResponse,
  ErrorCode,
  getHttpStatusForErrorCode,
  ApiError,
} from '@repo/shared';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Handle ApiError instances first
    if (exception instanceof ApiError) {
      const statusCode = getHttpStatusForErrorCode(exception.code);
      const errorResponse = createErrorResponse(
        exception.code,
        exception.message,
        exception.details,
      );
      response.status(statusCode).json(errorResponse);
      return;
    }

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = ErrorCode.INTERNAL_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as Record<string, string>;
        message = responseObj.message || responseObj.error || 'HTTP exception';
      }

      // Map HTTP status codes to error codes
      switch (statusCode) {
        case HttpStatus.BAD_REQUEST:
          errorCode = ErrorCode.VALIDATION_ERROR;
          break;
        case HttpStatus.UNAUTHORIZED:
          errorCode = ErrorCode.UNAUTHORIZED;
          break;
        case HttpStatus.FORBIDDEN:
          errorCode = ErrorCode.FORBIDDEN;
          break;
        case HttpStatus.NOT_FOUND:
          errorCode = ErrorCode.NOT_FOUND;
          break;
        case HttpStatus.CONFLICT:
          errorCode = ErrorCode.CONFLICT;
          break;
        case HttpStatus.TOO_MANY_REQUESTS:
          errorCode = ErrorCode.RATE_LIMIT_EXCEEDED;
          break;
        case HttpStatus.INTERNAL_SERVER_ERROR:
        default:
          errorCode = ErrorCode.INTERNAL_ERROR;
          break;
      }
    } else if (exception instanceof Error) {
      message = exception.message;

      // Handle specific error messages from validation pipes, etc.
      if (message.includes('Validation failed')) {
        errorCode = ErrorCode.VALIDATION_ERROR;
        statusCode = HttpStatus.BAD_REQUEST;
      } else if (
        message.includes('database') ||
        message.includes('connection')
      ) {
        errorCode = ErrorCode.DATABASE_ERROR;
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }

    const errorResponse = createErrorResponse(errorCode, message);
    response.status(statusCode).json(errorResponse);
  }
}
