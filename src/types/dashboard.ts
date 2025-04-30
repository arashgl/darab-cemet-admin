export interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  section: string;
  leadPicture?: string;
  createdAt: string;
}

export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface User {
  name?: string;
  email: string;
}
