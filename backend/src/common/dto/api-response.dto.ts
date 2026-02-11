/**
 * 统一 API 响应 DTO
 * 所有接口返回都使用此格式
 */
export class ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;

  constructor(code: number, message: string, data: T) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.timestamp = Date.now();
  }

  /**
   * 成功响应
   */
  static success<T>(data: T, message = 'success'): ApiResponse<T> {
    return new ApiResponse(200, message, data);
  }

  /**
   * 错误响应
   */
  static error<T>(code: number, message: string, data?: T): ApiResponse<T | null> {
    return new ApiResponse(code, message, data ?? null);
  }
}
