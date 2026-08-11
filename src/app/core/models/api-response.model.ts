export interface ApiResponse<T = any> {
  timestamp: string;
  status: 'success' | 'error';
  message: string;
  data: T;
  errors: any | null;
  meta: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: any;
  } | null;
}
