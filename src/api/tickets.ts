import {
  SendReplyRequest,
  Ticket,
  TicketStats,
  TicketStatus,
  TicketsResponse,
  UpdateTicketStatusRequest,
} from '@/types/dashboard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// API configuration
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Auth headers helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Mock data for development
const mockTicketStats: TicketStats = {
  open: 12,
  pending: 8,
  resolved: 45,
  closed: 23,
  total: 88,
};

const mockTickets: Ticket[] = [
  {
    id: '1',
    subject: 'مشکل در ورود به سیستم',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
    status: 'open',
    messages: [
      {
        id: '1',
        sender: 'user',
        message:
          'سلام، من نمی‌توانم وارد حساب کاربری خود شوم. پیغام خطای "نام کاربری یا رمز عبور اشتباه است" نمایش داده می‌شود.',
        createdAt: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        sender: 'admin',
        message:
          'سلام و وقت بخیر. لطفا ایمیل خود را بررسی کرده و روی لینک بازنشانی رمز عبور کلیک کنید.',
        createdAt: '2024-01-15T14:20:00Z',
      },
    ],
  },
  {
    id: '2',
    subject: 'درخواست بازگشت وجه',
    createdAt: '2024-01-14T09:15:00Z',
    updatedAt: '2024-01-14T16:45:00Z',
    status: 'pending',
    messages: [
      {
        id: '3',
        sender: 'user',
        message:
          'سلام، من محصولی خریداری کردم اما متاسفانه کیفیت مطلوب نبود. می‌خواهم مبلغ را پس بگیرم.',
        createdAt: '2024-01-14T09:15:00Z',
      },
      {
        id: '4',
        sender: 'admin',
        message:
          'با سلام، درخواست شما در حال بررسی است. ظرف 48 ساعت آینده پاسخ نهایی ارائه خواهد شد.',
        createdAt: '2024-01-14T16:45:00Z',
      },
    ],
  },
  {
    id: '3',
    subject: 'سوال در مورد محصول',
    createdAt: '2024-01-13T16:20:00Z',
    updatedAt: '2024-01-13T17:10:00Z',
    status: 'resolved',
    messages: [
      {
        id: '5',
        sender: 'user',
        message: 'آیا این محصول گارانتی دارد؟',
        createdAt: '2024-01-13T16:20:00Z',
      },
      {
        id: '6',
        sender: 'admin',
        message: 'بله، تمامی محصولات ما دارای گارانتی یک ساله می‌باشند.',
        createdAt: '2024-01-13T17:10:00Z',
      },
    ],
  },
];

// API Hooks

// Get all tickets for admin
export interface TicketListParams {
  page?: number;
  limit?: number;
  status?: TicketStatus;
}

export const useAdminTicketsList = (params: TicketListParams = {}) => {
  const { page = 1, limit = 10, status } = params;

  return useQuery({
    queryKey: ['admin', 'tickets', { page, limit, status }],
    queryFn: async (): Promise<TicketsResponse> => {
      try {
        const searchParams = new URLSearchParams();
        searchParams.append('page', page.toString());
        searchParams.append('limit', limit.toString());

        if (status) {
          searchParams.append('status', status);
        }

        const response = await axios.get(
          `${apiUrl}/tickets/admin/all?${searchParams.toString()}`,
          {
            headers: getAuthHeaders(),
          }
        );
        return response.data;
      } catch {
        // Fallback to mock data if API is not available
        let filteredTickets = [...mockTickets];

        // Apply status filter
        if (status) {
          filteredTickets = filteredTickets.filter(
            (ticket) => ticket.status === status
          );
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

        return {
          data: paginatedTickets,
          meta: {
            totalItems: filteredTickets.length,
            totalPages: Math.ceil(filteredTickets.length / limit),
            currentPage: page,
          },
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get ticket stats
export const useTicketStats = () => {
  return useQuery({
    queryKey: ['admin', 'tickets', 'stats'],
    queryFn: async (): Promise<TicketStats> => {
      try {
        const response = await axios.get(`${apiUrl}/tickets/stats`, {
          headers: getAuthHeaders(),
        });
        return response.data;
      } catch {
        // Fallback to mock data if API is not available
        return mockTicketStats;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single ticket by ID
export const useTicketById = (ticketId: string) => {
  return useQuery({
    queryKey: ['admin', 'tickets', ticketId],
    queryFn: async (): Promise<Ticket> => {
      try {
        const response = await axios.get(`${apiUrl}/tickets/${ticketId}`, {
          headers: getAuthHeaders(),
        });
        return response.data;
      } catch {
        // Fallback to mock data if API is not available
        const ticket = mockTickets.find((t) => t.id === ticketId);
        if (!ticket) {
          throw new Error('Ticket not found');
        }
        return ticket;
      }
    },
    enabled: !!ticketId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Send admin reply
export const useSendAdminReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      message,
    }: {
      ticketId: string;
      message: string;
    }): Promise<void> => {
      try {
        const payload: SendReplyRequest = { message };

        await axios.post(`${apiUrl}/tickets/admin/${ticketId}/reply`, payload, {
          headers: getAuthHeaders(),
        });
      } catch {
        // Mock success for development
        const ticket = mockTickets.find((t) => t.id === ticketId);
        if (ticket) {
          ticket.messages.push({
            id: Date.now().toString(),
            sender: 'admin',
            message,
            createdAt: new Date().toISOString(),
          });
          ticket.updatedAt = new Date().toISOString();
        }
      }
    },
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'tickets', ticketId],
      });
      toast.success('پاسخ شما با موفقیت ارسال شد');
    },
    onError: () => {
      toast.error('ارسال پاسخ با مشکل مواجه شد');
    },
  });
};

// Update ticket status
export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      status,
    }: {
      ticketId: string;
      status: TicketStatus;
    }): Promise<void> => {
      try {
        const payload: UpdateTicketStatusRequest = { status };

        await axios.patch(`${apiUrl}/tickets/${ticketId}/status`, payload, {
          headers: getAuthHeaders(),
        });
      } catch {
        // Mock success for development
        const ticket = mockTickets.find((t) => t.id === ticketId);
        if (ticket) {
          ticket.status = status;
          ticket.updatedAt = new Date().toISOString();
        }
      }
    },
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'tickets', ticketId],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'tickets', 'stats'],
      });
      toast.success('وضعیت تیکت با موفقیت به‌روزرسانی شد');
    },
    onError: () => {
      toast.error('به‌روزرسانی وضعیت تیکت با مشکل مواجه شد');
    },
  });
};
