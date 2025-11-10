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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { showToast } from '@/lib/toast';
import { Personnel, PersonnelType } from '@/types/dashboard';
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
  const [selectedType, setSelectedType] = useState<PersonnelType | 'all'>(
    'all'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Use react-query hooks
  const {
    data: personnelResponse,
    isLoading,
    refetch,
  } = usePersonnelList({
    page: currentPage,
    limit: 10,
    type: selectedType === 'all' ? undefined : selectedType,
    search: searchTerm || undefined,
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
    const person = personnel.find((p: Personnel) => p.id === id);
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

  const handleTypeChange = (value: string) => {
    setSelectedType(value as PersonnelType | 'all');
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setCurrentPage(1);
  };

  const getPersonnelTypeLabel = (type: PersonnelType) => {
    switch (type) {
      case PersonnelType.MANAGER:
        return 'مدیرعامل';
      case PersonnelType.ASSISTANT:
        return 'معاونت';
      case PersonnelType.MANAGERS:
        return 'مدیریت';
      default:
        return type;
    }
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
                    placeholder="جستجو در نام، سمت یا اطلاعات پرسنل..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <div className="w-full md:w-64">
                  <Select value={selectedType} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب نوع پرسنل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه انواع</SelectItem>
                      {Object.values(PersonnelType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {getPersonnelTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  disabled={selectedType === 'all' && !searchTerm}
                >
                  پاک کردن فیلترها
                </Button>
              </div>
            </CardContent>
          </Card>
          <PersonnelList
            personnel={personnel}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={openDeleteDialog}
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
      />

      {personnelToDelete && (
        <DeletePersonnelDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDelete}
          personnelName={personnelToDelete.name}
        />
      )}
    </div>
  );
}
