import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

interface ReceiptScaleFitProps {
  children: ReactNode;
  active?: boolean;
}

/**
 * Scales receipt content down on narrow viewports while preserving the exact A5 layout.
 * Clips the scaled layer so it cannot widen the scroll container horizontally.
 */
export function ReceiptScaleFit({ children, active = true }: ReceiptScaleFitProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!active) {
      setFit({ scale: 1, width: 0, height: 0 });
      return;
    }

    const root = rootRef.current;
    const inner = innerRef.current;
    if (!root || !inner) return;

    const measure = () => {
      inner.style.transform = 'none';
      inner.style.width = '';
      inner.style.height = '';

      const naturalWidth = inner.offsetWidth;
      const naturalHeight = inner.offsetHeight;
      if (!naturalWidth || !naturalHeight) return;

      const available = root.clientWidth;
      const scale = Math.min(1, available / naturalWidth);
      setFit({ scale, width: naturalWidth, height: naturalHeight });
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(inner);

    return () => observer.disconnect();
  }, [active, children]);

  const isScaled = fit.scale < 1 && fit.width > 0;
  const scaledWidth = fit.width * fit.scale;
  const scaledHeight = fit.height * fit.scale;

  return (
    <div ref={rootRef} className="delivery-receipt-scale-viewport w-full min-w-0">
      <div
        className={`mx-auto max-w-full${isScaled ? ' delivery-receipt-scale-clip' : ''}`}
        style={
          isScaled
            ? { width: scaledWidth, height: scaledHeight }
            : { width: 'max-content', maxWidth: '100%' }
        }
      >
        <div
          ref={innerRef}
          className={`delivery-receipt-scale-inner${isScaled ? ' delivery-receipt-scale-inner--scaled' : ''}`}
          style={
            isScaled
              ? {
                  width: fit.width,
                  height: fit.height,
                  transform: `scale(${fit.scale})`,
                }
              : undefined
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
