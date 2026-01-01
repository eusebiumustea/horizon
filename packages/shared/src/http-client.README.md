# HttpClient

A robust, type-safe HTTP client for making API requests with automatic error handling and response parsing.

## Features

- **Type Safety**: Full TypeScript support with generic request/response types
- **Error Handling**: Automatic parsing of structured API error responses
- **Timeout Support**: Configurable request timeouts
- **Query Parameters**: Automatic URL parameter serialization
- **Request/Response Interceptors**: Built-in error handling and response parsing
- **Authentication**: Support for Bearer token authentication

## Usage

### Basic Usage

```typescript
import { defaultHttpClient } from "@repo/shared";

// GET request
const users = await defaultHttpClient.get<User[]>("/users");

// POST request
const newUser = await defaultHttpClient.post<User>("/users", {
  name: "John Doe",
  email: "john@example.com",
});

// GET with query parameters
const filteredUsers = await defaultHttpClient.get<User[]>("/users", {
  params: { page: 1, limit: 10 },
});

// PUT request
const updatedUser = await defaultHttpClient.put<User>("/users/123", {
  name: "Jane Doe",
});

// DELETE request
await defaultHttpClient.delete("/users/123");
```

### Custom Configuration

```typescript
import { createHttpClient } from "@repo/shared";

const apiClient = createHttpClient({
  baseURL: "https://api.example.com",
  timeout: 10000, // 10 seconds
  defaultHeaders: {
    Authorization: "Bearer your-token",
    "X-API-Key": "your-api-key",
  },
});
```

### Authentication

```typescript
// Set auth token
defaultHttpClient.setAuthToken("your-jwt-token");

// Clear auth token
defaultHttpClient.clearAuthToken();
```

### Error Handling

The HttpClient automatically handles API errors and throws `ApiError` instances:

```typescript
try {
  const user = await defaultHttpClient.get<User>("/users/123");
} catch (error) {
  if (error instanceof ApiError) {
    console.log("Error code:", error.code);
    console.log("Error message:", error.message);
    console.log("Error details:", error.details);
  }
}
```

### Integration with Services

```typescript
import { HttpClient } from "@repo/shared";

class ApiService {
  constructor(private httpClient: HttpClient) {}

  async getUsers() {
    return this.httpClient.get<User[]>("/users");
  }

  async createUser(userData: CreateUserDto) {
    return this.httpClient.post<User>("/users", userData);
  }
}

// Use with default client
const apiService = new ApiService(defaultHttpClient);

// Or with custom client
const customClient = createHttpClient({ baseURL: "https://api.example.com" });
const customApiService = new ApiService(customClient);
```

## Configuration Options

```typescript
interface HttpClientConfig {
  baseURL: string; // Base URL for all requests
  defaultHeaders?: Record<string, string>; // Default headers for all requests
  timeout?: number; // Request timeout in milliseconds (default: 30000)
}
```

## Error Types

The HttpClient throws `ApiError` instances for API errors, which include:

- `code`: Error code from the API
- `message`: Human-readable error message
- `details`: Additional error details (optional)

## Response Format

The HttpClient expects API responses in the following format:

**Success Response:**

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```
