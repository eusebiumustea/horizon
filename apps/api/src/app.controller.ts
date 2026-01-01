import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorCode,
  ApiError,
} from '@repo/shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    try {
      const message = this.appService.getHello();
      return createSuccessResponse({ message });
    } catch (error) {
      if (error instanceof ApiError) {
        throw createErrorResponse(error.code, error.message, error.details);
      }

      throw createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to get hello message',
      );
    }
  }

  @Get('health')
  getHealth() {
    try {
      return createSuccessResponse({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw createErrorResponse(error.code, error.message, error.details);
      }

      throw createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to get health status',
      );
    }
  }
}
