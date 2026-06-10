import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface DeleteConfirmProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirm({ open, title, message, onClose, onConfirm, isDeleting }: DeleteConfirmProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-alert hover:bg-alert/90"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </>
      }
    >
      <p className="text-sm text-ledger-700">{message}</p>
    </Modal>
  );
}
