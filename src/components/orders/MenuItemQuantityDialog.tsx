import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FieldLabel, Input } from '../ui/Input';

interface MenuItemQuantityDialogProps {
  open: boolean;
  itemName: string;
  imageUrl: string;
  quantity: number;
  personsCount: number;
  onClose: () => void;
  onSave: (quantity: number) => void;
}

function parseQuantityText(raw: string, fallback: number): number {
  const parsed = parseInt(raw.replace(/\D/g, ''), 10);
  return Math.max(1, Number.isFinite(parsed) ? parsed : fallback);
}

export function MenuItemQuantityDialog({
  open,
  itemName,
  imageUrl,
  quantity,
  personsCount,
  onClose,
  onSave,
}: MenuItemQuantityDialogProps) {
  const [draftText, setDraftText] = useState(String(Math.max(1, quantity)));
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (open) {
      setDraftText(String(Math.max(1, quantity)));
      setImageFailed(false);
    }
  }, [open, quantity, imageUrl]);

  const currentQuantity = parseQuantityText(draftText, Math.max(1, quantity));

  const handleSave = () => {
    onSave(currentQuantity);
    onClose();
  };

  const decrement = () => {
    setDraftText(String(Math.max(1, currentQuantity - 1)));
  };

  const increment = () => {
    setDraftText(String(currentQuantity + 1));
  };

  return (
    <Modal
      open={open}
      title="Edit quantity"
      onClose={onClose}
      stacked
      compact
      footer={
        <div className="grid w-full grid-cols-2 gap-3">
          <Button type="button" variant="secondary" size="sm" className="w-full" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" className="w-full" onClick={handleSave}>
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-4 px-2">
        <div className="space-y-3">
          <p className="text-sm font-medium text-ledger-900">{itemName}</p>
          {imageUrl && !imageFailed ? (
            <div
              className="mx-auto aspect-4/3 w-full max-w-[12rem] overflow-hidden rounded-lg border border-ledger-200 bg-ledger-100 bg-cover bg-center bg-no-repeat sm:max-w-[14rem]"
              style={{ backgroundImage: `url("${imageUrl}")` }}
              role="img"
              aria-label={itemName}
            >
              <img
                src={imageUrl}
                alt=""
                aria-hidden
                className="hidden"
                onError={() => setImageFailed(true)}
              />
            </div>
          ) : (
            <div className="mx-auto flex aspect-4/3 w-full max-w-[12rem] items-center justify-center rounded-lg border border-ledger-200 bg-ledger-100 px-3 text-center text-xs text-ledger-600 sm:max-w-[14rem]">
              {itemName}
            </div>
          )}
        </div>
        <div>
          <FieldLabel htmlFor="menu-qty-edit">Quantity</FieldLabel>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-11 min-h-11 w-11 min-w-11 shrink-0 px-0 text-lg leading-none"
              onClick={decrement}
              disabled={currentQuantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </Button>
            <Input
              id="menu-qty-edit"
              type="text"
              inputMode="numeric"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value.replace(/\D/g, ''))}
              onBlur={() => {
                if (!draftText.trim()) {
                  setDraftText(String(Math.max(1, quantity)));
                  return;
                }
                setDraftText(String(parseQuantityText(draftText, Math.max(1, quantity))));
              }}
              className="min-w-0 flex-1 text-center font-mono"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-11 min-h-11 w-11 min-w-11 shrink-0 px-0 text-lg leading-none"
              onClick={increment}
              aria-label="Increase quantity"
            >
              +
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-ledger-600">
            Default for this order is {personsCount} per person. Minimum 1.
          </p>
        </div>
      </div>
    </Modal>
  );
}
