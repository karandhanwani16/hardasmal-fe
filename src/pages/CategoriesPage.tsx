import { useState, type FormEvent } from 'react';
import { DataTable } from '../components/crud/DataTable';
import { FormModal } from '../components/crud/FormModal';
import { DeleteConfirm } from '../components/crud/DeleteConfirm';
import { RowActions } from '../components/crud/RowActions';
import { ListFilterField, ListFilterSelect } from '../components/list/ListFilterField';
import { ListPageLayout } from '../components/list/ListPageLayout';
import { FieldError, FieldLabel, Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useListPage } from '../hooks/useListPage';
import { usePaginatedCrud } from '../hooks/usePaginatedCrud';
import type { Category } from '../types';

type FormState = { name: string; slug: string; sort_order: string; is_active: boolean };

const emptyForm: FormState = { name: '', slug: '', sort_order: '0', is_active: true };

const ACTIVE_OPTIONS = [
  { value: '', label: 'All' },
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function CategoriesPage() {
  const list = useListPage({ initialFilters: { active: '' } });

  const { items, meta, isLoading, create, update, remove, isSaving, isDeleting } =
    usePaginatedCrud<Category>({
      endpoint: '/categories',
      queryKey: ['categories'],
      listParams: list.listParams,
    });

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState('');

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (row: Category) => {
    setEditing(row);
    setForm({
      name: row.name,
      slug: row.slug,
      sort_order: String(row.sort_order ?? 0),
      is_active: row.is_active ?? true,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      };
      if (editing) {
        await update({ id: editing.id, ...payload });
      } else {
        await create(payload);
      }
      setModalOpen(false);
    } catch {
      setError('Could not save category. The categories API may not be ready yet.');
    }
  };

  return (
    <>
      <ListPageLayout
        title="Categories"
        description="Menu categories for super admin catalogue management"
        actionLabel="Add category"
        onAdd={openCreate}
        search={list.searchInput}
        onSearchChange={list.setSearchInput}
        searchPlaceholder="Search name or slug"
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
          <ListFilterField label="Status" htmlFor="cat-active">
            <ListFilterSelect
              id="cat-active"
              value={list.filters.active}
              onChange={(v) => list.setFilter('active', v)}
              options={ACTIVE_OPTIONS}
            />
          </ListFilterField>
        }
      >
        <DataTable
          viewMode={list.viewMode}
          isLoading={isLoading}
          rows={items}
          rowKey={(r) => r.id}
          emptyMessage="No categories yet."
          columns={[
            { key: 'name', header: 'Name', render: (r) => r.name, cardPrimary: true },
            { key: 'slug', header: 'Slug', render: (r) => r.slug, mono: true },
            { key: 'sort', header: 'Sort', render: (r) => r.sort_order ?? 0, mono: true, hideInCard: true },
            {
              key: 'active',
              header: 'Status',
              render: (r) => (
                <Badge
                  label={r.is_active === false ? 'Inactive' : 'Active'}
                  variant={r.is_active === false ? 'pending' : 'paid'}
                />
              ),
            },
          ]}
          actions={(row) => (
            <RowActions
              onEdit={() => openEdit(row)}
              onDelete={() => {
                setDeleting(row);
                setDeleteOpen(true);
              }}
            />
          )}
        />
      </ListPageLayout>

      <FormModal
        open={modalOpen}
        title={editing ? 'Edit category' : 'New category'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
      >
        <div>
          <FieldLabel htmlFor="cat-name">Name</FieldLabel>
          <Input
            id="cat-name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
                slug: editing ? form.slug : slugify(e.target.value),
              })
            }
            required
          />
        </div>
        <div>
          <FieldLabel htmlFor="cat-slug">Slug</FieldLabel>
          <Input id="cat-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        </div>
        <div>
          <FieldLabel htmlFor="cat-sort">Sort order</FieldLabel>
          <Input
            id="cat-sort"
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Active
        </label>
        <FieldError message={error} />
      </FormModal>

      <DeleteConfirm
        open={deleteOpen}
        title="Delete category"
        message={`Remove ${deleting?.name}? Menu items using this category may be affected.`}
        onClose={() => setDeleteOpen(false)}
        isDeleting={isDeleting}
        onConfirm={async () => {
          if (!deleting) return;
          await remove(deleting.id);
          setDeleteOpen(false);
        }}
      />
    </>
  );
}
