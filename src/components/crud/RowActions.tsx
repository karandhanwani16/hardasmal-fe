import { Button } from '../ui/Button';

interface RowActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export function RowActions({ onEdit, onDelete }: RowActionsProps) {
  if (!onEdit && !onDelete) return null;

  return (
    <div className="inline-flex flex-wrap gap-1">
      {onEdit && (
        <Button type="button" variant="ghost" className="min-h-11 px-3 text-xs" onClick={onEdit}>
          Edit
        </Button>
      )}
      {onDelete && (
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 px-3 text-xs text-alert"
          onClick={onDelete}
        >
          Delete
        </Button>
      )}
    </div>
  );
}
