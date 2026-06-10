import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  groupMenuLinesByCategory,
  type MenuLineRow,
} from '../../lib/order-lines';
import { getMenuItemImageUrl } from '../../lib/menu-item-image';
import type { MenuItem } from '../../types';
import { Button } from '../ui/Button';
import { MenuItemQuantityDialog } from './MenuItemQuantityDialog';

export type { MenuLineRow };

const LONG_PRESS_MS = 500;
const LONG_PRESS_MOVE_TOLERANCE_PX = 12;

interface OrderMenuLinesSectionProps {
  lines: MenuLineRow[];
  items: MenuItem[] | undefined;
  personsCount: number;
  onUpdateLine: (key: string, patch: Partial<MenuLineRow>) => void;
}

interface QuantityEditTarget {
  lineKey: string;
  itemName: string;
  imageUrl: string;
  quantity: number;
}

function categorySelectedCount(lines: MenuLineRow[]): number {
  return lines.filter((line) => line.included && line.quantity > 0).length;
}

interface MenuItemCardProps {
  item: MenuItem;
  line: MenuLineRow;
  personsCount: number;
  onUpdateLine: (key: string, patch: Partial<MenuLineRow>) => void;
  onEditQuantity: (target: QuantityEditTarget) => void;
}

function MenuItemCard({ item, line, personsCount, onUpdateLine, onEditQuantity }: MenuItemCardProps) {
  const selected = line.included && line.quantity > 0;
  const [imageFailed, setImageFailed] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const openQuantityEditor = () => {
    if (!selected) return;
    onEditQuantity({
      lineKey: line.key,
      itemName: item.name,
      imageUrl: getMenuItemImageUrl(item),
      quantity: line.quantity,
    });
  };

  const toggle = () => {
    const nextIncluded = !selected;
    onUpdateLine(line.key, {
      included: nextIncluded,
      quantity: nextIncluded ? personsCount : line.quantity,
    });
  };

  const handleClick = () => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }
    toggle();
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!selected || event.button > 0) return;

    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    longPressTriggeredRef.current = false;
    clearLongPress();

    if (event.pointerType === 'touch') {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      openQuantityEditor();
    }, LONG_PRESS_MS);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = pointerStartRef.current;
    if (!start || !longPressTimerRef.current) return;

    const movedX = Math.abs(event.clientX - start.x);
    const movedY = Math.abs(event.clientY - start.y);
    if (movedX > LONG_PRESS_MOVE_TOLERANCE_PX || movedY > LONG_PRESS_MOVE_TOLERANCE_PX) {
      clearLongPress();
    }
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    pointerStartRef.current = null;
    clearLongPress();
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  useEffect(() => () => clearLongPress(), []);

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
      onContextMenu={(event) => {
        event.preventDefault();
        if (selected) openQuantityEditor();
      }}
      aria-pressed={selected}
      aria-label={
        selected
          ? `${item.name}, quantity ${line.quantity}. Tap to deselect, long press to edit quantity.`
          : `${item.name}. Tap to select.`
      }
      className={`menu-item-card group flex h-full min-h-11 w-full min-w-0 max-w-full touch-manipulation select-none flex-col overflow-hidden rounded-lg border text-left transition-colors duration-150 ease-out active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta-600 ${
        selected
          ? 'border-paid bg-paid/8 shadow-[inset_0_0_0_1px_rgba(45,106,79,0.15)]'
          : 'border-ledger-200 bg-surface hover:border-ledger-700/25 hover:bg-ledger-50'
      }`}
    >
      <div className="menu-item-card__visual relative aspect-square w-full max-w-full shrink-0 overflow-hidden bg-ledger-100 sm:aspect-4/3">
        {!imageFailed ? (
          <div
            className="h-full w-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${getMenuItemImageUrl(item)}")` }}
            aria-hidden
          >
            <img
              src={getMenuItemImageUrl(item)}
              alt=""
              aria-hidden
              className="menu-item-card__probe hidden"
              onError={() => setImageFailed(true)}
            />
          </div>
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-ledger-100 px-2 text-center text-[10px] font-medium leading-tight text-ledger-600"
            aria-hidden
          >
            {item.name}
          </div>
        )}
        {selected ? (
          <>
            <span
              className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-paid text-[10px] font-semibold text-white shadow-sm sm:right-2 sm:top-2 sm:size-7 sm:text-xs"
              aria-hidden
            >
              ✓
            </span>
            <span
              className="absolute bottom-1.5 left-1.5 rounded-lg bg-surface/95 px-1.5 py-0.5 font-mono text-[56px] font-semibold text-ledger-900 shadow-sm"
              aria-hidden
            >
              ×{line.quantity}
            </span>
          </>
        ) : null}
      </div>
      <div className="flex min-h-11 flex-1 flex-col items-start justify-start gap-0.5 px-2 py-2 sm:px-2.5 sm:py-2.5">
        <span
          className={`line-clamp-2 w-full min-w-0 text-xs font-medium leading-snug break-words sm:text-sm ${
            selected ? 'text-paid' : 'text-ledger-900'
          }`}
        >
          {item.name}
        </span>
      </div>
    </button>
  );
}

export function OrderMenuLinesSection({
  lines,
  items,
  personsCount,
  onUpdateLine,
}: OrderMenuLinesSectionProps) {
  const itemById = useMemo(() => new Map(items?.map((item) => [item.id, item]) ?? []), [items]);

  const categoryGroups = useMemo(
    () => (items?.length ? groupMenuLinesByCategory(lines, items) : []),
    [lines, items],
  );

  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [quantityEdit, setQuantityEdit] = useState<QuantityEditTarget | null>(null);
  const categoryStripRef = useRef<HTMLDivElement>(null);
  const categoryPillRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setActiveCategoryIndex(0);
  }, [categoryGroups.length, items?.length]);

  useEffect(() => {
    if (activeCategoryIndex > categoryGroups.length - 1) {
      setActiveCategoryIndex(Math.max(0, categoryGroups.length - 1));
    }
  }, [activeCategoryIndex, categoryGroups.length]);

  useEffect(() => {
    const strip = categoryStripRef.current;
    const pill = categoryPillRefs.current[activeCategoryIndex];
    if (!strip || !pill) return;

    const targetLeft = pill.offsetLeft - strip.clientWidth / 2 + pill.clientWidth / 2;
    strip.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: 'smooth',
    });
  }, [activeCategoryIndex]);

  const totalSelected = useMemo(() => categorySelectedCount(lines), [lines]);

  const handleSaveQuantity = (quantity: number) => {
    if (!quantityEdit) return;
    onUpdateLine(quantityEdit.lineKey, {
      included: true,
      quantity,
    });
  };

  if (!items?.length) {
    return (
      <section className="w-full min-w-0 max-w-full rounded-md border border-ledger-200 bg-ledger-50 p-4">
        <h3 className="text-sm font-semibold text-ledger-900">Menu items</h3>
        <p className="mt-2 text-sm text-ledger-700">Loading menu catalog…</p>
      </section>
    );
  }

  if (personsCount < 1) {
    return (
      <section className="w-full min-w-0 max-w-full rounded-md border border-ledger-200 bg-ledger-50 p-4">
        <h3 className="text-sm font-semibold text-ledger-900">Menu items</h3>
        <p className="mt-2 text-sm text-ledger-700">Enter the number of persons to build the menu.</p>
      </section>
    );
  }

  const activeGroup = categoryGroups[activeCategoryIndex];
  const isFirstCategory = activeCategoryIndex === 0;
  const isLastCategory = activeCategoryIndex === categoryGroups.length - 1;
  const activeSelected = activeGroup ? categorySelectedCount(activeGroup.lines) : 0;

  return (
    <>
      <section className="w-full min-w-0 max-w-full space-y-3 overflow-hidden py-4 px-2 sm:space-y-4 sm:rounded-md sm:border sm:border-ledger-200 sm:bg-surface sm:p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="min-w-0 text-sm font-semibold text-ledger-900">Menu items</h3>
            <p className="shrink-0 rounded-full border border-ledger-200 bg-ledger-50 px-2 py-0.5 text-[11px] font-medium text-ledger-700 sm:px-2.5 sm:py-1 sm:text-xs">
              {totalSelected} selected
            </p>
          </div>
          <p className="text-xs leading-relaxed text-ledger-700 sm:text-sm">
            <span className="sm:hidden">
              Tap to select · long press selected dish to edit qty ({personsCount} default)
            </span>
            <span className="hidden sm:inline">
              Tap dishes to include them ({personsCount} per person). Long press a selected dish to
              change its quantity.
            </span>
          </p>
        </div>

        <div
          ref={categoryStripRef}
          className="flex w-full min-w-0 max-w-full gap-1.5 overflow-x-auto overscroll-x-contain pb-0.5 scrollbar-none"
        >
          {categoryGroups.map((group, index) => {
            const selectedInGroup = categorySelectedCount(group.lines);
            const isActive = index === activeCategoryIndex;
            const isComplete = selectedInGroup > 0;

            return (
              <button
                key={group.key}
                ref={(node) => {
                  categoryPillRefs.current[index] = node;
                }}
                type="button"
                onClick={() => setActiveCategoryIndex(index)}
                className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-3 text-xs font-medium transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta-600 ${
                  isActive
                    ? 'border-terracotta-500 bg-terracotta-500/10 text-ledger-900'
                    : isComplete
                      ? 'border-paid/40 bg-paid/8 text-paid'
                      : 'border-ledger-200 bg-surface text-ledger-700 hover:bg-ledger-50'
                }`}
              >
                {group.label}
                {selectedInGroup > 0 ? ` · ${selectedInGroup}` : ''}
              </button>
            );
          })}
        </div>

        {activeGroup ? (
          <>
            <div className="flex flex-col gap-1 border-b border-ledger-100 pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-ledger-700 sm:text-xs">
                  Category {activeCategoryIndex + 1} of {categoryGroups.length}
                </p>
                <h4 className="truncate text-sm font-semibold text-ledger-900 sm:text-base">{activeGroup.label}</h4>
              </div>
              <p className="shrink-0 text-[11px] text-ledger-700 sm:text-xs">
                {activeSelected}/{activeGroup.lines.length} selected
              </p>
            </div>

            <div className="relative w-full min-w-0">
              <div
                className="pointer-events-none fixed inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-1.5 sm:absolute sm:inset-0 sm:z-10 sm:px-0.5"
                aria-hidden={false}
              >
                <Button
                  type="button"
                  size="sm"
                  disabled={isFirstCategory}
                  onClick={() => setActiveCategoryIndex((prev) => Math.max(0, prev - 1))}
                  aria-label="Previous category"
                  className="pointer-events-auto size-9 shrink-0 rounded-full bg-terracotta-500/90 px-0 shadow-md backdrop-blur-sm sm:h-9 sm:min-h-9 sm:w-auto sm:rounded-md sm:bg-terracotta-500 sm:px-3 sm:shadow-none sm:backdrop-blur-none"
                >
                  <span aria-hidden className="text-base leading-none sm:hidden">
                    ‹
                  </span>
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                {!isLastCategory ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      setActiveCategoryIndex((prev) => Math.min(categoryGroups.length - 1, prev + 1))
                    }
                    aria-label="Next category"
                    className="pointer-events-auto size-9 shrink-0 rounded-full bg-terracotta-500/90 px-0 shadow-md backdrop-blur-sm sm:h-9 sm:min-h-9 sm:w-auto sm:rounded-md sm:bg-terracotta-500 sm:px-3 sm:shadow-none sm:backdrop-blur-none"
                  >
                    <span aria-hidden className="text-base leading-none sm:hidden">
                      ›
                    </span>
                    <span className="hidden sm:inline">Next</span>
                  </Button>
                ) : null}
              </div>

              <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                {activeGroup.lines.map((line) => {
                  const item = itemById.get(line.item_id);
                  if (!item) return null;
                  return (
                    <div key={line.key} className="min-w-0 max-w-full">
                      <MenuItemCard
                        item={item}
                        line={line}
                        personsCount={personsCount}
                        onUpdateLine={onUpdateLine}
                        onEditQuantity={setQuantityEdit}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {isLastCategory ? (
              <p className="border-t border-ledger-100 pt-3 text-center text-[11px] leading-relaxed text-ledger-700 sm:text-xs">
                All categories reviewed — tap Continue when ready.
              </p>
            ) : null}
          </>
        ) : null}
      </section>

      <MenuItemQuantityDialog
        open={!!quantityEdit}
        itemName={quantityEdit?.itemName ?? ''}
        imageUrl={quantityEdit?.imageUrl ?? ''}
        quantity={quantityEdit?.quantity ?? personsCount}
        personsCount={personsCount}
        onClose={() => setQuantityEdit(null)}
        onSave={handleSaveQuantity}
      />
    </>
  );
}
