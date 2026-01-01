import {
  ApiResponse,
  ErrorCode,
  ApiError,
  isErrorResponse,
  isSuccessResponse,
} from "./responses";

export interface HttpClientConfig {
  baseURL: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
}

export interface RequestConfig extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean>;
  body?: unknown;
}

export class HttpClient {
  private config: HttpClientConfig;

  constructor(config: HttpClientConfig) {
    this.config = {
      timeout: 30000, // 30 seconds default
      defaultHeaders: {
        "Content-Type": "application/json",
      },
      ...config,
    };
  }

  private buildURL(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): string {
    const url = new URL(endpoint, this.config.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, body, ...fetchConfig } = config;

    const url = this.buildURL(endpoint, params);

    const headers = {
      ...this.config.defaultHeaders,
      ...fetchConfig.headers,
    };

    const requestConfig: RequestInit = {
      ...fetchConfig,
      headers,
    };

    if (body && typeof body === "object") {
      requestConfig.body = JSON.stringify(body);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        // Handle structured error responses
        if (isErrorResponse(data)) {
          throw new ApiError(
            data.error.code,
            data.error.message,
            data.error.details
          );
        }
        // Fallback for unexpected error formats
        throw new ApiError(
          ErrorCode.INTERNAL_ERROR,
          `HTTP ${response.status}: ${response.statusText}`,
          { status: response.status, statusText: response.statusText }
        );
      }

      // Handle successful responses
      if (isSuccessResponse(data)) {
        return data.data as T;
      }

      // Fallback for unexpected success response formats
      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new ApiError(ErrorCode.INTERNAL_ERROR, "Request timeout", {
            originalError: error.message,
          });
        }

        throw new ApiError(
          ErrorCode.INTERNAL_ERROR,
          error.message || "Network request failed",
          { originalError: error.message }
        );
      }

      throw new ApiError(ErrorCode.INTERNAL_ERROR, "Unknown error occurred", {
        originalError: String(error),
      });
    }
  }

  async get<T>(
    endpoint: string,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "POST", body });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "PUT", body });
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "PATCH", body });
  }

  async delete<T>(
    endpoint: string,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }

  // Utility method to set auth token if needed in the future
  setAuthToken(token: string): void {
    this.config.defaultHeaders = {
      ...this.config.defaultHeaders,
      Authorization: `Bearer ${token}`,
    };
  }

  // Utility method to clear auth token
  clearAuthToken(): void {
    if (this.config.defaultHeaders) {
      delete this.config.defaultHeaders.Authorization;
    }
  }
}

// Factory function to create configured HttpClient instances
export function createHttpClient(config: HttpClientConfig): HttpClient {
  return new HttpClient(config);
}

// Default client for the app (can be configured per environment)
export const defaultHttpClient = createHttpClient({
  baseURL: "http://localhost:3000", // Configure this based on your environment
});
