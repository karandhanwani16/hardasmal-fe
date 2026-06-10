import { useState, type FormEvent } from "react";
import { FormModal } from "../crud/FormModal";
import { Autocomplete } from "../ui/Autocomplete";
import { FieldError } from "../ui/Input";
import { useDispatchSuggestions } from "../../hooks/useDispatchSuggestions";
import api from "../../lib/api";
import { getApiErrorMessage } from "../../lib/api-errors";
import type { Order } from "../../types";

interface DispatchOrderModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onDispatched: () => void;
}

export function DispatchOrderModal({
  order,
  open,
  onClose,
  onDispatched,
}: DispatchOrderModalProps) {
  const [riderName, setRiderName] = useState("");
  const [riderMobile, setRiderMobile] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameSuggestions = useDispatchSuggestions(
    "rider_names",
    riderName,
    open,
  );
  const mobileSuggestions = useDispatchSuggestions(
    "rider_mobiles",
    riderMobile,
    open,
  );
  const vehicleSuggestions = useDispatchSuggestions(
    "vehicle_numbers",
    vehicleNumber,
    open,
  );

  const reset = () => {
    setRiderName("");
    setRiderMobile("");
    setVehicleNumber("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setError("");
    setIsSubmitting(true);
    try {
      await api.post(`/orders/${order.id}/dispatch`, {
        rider_name: riderName.trim(),
        rider_mobile: riderMobile.trim(),
        vehicle_number: vehicleNumber.trim() || null,
      });
      onDispatched();
      handleClose();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Could not dispatch order. Check rider details and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      open={open && !!order}
      title={`Dispatch · ${order?.order_number ?? ""}`}
      onClose={handleClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Confirm dispatch"
    >
      <div className="px-2">
        <p className="mb-4 text-sm text-ledger-700">
          Record who is taking this order. These details appear on the challan
          and can be reused for future dispatches.
        </p>
        <div className="grid gap-4">
          <Autocomplete
            id="dispatch-rider"
            label="Rider / dispatcher name"
            value={riderName}
            onChange={setRiderName}
            suggestions={nameSuggestions.data ?? []}
            isLoading={nameSuggestions.isFetching}
            required
          />
          <Autocomplete
            id="dispatch-mobile"
            label="Mobile number"
            value={riderMobile}
            onChange={setRiderMobile}
            suggestions={mobileSuggestions.data ?? []}
            isLoading={mobileSuggestions.isFetching}
            required
          />
          <Autocomplete
            id="dispatch-vehicle"
            label="Vehicle number"
            value={vehicleNumber}
            onChange={(value) => setVehicleNumber(value.toUpperCase())}
            suggestions={vehicleSuggestions.data ?? []}
            isLoading={vehicleSuggestions.isFetching}
            placeholder="Optional"
          />
        </div>
        <FieldError message={error} />
      </div>
    </FormModal>
  );
}
