import { useState, type FormEvent } from 'react';
import { DataTable } from '../components/crud/DataTable';
import { FormModal } from '../components/crud/FormModal';
import { DeleteConfirm } from '../components/crud/DeleteConfirm';
import { RowActions } from '../components/crud/RowActions';
import { ListPageLayout } from '../components/list/ListPageLayout';
import { FieldError, FieldLabel, Input } from '../components/ui/Input';
import { PinInput } from '../components/ui/PinInput';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useListPage } from '../hooks/useListPage';
import { usePaginatedCrud } from '../hooks/usePaginatedCrud';
import { isSuperAdmin } from '../lib/roles';
import type { ManagedUser } from '../types';

type FormState = {
  name: string;
  username: string;
  role: 'admin' | 'manager';
  pin: string;
  is_active: boolean;
};

const emptyForm = (defaultRole: 'admin' | 'manager'): FormState => ({
  name: '',
  username: '',
  role: defaultRole,
  pin: '',
  is_active: true,
});

function roleLabel(role: string): string {
  if (role === 'super_admin') return 'Super Admin';
  if (role === 'admin') return 'Admin';
  return 'Manager';
}

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const canAssignAdmin = isSuperAdmin(currentUser);
  const defaultRole = canAssignAdmin ? 'manager' : 'manager';

  const list = useListPage();

  const { items, meta, isLoading, create, update, remove, isSaving, isDeleting } =
    usePaginatedCrud<ManagedUser>({
      endpoint: '/users',
      queryKey: ['users'],
      listParams: list.listParams,
    });

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [deleting, setDeleting] = useState<ManagedUser | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(defaultRole));
  const [error, setError] = useState('');

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(defaultRole));
    setError('');
    setModalOpen(true);
  };

  const openEdit = (row: ManagedUser) => {
    setEditing(row);
    setForm({
      name: row.name,
      username: row.username,
      role: row.role === 'admin' ? 'admin' : 'manager',
      pin: '',
      is_active: row.is_active,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!editing && form.pin.length !== 4) {
      setError('Starting PIN must be exactly 4 digits.');
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        role: form.role,
        is_active: form.is_active,
      };

      if (!editing || form.pin) {
        payload.pin = form.pin;
      }

      if (editing) {
        await update({ id: editing.id, ...payload });
      } else {
        await create(payload);
      }

      setModalOpen(false);
    } catch {
      setError(editing ? 'Could not update user.' : 'Could not create user. Username may already exist.');
    }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (r: ManagedUser) => r.name, cardPrimary: true },
    { key: 'username', header: 'Username', render: (r: ManagedUser) => r.username, mono: true },
    {
      key: 'role',
      header: 'Role',
      render: (r: ManagedUser) => <Badge label={roleLabel(r.role)} variant={r.role === 'admin' ? 'paid' : 'pending'} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: ManagedUser) => (
        <Badge
          label={r.is_active ? (r.must_set_pin ? 'Awaiting PIN setup' : 'Active') : 'Inactive'}
          variant={r.is_active ? 'paid' : 'due'}
        />
      ),
    },
  ];

  return (
    <>
      <ListPageLayout
        title="Staff users"
        description={
          canAssignAdmin
            ? 'Add admins and managers. Share username and starting PIN with each person.'
            : 'Add managers. Share username and starting PIN with each person.'
        }
        actionLabel="Add user"
        onAdd={openCreate}
        search={list.searchInput}
        onSearchChange={list.setSearchInput}
        searchPlaceholder="Search name or username"
        viewMode={list.viewMode}
        onViewModeChange={list.setViewMode}
        activeFilterCount={0}
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
          columns={columns}
          emptyMessage="No staff users yet."
          actions={(row: ManagedUser) => (
            <RowActions
              onEdit={() => openEdit(row)}
              onDelete={canAssignAdmin && row.id !== currentUser?.id ? () => { setDeleting(row); setDeleteOpen(true); } : undefined}
            />
          )}
        />
      </ListPageLayout>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit user' : 'Add user'}
        onSubmit={handleSubmit}
        submitLabel={editing ? 'Save changes' : 'Create user'}
        isSubmitting={isSaving}
      >
        <div className="space-y-4">
          <div>
            <FieldLabel htmlFor="user-name">Full name</FieldLabel>
            <Input
              id="user-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <FieldLabel htmlFor="user-username">Username</FieldLabel>
            <Input
              id="user-username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
            />
          </div>
          {canAssignAdmin ? (
            <div>
              <FieldLabel htmlFor="user-role">Role</FieldLabel>
              <select
                id="user-role"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as FormState['role'] }))}
                className="field-control field-select h-11 w-full rounded-md border border-ledger-200 bg-surface px-3 text-sm text-ledger-900"
              >
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ) : (
            <p className="rounded-md bg-ledger-100 px-3 py-2 text-sm text-ledger-700">New users will be managers.</p>
          )}
          <PinInput
            id="user-pin"
            label={editing ? 'New PIN (optional reset)' : 'Starting PIN'}
            value={form.pin}
            onChange={(pin) => setForm((f) => ({ ...f, pin }))}
          />
          {!editing ? (
            <p className="text-xs text-ledger-700">They will choose their own PIN on first login.</p>
          ) : form.pin ? (
            <p className="text-xs text-ledger-700">User must set a new PIN on next login.</p>
          ) : null}
          {editing ? (
            <label className="flex items-center gap-2 text-sm text-ledger-900">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="h-4 w-4 rounded border-ledger-200 text-terracotta-600 focus:ring-terracotta-500"
              />
              Account active
            </label>
          ) : null}
          {error ? <FieldError message={error} /> : null}
        </div>
      </FormModal>

      <DeleteConfirm
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          if (!deleting) return;
          await remove(deleting.id);
          setDeleteOpen(false);
        }}
        title="Delete user?"
        message={`Remove ${deleting?.name ?? 'this user'} permanently.`}
        isDeleting={isDeleting}
      />
    </>
  );
}
