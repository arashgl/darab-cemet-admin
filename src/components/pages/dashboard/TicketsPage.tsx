import { useAdminTicketsList, useTicketStats } from '@/api/tickets';
import { PaginationControls } from '@/components/molecules/PaginationControls';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TicketStatus } from '@/types/dashboard';
import {
  CheckCircle2,
  Clock,
  Eye,
  LoaderCircle,
  MessageSquare,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

export function TicketsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | 'all'>(
    'all'
  );

  const {
    data: ticketsResponse,
    isLoading,
    error,
    refetch,
  } = useAdminTicketsList({
    page: currentPage,
    limit: 10,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
  });

  const { data: stats, isLoading: statsLoading } = useTicketStats();

  const tickets = ticketsResponse?.data || [];
  const meta = ticketsResponse?.meta || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value as TicketStatus | 'all');
    setCurrentPage(1); // Reset to first page when filtering
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fa-IR');
    } catch {
      return '-';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">مدیریت تیکت‌ها</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>خطا در دریافت تیکت‌ها: {error.message}</p>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">مدیریت تیکت‌ها</h1>
      </div>

      {/* Stats Cards */}
      {stats && !statsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">کل</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">باز</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.open}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">در انتظار</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">حل شده</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.resolved}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">بسته</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {stats.closed}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-48">
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger data-testid="ticket-status-filter">
                  <SelectValue placeholder="وضعیت تیکت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  <SelectItem value="open">باز</SelectItem>
                  <SelectItem value="pending">در انتظار</SelectItem>
                  <SelectItem value="resolved">حل شده</SelectItem>
                  <SelectItem value="closed">بسته</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedStatus('all');
                setCurrentPage(1);
              }}
              disabled={selectedStatus === 'all'}
              data-testid="ticket-reset-filters"
            >
              پاک کردن فیلتر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>لیست تیکت‌ها</CardTitle>
              <CardDescription>مجموع {meta.totalItems} تیکت</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
          ) : tickets.length > 0 ? (
            <>
              <Table data-testid="tickets-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-start">موضوع</TableHead>
                    <TableHead className="text-start">وضعیت</TableHead>
                    <TableHead className="text-start">تاریخ ایجاد</TableHead>
                    <TableHead className="text-start">
                      آخرین به‌روزرسانی
                    </TableHead>
                    <TableHead className="text-start">تعداد پیام‌ها</TableHead>
                    <TableHead className="text-start">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      data-testid={`ticket-row-${ticket.id}`}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{ticket.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {ticket.id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(ticket.status)}
                          className="gap-1"
                        >
                          {getStatusIcon(ticket.status)}
                          {getStatusLabel(ticket.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{formatDate(ticket.createdAt)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(ticket.createdAt)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{formatDate(ticket.updatedAt)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(ticket.updatedAt)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ticket.messages.length} پیام
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // This will be handled by parent component to navigate
                            window.location.hash = `tickets/${ticket.id}`;
                          }}
                          data-testid={`ticket-view-${ticket.id}`}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">مشاهده</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {meta.totalPages > 1 && (
                <PaginationControls
                  currentPage={meta.currentPage}
                  totalPages={meta.totalPages}
                  onPageChange={handlePageChange}
                  className="mt-6"
                  data-testid="tickets-pagination"
                />
              )}
            </>
          ) : (
            <div
              className="text-center py-12"
              data-testid="tickets-empty-state"
            >
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">هیچ تیکتی یافت نشد</h3>
              <p className="text-muted-foreground">
                {selectedStatus !== 'all'
                  ? 'تیکتی با وضعیت انتخاب شده یافت نشد.'
                  : 'هنوز هیچ تیکتی ایجاد نشده است.'}
              </p>
              {selectedStatus !== 'all' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedStatus('all');
                    setCurrentPage(1);
                  }}
                  className="mt-4"
                >
                  نمایش همه تیکت‌ها
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
