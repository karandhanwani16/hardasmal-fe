import type { FormEvent, ReactNode } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface FormModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  submitLabel?: string;
  isSubmitting?: boolean;
  wide?: boolean;
}

export function FormModal({
  open,
  title,
  onClose,
  onSubmit,
  children,
  submitLabel = 'Save',
  isSubmitting,
  wide,
}: FormModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      wide={wide}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="crud-form" disabled={isSubmitting} className="sm:min-w-[10rem]">
            {isSubmitting ? 'Saving…' : submitLabel}
          </Button>
        </>
      }
    >
      <form id="crud-form" onSubmit={onSubmit} className="space-y-4">
        {children}
      </form>
    </Modal>
  );
}
