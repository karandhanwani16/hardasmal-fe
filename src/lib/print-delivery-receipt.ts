import receiptStyles from '../components/orders/order-delivery-receipt.css?inline';

/** A5 print document — receipt is 148mm wide, same as A5 paper width. */
const PRINT_DOCUMENT_STYLES = `
@page {
  size: A5 portrait;
  margin: 0;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 148mm;
  min-height: 210mm;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  color-adjust: exact;
}

body {
  display: block;
}

.delivery-receipt {
  margin: 0;
  padding: 0;
  width: 148mm;
  max-width: 148mm;
}

.delivery-receipt__sheet {
  width: 148mm;
  max-width: 148mm;
  margin: 0;
  box-shadow: none;
  border-radius: 0;
}

@media print {
  html,
  body {
    width: 148mm;
    height: auto;
    overflow: visible !important;
  }

  .delivery-receipt,
  .delivery-receipt__sheet {
    width: 148mm !important;
    max-width: 148mm !important;
    page-break-inside: avoid;
  }

  .delivery-receipt__logo-icon-img {
    width: 22mm !important;
    height: 20mm !important;
    max-width: none !important;
  }

  .delivery-receipt__brand-text-img {
    width: 321px !important;
    height: 80px !important;
    max-width: 321px !important;
    max-height: 80px !important;
  }

  .delivery-receipt__title-bar,
  .delivery-receipt__logo,
  .delivery-receipt__brand-text-img,
  .delivery-receipt__note-heading,
  .delivery-receipt__note-body,
  .delivery-receipt__footer-field--items .delivery-receipt__footer-label,
  .delivery-receipt__section-title--red {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;

const PRINT_READY_SCRIPT = `
(function () {
  function waitForImages() {
    var imgs = Array.prototype.slice.call(document.images || []);
    if (!imgs.length) return Promise.resolve();
    return Promise.all(
      imgs.map(function (img) {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise(function (resolve) {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        });
      }),
    );
  }

  function triggerPrint() {
    waitForImages().then(function () {
      requestAnimationFrame(function () {
        window.focus();
        window.print();
      });
    });
  }

  window.addEventListener('afterprint', function () {
    if (window.opener) {
      window.close();
    }
  });

  if (document.readyState === 'complete') {
    setTimeout(triggerPrint, 150);
  } else {
    window.addEventListener('load', function () {
      setTimeout(triggerPrint, 150);
    });
  }
})();
`;

function buildPrintHtml(receiptHtml: string): string {
  const styles = `${receiptStyles}\n${PRINT_DOCUMENT_STYLES}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=148mm" />
  <title>Customer delivery confirmation note</title>
  <style>${styles}</style>
</head>
<body>
  ${receiptHtml}
  <script>${PRINT_READY_SCRIPT}<\/script>
</body>
</html>`;
}

function resolveImageSources(root: HTMLElement): void {
  root.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (!src || src.startsWith('data:')) return;
    try {
      img.setAttribute('src', new URL(src, window.location.href).href);
    } catch {
      // keep original src
    }
  });
}

function printViaIframe(html: string): boolean {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'Print delivery receipt');
  iframe.style.cssText =
    'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none';

  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = iframe.contentDocument ?? win?.document;
  if (!win || !doc) {
    iframe.remove();
    return false;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = (() => {
    let done = false;
    return () => {
      if (done) return;
      done = true;
      iframe.remove();
    };
  })();

  const doPrint = () => {
    const images = Array.from(doc.images);
    const wait =
      images.length === 0
        ? Promise.resolve()
        : Promise.all(
            images.map(
              (img) =>
                new Promise<void>((resolve) => {
                  if (img.complete && img.naturalWidth > 0) {
                    resolve();
                    return;
                  }
                  img.addEventListener('load', () => resolve(), { once: true });
                  img.addEventListener('error', () => resolve(), { once: true });
                }),
            ),
          );

    wait.then(() => {
      requestAnimationFrame(() => {
        win.focus();
        win.print();
      });
    });
  };

  if (doc.readyState === 'complete') {
    setTimeout(doPrint, 150);
  } else {
    iframe.addEventListener('load', () => setTimeout(doPrint, 150), { once: true });
  }

  win.addEventListener('afterprint', cleanup, { once: true });
  // Fallback cleanup if afterprint never fires (some browsers)
  setTimeout(cleanup, 60_000);

  return true;
}

function printViaPopup(html: string): boolean {
  const printWindow = window.open('about:blank', '_blank');
  if (!printWindow) {
    return false;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  return true;
}

/**
 * Opens an isolated A5 print document with only the receipt markup.
 * Uses a hidden iframe first (avoids pop-up blockers), then falls back to a new tab.
 */
export function printDeliveryReceipt(receiptRoot: Element): boolean {
  const clone = receiptRoot.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  resolveImageSources(clone);

  const html = buildPrintHtml(clone.outerHTML);

  if (printViaIframe(html)) {
    return true;
  }

  const opened = printViaPopup(html);
  if (!opened) {
    return false;
  }

  return true;
}
