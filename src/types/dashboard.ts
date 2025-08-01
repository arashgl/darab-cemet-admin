export interface Attachment {
  id: string;
  filename: string;
  originalname: string;
  path: string;
  url: string;
  mimetype: string;
  size: number;
  description?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  section: string;
  tags?: string[];
  leadPicture?: string;
  categoryId?: number | null;
  attachments?: Attachment[] | string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number | null;
  parent?: Category | null;
  children?: Category[];
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
  statusCode: number;
  message: string | string[];
  error?: string;
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export interface Media {
  id: string;
  filename: string;
  originalname: string;
  path: string;
  url: string;
  mimetype: string;
  size: number;
  type: MediaType;
  createdAt: string;
}

export interface User {
  name?: string;
  email: string;
}

export interface Personnel {
  id: string;
  title: string;
  personnelInfo: string;
  personnelImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  type: 'gallery' | 'iframe' | 'url';
  title: string;
  description?: string;
  coverImage: string; // Thumbnail or preview
  url: string; // The actual link or source
  createdAt?: string;
  tags?: string[];
}

export interface MediaResponse {
  data: MediaItem[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}

// Ticket system types
export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type MessageSender = 'user' | 'admin';

export interface TicketMessage {
  id: string;
  sender: MessageSender;
  message: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  status: TicketStatus;
  messages: TicketMessage[];
}

export interface CreateTicketRequest {
  subject: string;
  message: string;
}

export interface SendReplyRequest {
  message: string;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

export interface TicketsResponse {
  data: Ticket[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface TicketStats {
  open: number;
  pending: number;
  resolved: number;
  closed: number;
  total: number;
}
