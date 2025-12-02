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
  gallery?: string[] | string;
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
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error: string;
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  IFRAME = 'iframe',
}

export interface Media {
  id: number;
  type: string;
  title: string;
  description: null;
  coverImage: string;
  url: string;
  createdAt: Date;
  tags: null;
}

export interface User {
  name?: string;
  email: string;
}

export interface Personnel {
  id: string;
  name: string;
  position: string;
  education: string;
  workplace: string;
  experience: string;
  phone: string;
  email: string;
  resume: string;
  additionalInfo?: string;
  image?: string;
  type: PersonnelType;
  createdAt: string;
  updatedAt: string;
}

export enum PersonnelType {
  MANAGER = 'manager',
  ASSISTANT = 'assistant',
  MANAGERS = 'managers',
}

export interface PersonnelFilters {
  type?: PersonnelType;
  name?: string;
  position?: string;
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

export interface LandingSetting {
  id: string;
  key: string;
  title: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLandingSettingInput {
  key: string;
  title: string;
  description: string;
  image: string;
}

export interface UpdateLandingSettingInput {
  key?: string;
  title?: string;
  description?: string;
  image?: string;
}
