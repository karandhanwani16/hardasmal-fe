import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CustomerAutocomplete, type CustomerFields } from './CustomerAutocomplete';
import { CrockeryRequiredToggle } from './CrockeryRequiredToggle';
import { OrderCrockeryLinesSection } from './OrderCrockeryLinesSection';
import { OrderEventDetailsSection } from './OrderEventDetailsSection';
import { OrderFormStepIndicator, ORDER_FORM_STEP_COUNT } from './OrderFormStepIndicator';
import { OrderFormSummary, type AdvancePaymentMode } from './OrderFormSummary';
import { OrderMenuLinesSection } from './OrderMenuLinesSection';
import { OrderReceiptModal } from './OrderReceiptModal';
import { FieldError } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import api from '../../lib/api';
import { parseAmount } from '../../lib/currency';
import {
  applyDietaryToInstructions,
  buildReceiptDataFromDraft,
  parseDietaryFromInstructions,
  type DietaryPreference,
  type OrderReceiptData,
} from '../../lib/order-receipt';
import {
  buildCrockeryLines,
  buildMenuLines,
  countIncludedCrockeryLines,
  countIncludedMenuLines,
  crockeryLinesToPayload,
  menuLinesToPayload,
  parsePersonsCount,
  syncCrockeryLineQuantities,
  syncMenuLineQuantities,
  type CrockeryLineRow,
  type MenuLineRow,
} from '../../lib/order-lines';
import { useActiveMenuItems } from '../../hooks/useActiveMenuItems';
import { todayIsoDate, unwrapList, unwrapOne } from '../../lib/api-helpers';
import type { Crockery, Customer, Order } from '../../types';
import { MEAL_TYPES } from '../../types';

/** API still requires booking_date; hidden from UI — mirror event date. */
const DISPATCH_TIMING_SCHEDULED = 'scheduled';

interface OrderFormModalProps {
  open: boolean;
  order?: Order | null;
  onClose: () => void;
  onSaved: (savedOrder: Order) => void;
}

const emptyCustomer: CustomerFields = { phone: '', name: '', address: '' };

function resetCreateFormState() {
  return {
    customer: emptyCustomer,
    customerId: null as number | null,
    eventDate: todayIsoDate(),
    eventTime: '12:00',
    mealType: MEAL_TYPES[1],
    dietaryPreference: 'regular' as DietaryPreference,
    persons: '50',
    eventAddress: '',
    specialInstructions: '',
    perPlateCost: '0',
    transportationCharges: '0',
    washingCharges: '0',
    advancePaid: '0',
    advancePaymentMode: '' as AdvancePaymentMode,
    orderTotal: '0',
    crockeryRequired: false,
    crockeryRemarks: '',
    step: 0,
  };
}

function resolveAdvancePaymentMode(value: string | null | undefined): AdvancePaymentMode {
  if (value === 'cash' || value === 'upi') return value;
  return '';
}

function calculateOrderTotal(
  personsCount: number,
  perPlateCost: string,
  transportationCharges: string,
  washingCharges: string,
): string {
  const plateSubtotal = personsCount * parseAmount(perPlateCost);
  const total = plateSubtotal + parseAmount(transportationCharges) + parseAmount(washingCharges);
  return String(total);
}

