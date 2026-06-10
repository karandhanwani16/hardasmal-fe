import { useState, type FormEvent } from 'react';
import { DataTable } from '../components/crud/DataTable';
import { FormModal } from '../components/crud/FormModal';
import { DeleteConfirm } from '../components/crud/DeleteConfirm';
import { RowActions } from '../components/crud/RowActions';
import { ListPageLayout } from '../components/list/ListPageLayout';
import { FieldError, FieldLabel, Input } from '../components/ui/Input';
import { useListPage } from '../hooks/useListPage';
import { usePaginatedCrud } from '../hooks/usePaginatedCrud';
import type { Crockery } from '../types';

type FormState = {
  name: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  name: '',
  is_active: true,
};

export function CrockeriesPage() {
  const list = useListPage({ defaultPerPage: 50 });

  const { items, meta, isLoading, create, update, remove, isSaving, isDeleting } =
    usePaginatedCrud<Crockery>({
      endpoint: '/crockeries',
      queryKey: ['crockeries'],
      listParams: list.listParams,
    });

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Crockery | null>(null);
  const [deleting, setDeleting] = useState<Crockery | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState('');

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (row: Crockery) => {
    setEditing(row);
    setForm({
      name: row.name,
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
        is_active: form.is_active,
      };
      if (editing) {
        await update({ id: editing.id, ...payload });
      } else {
        await create(payload);
      }
      setModalOpen(false);
    } catch {
      setError('Could not save crockery item.');
    }
  };

  return (
    <>
      <ListPageLayout
        title="Crockery"
        description="Master list of crockery used on orders and returns"
        actionLabel="Add crockery"
        onAdd={openCreate}
        search={list.searchInput}
        onSearchChange={list.setSearchInput}
        searchPlaceholder="Search crockery name"
        viewMode={list.viewMode}
        onViewModeChange={list.setViewMode}
        meta={meta}
        page={list.page}
        perPage={list.perPage}
        onPageChange={list.setPage}
        onPerPageChange={list.setPerPage}
        isLoading={isLoading}
      >
        <DataTable
          viewMode={list.viewMode}
          isLoading={isLoading}
          rows={items}
          rowKey={(r) => r.id}
          emptyMessage="No crockery records yet."
          columns={[
            { key: 'name', header: 'Name', render: (r) => r.name, cardPrimary: true },
            {
              key: 'status',
              header: 'Status',
              render: (r) => (r.is_active !== false ? 'Active' : 'Inactive'),
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
        title={editing ? 'Edit crockery' : 'New crockery'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
      >
        <div>
          <FieldLabel htmlFor="crock-name">Name</FieldLabel>
          <Input
            id="crock-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
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
        title="Delete crockery"
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
  );
}
