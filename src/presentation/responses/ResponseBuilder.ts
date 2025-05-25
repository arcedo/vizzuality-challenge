import {
  ApiResponse,
  ApiErrorResponse,
  ApiSuccessResponse,
} from "./ApiResponse";

export class ResponseBuilder {
  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  static success<T>(data: T): ApiSuccessResponse<T> {
    return {
      success: true,
      timestamp: this.getTimestamp(),
      data,
    };
  }

  static error(
    message: string,
    code?: string,
    details?: any,
  ): ApiErrorResponse {
    return {
      success: false,
      timestamp: this.getTimestamp(),
      error: {
        message,
        code,
        details,
      },
    };
  }

  // Convenience methods for common error types
  static validationError(message: string, details?: any): ApiErrorResponse {
    return this.error(message, "VALIDATION_ERROR", details);
  }

  static notFound(resource: string): ApiErrorResponse {
    return this.error(`${resource} not found`, "NOT_FOUND");
  }

  static internalError(
    message: string = "Internal server error",
  ): ApiErrorResponse {
    return this.error(message, "INTERNAL_ERROR");
  }

  static csvParseError(message: string, details?: any): ApiErrorResponse {
    return this.error(message, "CSV_PARSE_ERROR", details);
  }

  static repositoryError(message: string): ApiErrorResponse {
    return this.error(message, "REPOSITORY_ERROR");
  }
}
