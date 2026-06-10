import { useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { OrderDeliveryReceipt } from './OrderDeliveryReceipt';
import { ReceiptScaleFit } from './ReceiptScaleFit';
import type { OrderReceiptData } from '../../lib/order-receipt';
import { printDeliveryReceipt } from '../../lib/print-delivery-receipt';

interface OrderReceiptModalProps {
  open: boolean;
  title?: string;
  data: OrderReceiptData | null;
  onClose: () => void;
  confirmLabel?: string;
  onConfirm?: () => void;
  isConfirming?: boolean;
  onBack?: () => void;
}

export function OrderReceiptModal({
  open,
  title = 'Delivery confirmation note',
  data,
  onClose,
  confirmLabel,
  onConfirm,
  isConfirming,
  onBack,
}: OrderReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const receipt = receiptRef.current?.querySelector('.delivery-receipt');
    if (!receipt) return;
    const opened = printDeliveryReceipt(receipt);
    if (!opened) {
      window.alert(
        'Could not open the print dialog. Try again, or use your browser’s Print option after allowing pop-ups.',
      );
    }
  };

  return (
    <Modal
      open={open && !!data}
      title={title}
      onClose={onClose}
      receipt
      footer={
        <div className="receipt-no-print flex w-full flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          {onBack ? (
            <Button type="button" variant="secondary" onClick={onBack} disabled={isConfirming}>
              Back to form
            </Button>
          ) : null}
          <Button type="button" variant="secondary" onClick={onClose} disabled={isConfirming}>
            Close
          </Button>
          <Button type="button" variant="secondary" onClick={handlePrint} disabled={!data}>
            Print / Save PDF
          </Button>
          {onConfirm ? (
            <Button type="button" onClick={onConfirm} disabled={isConfirming}>
              {isConfirming ? 'Saving…' : confirmLabel ?? 'Confirm'}
            </Button>
          ) : null}
        </div>
      }
    >
      {data ? (
        <div ref={receiptRef} className="delivery-receipt-print-root bg-ledger-100/50 p-2 sm:p-4">
          <ReceiptScaleFit active={open}>
            <OrderDeliveryReceipt data={data} />
          </ReceiptScaleFit>
        </div>
      ) : null}
    </Modal>
  );
}
