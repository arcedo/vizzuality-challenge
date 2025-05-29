export interface ApiSuccessResponse<T = any> {
  success: true;
  timestamp: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  timestamp: string;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;
