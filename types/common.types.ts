export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface Pagination {
  page: number;
  perPage: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
