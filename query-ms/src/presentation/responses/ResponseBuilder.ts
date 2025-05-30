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
}
