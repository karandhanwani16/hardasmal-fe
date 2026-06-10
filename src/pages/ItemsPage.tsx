import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '../components/crud/DataTable';
import { FormModal } from '../components/crud/FormModal';
import { DeleteConfirm } from '../components/crud/DeleteConfirm';
import { RowActions } from '../components/crud/RowActions';
import { ListFilterField, ListFilterSelect } from '../components/list/ListFilterField';
import { ListPageLayout } from '../components/list/ListPageLayout';
import { FieldError, FieldLabel, Input, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useListPage } from '../hooks/useListPage';
import { usePaginatedCrud } from '../hooks/usePaginatedCrud';
import api from '../lib/api';
import { menuItemCategoryId, menuItemCategoryLabel, unwrapList } from '../lib/api-helpers';
import { canManageItems } from '../lib/roles';
import type { Category, MenuItem } from '../types';

type FormState = { name: string; category_id: string; is_active: boolean };

const emptyForm: FormState = { name: '', category_id: '', is_active: true };

const ACTIVE_OPTIONS = [
  { value: '', label: 'All' },
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
];

export function ItemsPage() {
  const { user } = useAuth();
  const canMutate = canManageItems(user);

  const list = useListPage({ initialFilters: { category_id: '', active: '' } });

  const {
    items,
    meta,
    isLoading,
    error: loadError,
    create,
    update,
    remove,
    isSaving,
    isDeleting,
  } = usePaginatedCrud<MenuItem>({
    endpoint: '/items',
    queryKey: ['items'],
    listParams: list.listParams,
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories', 'options'],
    queryFn: async () => {
      const { data } = await api.get('/categories', { params: { per_page: 100 } });
      return unwrapList<Category>(data);
    },
    enabled: canMutate,
  });

  const categories = categoriesQuery.data ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState('');

  const defaultCategoryId = () => String(categories[0]?.id ?? '');

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, category_id: defaultCategoryId() });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (row: MenuItem) => {
    setEditing(row);
    setForm({
      name: row.name,
      category_id: String(menuItemCategoryId(row) ?? ''),
      is_active: row.is_active,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    const name = form.name.trim();
    if (!name) {
      setFormError('Item name is required.');
      return;
    }

    const categoryId = Number(form.category_id);
    if (!categoryId) {
      setFormError('Select a category. Create categories first if the list is empty.');
      return;
    }

    try {
      const payload = {
        name,
        category_id: categoryId,
        is_active: form.is_active,
      };
      if (editing) {
        await update({ id: editing.id, ...payload });
      } else {
        await create(payload);
      }
      setModalOpen(false);
    } catch {
      setFormError('Could not save item. Check the name is unique and category is valid.');
    }
  };

  const listError =
    loadError && typeof loadError === 'object' && 'response' in loadError
      ? (loadError as { response?: { status?: number } }).response?.status === 403
        ? 'You do not have permission to view items.'
        : 'Could not load items.'
      : null;

  const categoryFilterOptions = [
    { value: '', label: 'All categories' },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  return (
    <>
      <ListPageLayout
        title="Item Management"
        description="Food catalogue used on new orders — all active items appear by default"
        actionLabel={canMutate ? 'Add item' : undefined}
        onAdd={canMutate ? openCreate : undefined}
        search={list.searchInput}
        onSearchChange={list.setSearchInput}
        searchPlaceholder="Search item or category"
        viewMode={list.viewMode}
        onViewModeChange={list.setViewMode}
        activeFilterCount={list.activeFilterCount}
        onClearFilters={list.clearFilters}
        meta={meta}
        page={list.page}
        perPage={list.perPage}
        onPageChange={list.setPage}
        onPerPageChange={list.setPerPage}
        isLoading={isLoading}
        filtersSlot={
          <>
            <ListFilterField label="Category" htmlFor="item-cat">
              <ListFilterSelect
                id="item-cat"
                value={list.filters.category_id}
                onChange={(v) => list.setFilter('category_id', v)}
                options={categoryFilterOptions}
              />
            </ListFilterField>
            <ListFilterField label="Status" htmlFor="item-active">
              <ListFilterSelect
                id="item-active"
                value={list.filters.active}
                onChange={(v) => list.setFilter('active', v)}
                options={ACTIVE_OPTIONS}
              />
            </ListFilterField>
          </>
        }
      >
        {!canMutate && (
          <p className="mb-4 rounded-md border border-ledger-200 bg-ledger-50 px-4 py-3 text-sm text-ledger-700">
            Read-only catalogue. Contact a super admin to add or edit items.
          </p>
        )}

        {listError && (
          <p className="mb-4 rounded-md border border-alert/30 bg-alert/5 px-4 py-3 text-sm text-alert">
            {listError}
          </p>
        )}

        <DataTable
          viewMode={list.viewMode}
          isLoading={isLoading}
          rows={items}
          rowKey={(r) => r.id}
          emptyMessage={
            canMutate
              ? 'No items yet. Add categories first, then create your first menu item.'
              : 'No items in the catalogue.'
          }
          columns={[
            { key: 'name', header: 'Name', render: (r) => r.name, cardPrimary: true },
            { key: 'category', header: 'Category', render: (r) => menuItemCategoryLabel(r) },
            {
              key: 'active',
              header: 'Status',
              render: (r) => (
                <Badge label={r.is_active ? 'Active' : 'Inactive'} variant={r.is_active ? 'paid' : 'pending'} />
              ),
            },
          ]}
          actions={
            canMutate
              ? (row) => (
                  <RowActions
                    onEdit={() => openEdit(row)}
                    onDelete={() => {
                      setDeleting(row);
                      setDeleteOpen(true);
                    }}
                  />
                )
              : undefined
          }
        />
      </ListPageLayout>

      {canMutate && (
        <>
          <FormModal
            open={modalOpen}
            title={editing ? 'Edit item' : 'New item'}
            onClose={() => setModalOpen(false)}
            onSubmit={handleSubmit}
            isSubmitting={isSaving}
          >
            <div>
              <FieldLabel htmlFor="item-name">Name</FieldLabel>
              <Input
                id="item-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <FieldLabel htmlFor="item-category">Category</FieldLabel>
              <Select
                id="item-category"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                required
                disabled={categories.length === 0}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
              {categories.length === 0 && (
                <p className="mt-1 text-xs text-ledger-700">Add categories before creating items.</p>
              )}
            </div>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-terracotta-600"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Active
            </label>
            <FieldError message={formError} />
          </FormModal>

          <DeleteConfirm
            open={deleteOpen}
            title="Delete item"
            message={`Remove ${deleting?.name}?`}
            onClose={() => setDeleteOpen(false)}
            isDeleting={isDeleting}
            onConfirm={async () => {
              if (!deleting) return;
              await remove(deleting.id);
              setDeleteOpen(false);
            }}
          />
        </>
      )}
    </>
  );
}