export function OrderFormModal({ open, order, onClose, onSaved }: OrderFormModalProps) {
  const isEdit = !!order;

  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<CustomerFields>(emptyCustomer);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [eventDate, setEventDate] = useState(todayIsoDate());
  const [eventTime, setEventTime] = useState('12:00');
  const [mealType, setMealType] = useState<string>(MEAL_TYPES[1]);
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('regular');
  const [persons, setPersons] = useState('50');
  const [eventAddress, setEventAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [perPlateCost, setPerPlateCost] = useState('0');
  const [transportationCharges, setTransportationCharges] = useState('0');
  const [washingCharges, setWashingCharges] = useState('0');
  const [advancePaid, setAdvancePaid] = useState('0');
  const [advancePaymentMode, setAdvancePaymentMode] = useState<AdvancePaymentMode>('');
  const [orderTotal, setOrderTotal] = useState('0');
  const [crockeryRequired, setCrockeryRequired] = useState(false);
  const [crockeryRemarks, setCrockeryRemarks] = useState('');
  const [lines, setLines] = useState<MenuLineRow[]>([]);
  const [crockeryLines, setCrockeryLines] = useState<CrockeryLineRow[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<OrderReceiptData | null>(null);
  const [crockeryExpanded, setCrockeryExpanded] = useState(false);
  const wasOpenRef = useRef(false);
  const loadedEditOrderIdRef = useRef<number | null>(null);
  const pendingOrderItemsRef = useRef<{ item_id: number; quantity: number }[] | null>(null);
  const pendingCrockeryItemsRef = useRef<{ crockery_id: number; quantity: number }[] | null>(null);

  const personsCount = parsePersonsCount(persons);
  const isLastStep = step === ORDER_FORM_STEP_COUNT - 1;

  const orderDetailQuery = useQuery({
    queryKey: ['orders', order?.id],
    enabled: open && isEdit && !!order?.id,
    queryFn: async () => {
      const { data } = await api.get(`/orders/${order!.id}`);
      return unwrapOne<Order>(data);
    },
  });

  const orderData = orderDetailQuery.data ?? order;

  const itemsQuery = useActiveMenuItems(open);

  const crockeriesQuery = useQuery({
    queryKey: ['crockeries', 'active'],
    enabled: open && crockeryRequired,
    queryFn: async () => {
      const { data } = await api.get('/crockeries', { params: { per_page: 200 } });
      return unwrapList<Crockery>(data).filter((c) => c.is_active !== false);
    },
  });

  const menuLineCount = useMemo(() => countIncludedMenuLines(lines), [lines]);
  const crockeryLineCount = useMemo(() => countIncludedCrockeryLines(crockeryLines), [crockeryLines]);

  const crockeryCollapsedSummary =
    crockeryLines.length === 0
      ? 'No catalog'
      : crockeryLineCount === 0
        ? 'No crockery selected'
        : `${crockeryLineCount} of ${crockeryLines.length} included`;

  useEffect(() => {
    setOrderTotal(calculateOrderTotal(personsCount, perPlateCost, transportationCharges, washingCharges));
  }, [personsCount, perPlateCost, transportationCharges, washingCharges]);

  useEffect(() => {
    if (parseAmount(advancePaid) <= 0 && advancePaymentMode) {
      setAdvancePaymentMode('');
    }
  }, [advancePaid, advancePaymentMode]);

  useEffect(() => {
    if (!open) return;
    setCrockeryExpanded(false);
    setStep(0);
  }, [open]);

  useEffect(() => {
    if (crockeryRequired) setCrockeryExpanded(true);
  }, [crockeryRequired]);

  const populateFromOrder = (source: Order) => {
    setCustomerId(source.customer?.id ?? null);
    setCustomer({
      phone: source.customer?.phone ?? '',
      name: source.customer?.name ?? '',
      address: source.customer?.address ?? '',
    });
    setEventDate(source.event_date);
    setEventTime(source.event_time?.slice(0, 5) ?? '12:00');
    setMealType(source.meal_type);
    setDietaryPreference(parseDietaryFromInstructions(source.special_instructions) || 'regular');
    setPersons(String(source.number_of_persons));
    setEventAddress(source.event_address);
    setSpecialInstructions(source.special_instructions ?? '');
    setPerPlateCost(String(source.per_plate_cost ?? '0'));
    setTransportationCharges(String(source.transportation_charges ?? '0'));
    setWashingCharges(String(source.washing_charges ?? '0'));
    setAdvancePaid(String(source.advance_paid ?? '0'));
    setAdvancePaymentMode(resolveAdvancePaymentMode(source.advance_payment_mode));
    setOrderTotal(String(source.total_bill_amount ?? '0'));
    setCrockeryRequired(source.crockery_required);
    setCrockeryRemarks(source.crockery_remarks ?? '');
    pendingOrderItemsRef.current =
      source.items?.map((item) => ({ item_id: item.item_id, quantity: item.quantity })) ?? [];
    pendingCrockeryItemsRef.current =
      source.crockery_items?.map((c) => ({ crockery_id: c.crockery_id, quantity: c.quantity })) ?? [];
    setError('');
  };

  useEffect(() => {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;

    if (!open) {
      loadedEditOrderIdRef.current = null;
      pendingOrderItemsRef.current = null;
      pendingCrockeryItemsRef.current = null;
      return;
    }

    if (justOpened) {
      if (isEdit && orderData) {
        populateFromOrder(orderData);
      } else if (!isEdit) {
        const defaults = resetCreateFormState();
        setStep(defaults.step);
        setCustomer(defaults.customer);
        setCustomerId(defaults.customerId);
        setEventDate(defaults.eventDate);
        setEventTime(defaults.eventTime);
        setMealType(defaults.mealType);
        setDietaryPreference(defaults.dietaryPreference);
        setPersons(defaults.persons);
        setEventAddress(defaults.eventAddress);
        setSpecialInstructions(defaults.specialInstructions);
        setPerPlateCost(defaults.perPlateCost);
        setTransportationCharges(defaults.transportationCharges);
        setWashingCharges(defaults.washingCharges);
        setAdvancePaid(defaults.advancePaid);
        setAdvancePaymentMode(defaults.advancePaymentMode);
        setOrderTotal(defaults.orderTotal);
        setCrockeryRequired(defaults.crockeryRequired);
        setCrockeryRemarks(defaults.crockeryRemarks);
        setLines([]);
        setCrockeryLines([]);
        pendingOrderItemsRef.current = null;
        pendingCrockeryItemsRef.current = null;
        setError('');
      }
    }
  }, [open, isEdit, orderData]);

  useEffect(() => {
    if (!open || !isEdit || !orderDetailQuery.data) return;
    if (loadedEditOrderIdRef.current === orderDetailQuery.data.id) return;
    loadedEditOrderIdRef.current = orderDetailQuery.data.id;
    populateFromOrder(orderDetailQuery.data);
  }, [open, isEdit, orderDetailQuery.data]);

  useEffect(() => {
    if (!open || !itemsQuery.data?.length || personsCount < 1) return;

    const orderItems = pendingOrderItemsRef.current ?? undefined;
    if (orderItems !== undefined) {
      pendingOrderItemsRef.current = null;
    }

    setLines((prev) => {
      const next = buildMenuLines(itemsQuery.data!, personsCount, prev, orderItems);
      return orderItems === undefined ? syncMenuLineQuantities(next, personsCount) : next;
    });
  }, [open, itemsQuery.data, personsCount]);

  useEffect(() => {
    if (!open || !crockeryRequired || !crockeriesQuery.data?.length || personsCount < 1) {
      if (!crockeryRequired) setCrockeryLines([]);
      return;
    }

    const orderCrockery = pendingCrockeryItemsRef.current ?? undefined;
    if (orderCrockery !== undefined) {
      pendingCrockeryItemsRef.current = null;
    }

    setCrockeryLines((prev) => {
      const next = buildCrockeryLines(crockeriesQuery.data!, personsCount, prev, orderCrockery);
      return orderCrockery === undefined ? syncCrockeryLineQuantities(next, personsCount) : next;
    });
  }, [open, crockeryRequired, crockeriesQuery.data, personsCount]);

  const handlePersonsChange = (value: string) => {
    setPersons(value);
    const nextCount = parsePersonsCount(value);
    if (nextCount < 1) return;
    setLines((prev) => syncMenuLineQuantities(prev, nextCount));
    setCrockeryLines((prev) => syncCrockeryLineQuantities(prev, nextCount));
  };

  const validateStep = (targetStep: number): string | null => {
    switch (targetStep) {
      case 0:
        if (!customer.phone.trim()) return 'Enter customer phone.';
        if (!customer.name.trim()) return 'Enter customer name.';
        return null;
      case 1:
        if (!eventDate) return 'Select event date.';
        if (!eventTime) return 'Select event time.';
        if (personsCount < 1) return 'Enter a valid number of persons.';
        if (!eventAddress.trim()) return 'Enter event address.';
        return null;
      case 2:
        if (menuLineCount < 1) return 'Select at least one menu item.';
        return null;
      case 3:
        if (crockeryRequired && crockeryLineCount < 1) {
          return 'Select at least one crockery item when crockery is required.';
        }
        return null;
      case 4:
        if (parseAmount(perPlateCost) <= 0) return 'Enter per plate cost.';
        if (parseAmount(advancePaid) > 0 && !advancePaymentMode) {
          return 'Select advance payment type (Cash or UPI).';
        }
        return null;
      default:
        return null;
    }
  };

  const goToNextStep = () => {
    const message = validateStep(step);
    if (message) {
      setError(message);
      return;
    }
    setError('');
    setStep((prev) => Math.min(prev + 1, ORDER_FORM_STEP_COUNT - 1));
  };

  const goToPreviousStep = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const buildPayload = async () => {
    let resolvedCustomerId = customerId;

    if (!resolvedCustomerId) {
      const { data: created } = await api.post('/customers', {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim() || null,
      });
      resolvedCustomerId = unwrapOne<Customer>(created).id;
    }

    const orderItems = menuLinesToPayload(lines);
    if (!orderItems.length) throw new Error('items');

    const crockeryItems = crockeryRequired ? crockeryLinesToPayload(crockeryLines) : [];
    if (crockeryRequired && !crockeryItems.length) throw new Error('crockery');

    const advance = parseAmount(advancePaid);

    return {
      customer_id: resolvedCustomerId,
      booking_date: isEdit ? (orderData?.booking_date ?? todayIsoDate()) : todayIsoDate(),
      event_date: eventDate,
      event_time: eventTime,
      meal_type: mealType,
      number_of_persons: Number(persons),
      per_plate_cost: parseAmount(perPlateCost),
      transportation_charges: parseAmount(transportationCharges),
      washing_charges: parseAmount(washingCharges),
      event_address: eventAddress.trim() || customer.address.trim(),
      special_instructions: applyDietaryToInstructions(specialInstructions, dietaryPreference),
      crockery_required: crockeryRequired,
      security_charges: 0,
      security_deposit: 0,
      crockery_remarks: crockeryRemarks.trim() || null,
      advance_paid: advance,
      advance_payment_mode: advance > 0 ? advancePaymentMode || null : null,
      total_bill_amount: parseAmount(orderTotal),
      dispatch_timing: DISPATCH_TIMING_SCHEDULED,
      items: orderItems,
      crockery_items: crockeryRequired ? crockeryItems : undefined,
    };
  };

  const buildPreviewData = (): OrderReceiptData => {
    const orderItems = menuLinesToPayload(lines);
    if (!orderItems.length) throw new Error('items');
    if (crockeryRequired && !crockeryLinesToPayload(crockeryLines).length) throw new Error('crockery');
    if (personsCount < 1) throw new Error('persons');

    return buildReceiptDataFromDraft({
      orderNumber: isEdit ? orderData?.order_number : 'NEW',
      eventDate,
      customer,
      eventAddress,
      mealType,
      persons: personsCount,
      dietary: dietaryPreference,
      orderTotal,
      perPlateCost,
      transportationCharges,
      washingCharges,
      advancePaid,
      advancePaymentMode:
        parseAmount(advancePaid) > 0 ? advancePaymentMode || null : null,
      menuLines: lines,
      menuCatalog: itemsQuery.data ?? [],
      crockeryRequired,
      crockeryLines,
      crockeryCatalog: crockeriesQuery.data ?? [],
      crockeryRemarks,
      deliveryBoyName: orderData?.rider_name ?? '',
    });
  };

  const persistOrder = async (): Promise<Order> => {
    const payload = await buildPayload();
    if (isEdit && order) {
      const { data } = await api.put(`/orders/${order.id}`, payload);
      return unwrapOne<Order>(data);
    }
    const { data } = await api.post('/orders', payload);
    return unwrapOne<Order>(data);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const message = validateStep(step);
    if (message) {
      setError(message);
      return;
    }

    if (!isEdit) {
      try {
        setPreviewData(buildPreviewData());
        setPreviewOpen(true);
      } catch (err) {
        if (err instanceof Error && err.message === 'items') {
          setError('Select at least one menu item.');
        } else if (err instanceof Error && err.message === 'crockery') {
          setError('Select at least one crockery item when crockery is required.');
        } else if (err instanceof Error && err.message === 'persons') {
          setError('Enter a valid number of persons.');
        } else {
          setError('Complete all steps before reviewing.');
        }
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await persistOrder();
      onSaved(saved);
      onClose();
    } catch (err) {
      if (err instanceof Error && err.message === 'items') {
        setError('Select at least one menu item.');
      } else if (err instanceof Error && err.message === 'crockery') {
        setError('Select at least one crockery item when crockery is required.');
      } else {
        setError('Could not save order. Check customer phone, items, and required fields.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCreate = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const saved = await persistOrder();
      setPreviewOpen(false);
      setPreviewData(null);
      onSaved(saved);
      onClose();
    } catch {
      setError('Could not create order. Check customer phone, items, and required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const locked =
    isEdit && ['dispatched', 'delivered', 'completed'].includes(orderData?.order_status ?? '');

  const stepContent = (
    <>
      {step === 0 ? (
        <section className="space-y-3 rounded-md border border-ledger-200 bg-surface p-3 sm:p-4">
          <div>
            <h3 className="text-sm font-semibold text-ledger-900">Customer details</h3>
            <p className="mt-0.5 hidden text-sm text-ledger-700 sm:block">
              Search by phone or name; link an existing customer or create one on save.
            </p>
          </div>
          <CustomerAutocomplete
            customer={customer}
            customerId={customerId}
            onCustomerChange={setCustomer}
            onCustomerIdChange={setCustomerId}
            onAddressSuggest={setEventAddress}
            showAddress={false}
          />
        </section>
      ) : null}

      {step === 1 ? (
        <OrderEventDetailsSection
          eventDate={eventDate}
          eventTime={eventTime}
          mealType={mealType}
          dietaryPreference={dietaryPreference}
          persons={persons}
          eventAddress={eventAddress}
          onEventDateChange={setEventDate}
          onEventTimeChange={setEventTime}
          onMealTypeChange={setMealType}
          onDietaryPreferenceChange={setDietaryPreference}
          onPersonsChange={handlePersonsChange}
          onEventAddressChange={setEventAddress}
        />
      ) : null}

      {step === 2 ? (
        <OrderMenuLinesSection
          lines={lines}
          items={itemsQuery.data}
          personsCount={personsCount}
          onUpdateLine={(key, patch) =>
            setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)))
          }
        />
      ) : null}

      {step === 3 ? (
        <div className="min-w-0 space-y-4">
          <section className="space-y-1 rounded-md border border-ledger-200 bg-surface p-3 sm:p-4">
            <h3 className="text-sm font-semibold text-ledger-900">Crockery</h3>
            <p className="text-xs leading-relaxed text-ledger-700 sm:text-sm">
              Choose whether this order needs crockery dispatch and security deposit tracking.
            </p>
          </section>

          <CrockeryRequiredToggle
            checked={crockeryRequired}
            onChange={setCrockeryRequired}
            disabled={locked}
          />

          {crockeryRequired ? (
            <OrderCrockeryLinesSection
              lines={crockeryLines}
              crockeries={crockeriesQuery.data}
              personsCount={personsCount}
              expanded={crockeryExpanded}
              onExpandedChange={setCrockeryExpanded}
              collapsedSummary={crockeryCollapsedSummary}
              crockeryRemarks={crockeryRemarks}
              onCrockeryRemarksChange={setCrockeryRemarks}
              onUpdateLine={(key, patch) =>
                setCrockeryLines((prev) =>
                  prev.map((line) => (line.key === key ? { ...line, ...patch } : line)),
                )
              }
            />
          ) : (
            <p className="rounded-md border border-ledger-200 bg-ledger-50 px-3 py-2.5 text-sm text-ledger-700">
              No crockery for this order — continue to payment when ready.
            </p>
          )}
        </div>
      ) : null}

      {step === 4 ? (
        <OrderFormSummary
          personsCount={personsCount}
          perPlateCost={perPlateCost}
          transportationCharges={transportationCharges}
          washingCharges={washingCharges}
          orderTotal={orderTotal}
          advancePaid={advancePaid}
          advancePaymentMode={advancePaymentMode}
          specialInstructions={specialInstructions}
          onPerPlateCostChange={setPerPlateCost}
          onTransportationChargesChange={setTransportationCharges}
          onWashingChargesChange={setWashingCharges}
          onAdvanceChange={setAdvancePaid}
          onAdvancePaymentModeChange={setAdvancePaymentMode}
          onSpecialInstructionsChange={setSpecialInstructions}
          disabled={locked}
          crockeryFine={isEdit ? String(orderData?.fine_amount ?? '0') : '0'}
        />
      ) : null}
    </>
  );

  return (
    <>
      <Modal
        open={open}
        title={isEdit ? `Edit order · ${orderData?.order_number}` : 'New order'}
        onClose={onClose}
        closeLabel="Cancel"
        closeDisabled={isSubmitting}
        wide
        compact
        footer={
          <div className="flex w-full min-w-0 items-center gap-2">
            
            {step > 0 ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={goToPreviousStep}
                disabled={isSubmitting || locked}
                className="shrink-0"
              >
                Back
              </Button>
            ) : null}
            {isLastStep ? (
              <Button
                type="submit"
                form="order-form"
                size="sm"
                disabled={isSubmitting || locked}
                className="min-w-0 flex-1 sm:min-w-40 sm:flex-none"
              >
                {isSubmitting ? (
                  'Saving…'
                ) : isEdit ? (
                  <>
                    <span className="sm:hidden">Save</span>
                    <span className="hidden sm:inline">Save changes</span>
                  </>
                ) : (
                  <>
                    <span className="sm:hidden">Review</span>
                    <span className="hidden sm:inline">Review confirmation note</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={goToNextStep}
                disabled={locked}
                className="min-w-0 flex-1 sm:min-w-40 sm:flex-none"
              >
                Continue
              </Button>
            )}
          </div>
        }
      >
        <form id="order-form" onSubmit={handleSubmit} className="min-w-0 space-y-3">
          {locked ? (
            <p className="rounded-md border border-alert/30 bg-alert/5 px-3 py-2 text-sm text-alert">
              This order has been dispatched and can no longer be edited.
            </p>
          ) : null}

          <OrderFormStepIndicator currentStep={step} />

          <fieldset disabled={locked} className="min-w-0 border-0 p-0 disabled:opacity-60">
            {stepContent}
          </fieldset>

          <FieldError message={error} />
        </form>
      </Modal>

      <OrderReceiptModal
        open={previewOpen}
        title="Review delivery confirmation note"
        data={previewData}
        onClose={() => {
          if (!isSubmitting) {
            setPreviewOpen(false);
            setPreviewData(null);
          }
        }}
        onBack={() => {
          if (!isSubmitting) {
            setPreviewOpen(false);
            setPreviewData(null);
          }
        }}
        confirmLabel="Confirm & create order"
        onConfirm={handleConfirmCreate}
        isConfirming={isSubmitting}
      />
    </>
  );
}
