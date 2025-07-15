import { useDeletePersonnel, usePersonnelList } from '@/api/personnel';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { showToast } from '@/lib/toast';
import { Personnel } from '@/types/dashboard';
import { useState } from 'react';
import { CreatePersonnelForm } from './CreatePersonnelForm';
import { DeletePersonnelDialog } from './DeletePersonnelDialog';
import { EditPersonnelDialog } from './EditPersonnelDialog';
import { PersonnelList } from './PersonnelList';

export function PersonnelPage() {
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [personnelToDelete, setPersonnelToDelete] = useState<Personnel | null>(
    null
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3100';

  // Use react-query hooks
  const {
    data: personnelResponse,
    isLoading,
    refetch,
  } = usePersonnelList({
    page: currentPage,
    limit: 10,
    search: searchTerm,
  });

  const deletePersonnelMutation = useDeletePersonnel();
  const { handleError } = useErrorHandler();

  const personnel = personnelResponse?.data || [];
  const pagination = personnelResponse?.meta || {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
  };

  const openDeleteDialog = (id: string) => {
    const person = personnel.find((p) => p.id === id);
    if (person) {
      setPersonnelToDelete(person);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!personnelToDelete) return;

    try {
      await deletePersonnelMutation.mutateAsync(personnelToDelete.id);
      showToast.success('نیروی انسانی با موفقیت حذف شد!');
      refetch();
    } catch (error) {
      handleError(error, 'حذف نیروی انسانی با مشکل مواجه شد');
    }
  };

  const handleEdit = (personnel: Personnel) => {
    setSelectedPersonnel(personnel);
    setIsEditDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4">
        <h1 className="text-xl md:text-2xl font-bold">مدیریت منابع انسانی</h1>
        <Button
          className="w-full sm:w-auto"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm
            ? 'مشاهده نیروهای انسانی'
            : 'افزودن نیروی انسانی جدید'}
        </Button>
      </div>

      {showCreateForm ? (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              افزودن نیروی انسانی جدید
            </CardTitle>
            <CardDescription>اطلاعات نیروی انسانی را وارد کنید</CardDescription>
          </CardHeader>
          <CardContent>
            <CreatePersonnelForm
              onSuccess={(message: string) => {
                showToast.success(message);
                setShowCreateForm(false);
                refetch();
              }}
              onError={(message: string) => showToast.error(message)}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="جستجو در عنوان نیروهای انسانی..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  disabled={!searchTerm}
                >
                  پاک کردن فیلتر
                </Button>
              </div>
            </CardContent>
          </Card>
          <PersonnelList
            personnel={personnel}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={openDeleteDialog}
            apiUrl={apiUrl}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <EditPersonnelDialog
        personnel={selectedPersonnel}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => {
          showToast.success('نیروی انسانی با موفقیت ویرایش شد!');
          refetch();
        }}
        apiUrl={apiUrl}
      />

      {personnelToDelete && (
        <DeletePersonnelDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDelete}
          personnelTitle={personnelToDelete.title}
        />
      )}
    </div>
  );
}
