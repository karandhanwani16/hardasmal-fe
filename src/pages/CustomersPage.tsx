import { useState, type FormEvent } from 'react';
import { DataTable } from '../components/crud/DataTable';
import { FormModal } from '../components/crud/FormModal';
import { DeleteConfirm } from '../components/crud/DeleteConfirm';
import { RowActions } from '../components/crud/RowActions';
import { ListPageLayout } from '../components/list/ListPageLayout';
import { FieldError, FieldLabel, Input, Textarea } from '../components/ui/Input';
import { useListPage } from '../hooks/useListPage';
import { usePaginatedCrud } from '../hooks/usePaginatedCrud';
import { formatINR } from '../lib/currency';
import type { Customer } from '../types';

type FormState = { name: string; phone: string; email: string; address: string };

const emptyForm: FormState = { name: '', phone: '', email: '', address: '' };

export function CustomersPage() {
  const list = useListPage();

  const { items, meta, isLoading, create, update, remove, isSaving, isDeleting } =
    usePaginatedCrud<Customer>({
      endpoint: '/customers',
      queryKey: ['customers'],
      listParams: list.listParams,
    });

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState('');

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (row: Customer) => {
    setEditing(row);
    setForm({
      name: row.name,
      phone: row.phone,
      email: row.email ?? '',
      address: row.address ?? '',
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
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        address: form.address.trim() || null,
      };
      if (editing) {
        await update({ id: editing.id, ...payload });
      } else {
        await create(payload);
      }
      setModalOpen(false);
    } catch {
      setError('Could not save customer. Check phone uniqueness and required fields.');
    }
  };

  return (
    <>
      <ListPageLayout
        title="Customers"
        description="Customer directory for order booking"
        actionLabel="Add customer"
        onAdd={openCreate}
        search={list.searchInput}
        onSearchChange={list.setSearchInput}
        searchPlaceholder="Search name or phone"
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
          emptyMessage="No customers yet. Add your first customer."
          columns={[
            { key: 'name', header: 'Name', render: (r) => r.name, cardPrimary: true },
            { key: 'phone', header: 'Phone', render: (r) => r.phone, mono: true },
            { key: 'email', header: 'Email', render: (r) => r.email ?? '—', hideInCard: true },
            {
              key: 'credit',
              header: 'Credit',
              render: (r) => formatINR(r.credit_balance),
              mono: true,
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
        title={editing ? 'Edit customer' : 'New customer'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
      >
        <div>
          <FieldLabel htmlFor="cust-name">Name</FieldLabel>
          <Input id="cust-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <FieldLabel htmlFor="cust-phone">Phone</FieldLabel>
          <Input id="cust-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        </div>
        <div>
          <FieldLabel htmlFor="cust-email">Email</FieldLabel>
          <Input id="cust-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <FieldLabel htmlFor="cust-address">Address</FieldLabel>
          <Textarea id="cust-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <FieldError message={error} />
      </FormModal>

      <DeleteConfirm
        open={deleteOpen}
        title="Delete customer"
        message={`Remove ${deleting?.name}? This cannot be undone.`}
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
