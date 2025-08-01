import {
  useSendAdminReply,
  useTicketById,
  useUpdateTicketStatus,
} from '@/api/tickets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MessageSender, TicketStatus } from '@/types/dashboard';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  LoaderCircle,
  MessageSquare,
  Send,
  Shield,
  User,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface TicketDetailPageProps {
  ticketId: string;
  onBack: () => void;
}

export function TicketDetailPage({ ticketId, onBack }: TicketDetailPageProps) {
  const [replyMessage, setReplyMessage] = useState('');

  const { data: ticket, isLoading, error, refetch } = useTicketById(ticketId);

  const sendReplyMutation = useSendAdminReply();
  const updateStatusMutation = useUpdateTicketStatus();

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;

    try {
      await sendReplyMutation.mutateAsync({
        ticketId,
        message: replyMessage.trim(),
      });
      setReplyMessage('');
    } catch {
      // Error handling is done in the mutation
    }
  };

  const handleStatusUpdate = async (status: TicketStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        ticketId,
        status,
      });
    } catch {
      // Error handling is done in the mutation
    }
  };

  const getStatusBadgeVariant = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'pending':
        return 'secondary';
      case 'resolved':
        return 'default';
      case 'closed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return 'باز';
      case 'pending':
        return 'در انتظار';
      case 'resolved':
        return 'حل شده';
      case 'closed':
        return 'بسته';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <MessageSquare className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getSenderIcon = (sender: MessageSender) => {
    return sender === 'admin' ? (
      <Shield className="h-4 w-4 text-blue-600" />
    ) : (
      <User className="h-4 w-4 text-gray-600" />
    );
  };

  const getSenderLabel = (sender: MessageSender) => {
    return sender === 'admin' ? 'مدیر' : 'کاربر';
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('fa-IR'),
        time: date.toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    } catch {
      return { date: '-', time: '-' };
    }
  };

  const isTicketClosed = ticket?.status === 'closed';

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4" />
            بازگشت
          </Button>
          <h1 className="text-2xl font-bold">جزئیات تیکت</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>خطا در دریافت تیکت: {error.message}</p>
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="mt-4"
              >
                تلاش مجدد
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4" />
            بازگشت
          </Button>
          <h1 className="text-2xl font-bold">جزئیات تیکت</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4" />
            بازگشت
          </Button>
          <h1 className="text-2xl font-bold">جزئیات تیکت</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p>تیکت یافت نشد</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="h-4 w-4" />
          بازگشت
        </Button>
        <h1 className="text-2xl font-bold">جزئیات تیکت</h1>
      </div>

      {/* Ticket Info */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{ticket.subject}</CardTitle>
              <CardDescription>شناسه تیکت: {ticket.id}</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant={getStatusBadgeVariant(ticket.status)}
                className="gap-1"
              >
                {getStatusIcon(ticket.status)}
                {getStatusLabel(ticket.status)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <strong>تاریخ ایجاد:</strong>{' '}
              {formatDateTime(ticket.createdAt).date} -{' '}
              {formatDateTime(ticket.createdAt).time}
            </div>
            <div>
              <strong>آخرین به‌روزرسانی:</strong>{' '}
              {formatDateTime(ticket.updatedAt).date} -{' '}
              {formatDateTime(ticket.updatedAt).time}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Management */}
      <Card>
        <CardHeader>
          <CardTitle>مدیریت وضعیت</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select
              value={ticket.status}
              onValueChange={(value) =>
                handleStatusUpdate(value as TicketStatus)
              }
              disabled={updateStatusMutation.isPending}
            >
              <SelectTrigger
                className="w-48"
                data-testid="ticket-status-select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">باز</SelectItem>
                <SelectItem value="pending">در انتظار</SelectItem>
                <SelectItem value="resolved">حل شده</SelectItem>
                <SelectItem value="closed">بسته</SelectItem>
              </SelectContent>
            </Select>
            {updateStatusMutation.isPending && (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages Thread */}
      <Card>
        <CardHeader>
          <CardTitle>گفتگو</CardTitle>
          <CardDescription>{ticket.messages.length} پیام</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="space-y-4 max-h-96 overflow-y-auto"
            data-testid="ticket-messages"
          >
            {ticket.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'admin' ? 'justify-start' : 'justify-end'
                }`}
                data-testid={`message-${message.id}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.sender === 'admin'
                      ? 'bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800'
                      : 'bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getSenderIcon(message.sender)}
                    <span className="text-sm font-medium">
                      {getSenderLabel(message.sender)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(message.createdAt).date} -{' '}
                      {formatDateTime(message.createdAt).time}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">
                    {message.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      <Card>
        <CardHeader>
          <CardTitle>ارسال پاسخ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder={
                isTicketClosed
                  ? 'این تیکت بسته شده است و امکان ارسال پاسخ وجود ندارد'
                  : 'پاسخ خود را بنویسید...'
              }
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              disabled={isTicketClosed || sendReplyMutation.isPending}
              rows={4}
              data-testid="reply-textarea"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSendReply}
                disabled={
                  !replyMessage.trim() ||
                  isTicketClosed ||
                  sendReplyMutation.isPending
                }
                data-testid="send-reply-button"
              >
                {sendReplyMutation.isPending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <Send className="h-4 w-4 ml-2" />
                )}
                ارسال پاسخ
              </Button>
            </div>
            {isTicketClosed && (
              <p className="text-sm text-muted-foreground text-center">
                این تیکت بسته شده است. برای ارسال پاسخ، ابتدا وضعیت آن را تغییر
                دهید.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
