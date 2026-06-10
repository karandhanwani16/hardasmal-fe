import brandLogo from '@brand-logo';
import brandTextLogo from '@brand-text-logo';
import {
  formatReceiptAmount,
  RECEIPT_BRAND,
  type OrderReceiptData,
} from '../../lib/order-receipt';
import './order-delivery-receipt.css';

interface OrderDeliveryReceiptProps {
  data: OrderReceiptData;
  className?: string;
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`delivery-receipt__checkbox${checked ? ' delivery-receipt__checkbox--checked' : ''}`}
      aria-hidden
    />
  );
}

function PhoneWhatsAppIcon() {
  return (
    <svg className="delivery-receipt__phone-icon" viewBox="0 0 16 16" aria-hidden>
      <path
        fill="currentColor"
        d="M8 0a8 8 0 0 0-6.87 12.04L0 16l4.08-1.07A8 8 0 1 0 8 0Zm4.55 11.38c-.19.53-1.1.98-1.52 1.04-.39.06-.88.09-1.44-.09-.33-.11-.76-.26-1.31-.51-2.3-1-3.8-3.35-3.91-3.51-.11-.16-.93-1.24-.93-2.37 0-1.12.59-1.68.8-1.91.2-.23.44-.29.59-.29.15 0 .29 0 .42.01.14.01.32-.05.5.38.18.44.62 1.51.67 1.62.06.11.09.24.02.38-.07.15-.11.24-.22.37-.11.13-.23.29-.33.39-.11.1-.22.21-.1.41.11.2.51.84 1.1 1.36.76.67 1.4.88 1.6.98.2.1.32.08.44-.05.12-.13.51-.59.65-.79.14-.2.27-.17.46-.1.19.07 1.2.57 1.41.67.21.1.35.15.4.23.05.08.05.47-.14 1Z"
      />
    </svg>
  );
}

function PhoneHandsetIcon() {
  return (
    <svg className="delivery-receipt__phone-icon" viewBox="0 0 16 16" aria-hidden>
      <path
        fill="currentColor"
        d="M3.2 1.5c-.5.2-.9.7-1 1.2-.2 1.1-.1 3.5 2.2 6.8 2.3 3.3 4.6 4.9 5.7 5.2.5.1 1.1 0 1.6-.3l1.4-1c.4-.3.5-.8.3-1.2l-.9-1.8c-.2-.4-.6-.6-1-.5l-1.2.4c-.3.1-.6 0-.8-.2l-1.5-1.8c-.2-.2-.2-.5-.1-.8l.5-1.1c.1-.4 0-.8-.3-1.1L5.6 2.1c-.3-.3-.8-.4-1.2-.2l-1.2.6Z"
      />
    </svg>
  );
}

export function OrderDeliveryReceipt({ data, className = '' }: OrderDeliveryReceiptProps) {
  const isLunch = data.mealType === 'lunch';
  const isDinner = data.mealType === 'dinner';

  return (
    <article
      className={`delivery-receipt ${className}`.trim()}
      aria-label="Customer delivery confirmation note"
    >
      <div className="delivery-receipt__sheet">
        <header className="delivery-receipt__header">
          <div className="delivery-receipt__logo" aria-hidden>
            <img className="delivery-receipt__logo-icon-img" src={brandLogo} alt="" />
          </div>
          <div className="delivery-receipt__brand-block">
            <img
              className="delivery-receipt__brand-text-img"
              src={brandTextLogo}
              alt="Hardasmal Restaurant and Catering Services"
            />
            <p className="delivery-receipt__address">{RECEIPT_BRAND.address}</p>
            <div className="delivery-receipt__phones">
              <span className="delivery-receipt__phone-line">
                <PhoneWhatsAppIcon />
                <span>{RECEIPT_BRAND.phones.whatsapp}</span>
              </span>
              <span className="delivery-receipt__phone-line">
                <PhoneHandsetIcon />
                <span>{RECEIPT_BRAND.phones.landline}</span>
              </span>
            </div>
          </div>
        </header>

        <div className="delivery-receipt__title-bar">{RECEIPT_BRAND.title}</div>

        <div className="delivery-receipt__meta">
          <div className="delivery-receipt__meta-row delivery-receipt__meta-row--split">
            <div className="delivery-receipt__meta-cell">
              <span className="delivery-receipt__label">No. :</span>
              <span className="delivery-receipt__value">{data.orderNumber}</span>
            </div>
            <div className="delivery-receipt__meta-cell">
              <span className="delivery-receipt__label">Date :</span>
              <span className="delivery-receipt__value">{data.date}</span>
            </div>
          </div>
          <div className="delivery-receipt__meta-row">
            <span className="delivery-receipt__label">Name :</span>
            <span className="delivery-receipt__value">{data.customerName}</span>
          </div>
          <div className="delivery-receipt__meta-row">
            <span className="delivery-receipt__label">Address :</span>
            <span className="delivery-receipt__value">{data.customerAddress}</span>
          </div>
          <div className="delivery-receipt__meta-row delivery-receipt__meta-row--address-extra">
            <span className="delivery-receipt__label delivery-receipt__label--empty" aria-hidden>
              &nbsp;
            </span>
            <span className="delivery-receipt__value" />
          </div>
          <div className="delivery-receipt__meta-row delivery-receipt__meta-row--split">
            <div className="delivery-receipt__meta-cell">
              <span className="delivery-receipt__label">Mob. No. :</span>
              <span className="delivery-receipt__value">{data.customerPhone}</span>
            </div>
            <div className="delivery-receipt__meta-cell">
              <span className="delivery-receipt__label">No. of Person :</span>
              <span className="delivery-receipt__value">
                {data.persons > 0 ? data.persons : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="delivery-receipt__body">
          <section
            className="delivery-receipt__col delivery-receipt__col--menu"
            aria-label="Menu items"
          >
            <p className="delivery-receipt__section-title">DESCRIPTION</p>
            {data.menuRows.length > 0 ? (
              data.menuRows.map((row) => (
                <div key={row.key} className="delivery-receipt__menu-row">
                  <span className="delivery-receipt__menu-label">{row.label}</span>
                  <span className="delivery-receipt__qty">{row.quantity}</span>
                </div>
              ))
            ) : (
              <div className="delivery-receipt__menu-row delivery-receipt__menu-row--empty">
                <span className="delivery-receipt__menu-label">—</span>
                <span className="delivery-receipt__qty" />
              </div>
            )}
          </section>

          <section
            className="delivery-receipt__col delivery-receipt__col--options"
            aria-label="Meal and crockery"
          >
            <div className="delivery-receipt__meal-options">
              <div className="delivery-receipt__option">
                <CheckBox checked={isLunch} />
                <span>LUNCH</span>
              </div>
              <div className="delivery-receipt__option">
                <CheckBox checked={isDinner} />
                <span>DINNER</span>
              </div>
              <div className="delivery-receipt__option">
                <CheckBox checked={data.dietaryWithoutOnionGarlic} />
                <span>WITHOUT ONION &amp; GARLIC</span>
              </div>
              <div className="delivery-receipt__option">
                <CheckBox
                  checked={data.dietaryRegular && !data.dietaryWithoutOnionGarlic}
                />
                <span>REGULAR</span>
              </div>
            </div>

            <p className="delivery-receipt__section-title delivery-receipt__section-title--red">
              CROCKERY DETAILS
            </p>
            {data.crockeryRows.length > 0 ? (
              data.crockeryRows.map((row) => (
                <div key={row.key} className="delivery-receipt__crockery-row">
                  <span className="delivery-receipt__crockery-label">{row.label}</span>
                  <span className="delivery-receipt__qty">{row.quantity}</span>
                </div>
              ))
            ) : (
              <div className="delivery-receipt__crockery-row delivery-receipt__crockery-row--empty">
                <span className="delivery-receipt__crockery-label">—</span>
                <span className="delivery-receipt__qty" />
              </div>
            )}
            {data.extraCrockeryNote ? (
              <div className="delivery-receipt__crockery-note">
                <span className="delivery-receipt__crockery-label">REMARKS</span>
                <p className="delivery-receipt__crockery-note-body">{data.extraCrockeryNote}</p>
              </div>
            ) : null}

            <div className="delivery-receipt__finances">
              {data.persons > 0 && data.perPlateCost > 0 ? (
                <div className="delivery-receipt__finance-row">
                  <span>Per plate ({data.persons} pax) :</span>
                  <span className="delivery-receipt__finance-value">
                    {formatReceiptAmount(data.perPlateCost)}
                  </span>
                </div>
              ) : null}
              {data.plateSubtotal > 0 ? (
                <div className="delivery-receipt__finance-row">
                  <span>Food subtotal :</span>
                  <span className="delivery-receipt__finance-value">
                    {formatReceiptAmount(data.plateSubtotal)}
                  </span>
                </div>
              ) : null}
              {data.totalBill > 0 ? (
                <>
                  <div className="delivery-receipt__finance-row">
                    <span>Transportation :</span>
                    <span className="delivery-receipt__finance-value">
                      {formatReceiptAmount(data.transportationCharges)}
                    </span>
                  </div>
                  <div className="delivery-receipt__finance-row">
                    <span>Washing :</span>
                    <span className="delivery-receipt__finance-value">
                      {formatReceiptAmount(data.washingCharges)}
                    </span>
                  </div>
                </>
              ) : null}
              {data.crockeryFine > 0 ? (
                <div className="delivery-receipt__finance-row">
                  <span>Crockery fine :</span>
                  <span className="delivery-receipt__finance-value">
                    {formatReceiptAmount(data.crockeryFine)}
                  </span>
                </div>
              ) : null}
              <div className="delivery-receipt__finance-row delivery-receipt__finance-row--total">
                <span>Total bill :</span>
                <span className="delivery-receipt__finance-value">
                  {data.totalBill > 0 || data.crockeryFine > 0
                    ? formatReceiptAmount(data.totalBill + data.crockeryFine)
                    : ''}
                </span>
              </div>
              <div className="delivery-receipt__finance-row">
                <span>Advance :</span>
                <span className="delivery-receipt__finance-value">
                  {data.totalBill > 0 || data.advance > 0
                    ? formatReceiptAmount(data.advance)
                    : ''}
                </span>
              </div>
              {data.advance > 0 ? (
                <div className="delivery-receipt__finance-row">
                  <span>Advance mode :</span>
                  <span className="delivery-receipt__finance-value delivery-receipt__finance-value--line">
                    {data.advancePaymentMode || '—'}
                  </span>
                </div>
              ) : null}
              <div className="delivery-receipt__finance-row delivery-receipt__finance-row--balance">
                <span>Balance due :</span>
                <span className="delivery-receipt__finance-value">
                  {data.totalBill > 0 || data.advance > 0
                    ? formatReceiptAmount(data.balance)
                    : ''}
                </span>
              </div>
              <div className="delivery-receipt__finance-row delivery-receipt__finance-row--delivery">
                <span>Delivery boy :</span>
                <span className="delivery-receipt__finance-value delivery-receipt__finance-value--line">
                  {data.deliveryBoyName}
                </span>
              </div>
            </div>
          </section>
        </div>

        <footer className="delivery-receipt__footer">
          <div className="delivery-receipt__note">
            <p className="delivery-receipt__note-heading">{RECEIPT_BRAND.crockeryNoteHeading}</p>
            <p className="delivery-receipt__note-body">{RECEIPT_BRAND.crockeryNoteBody}</p>
          </div>
          <div className="delivery-receipt__footer-mid">
            <div className="delivery-receipt__footer-field delivery-receipt__footer-field--items">
              <span className="delivery-receipt__footer-label">TOTAL ITEMS :</span>
              <span className="delivery-receipt__items-box">
                {data.totalItems > 0 ? data.totalItems : ''}
              </span>
            </div>
            <div className="delivery-receipt__footer-field delivery-receipt__footer-field--guest">
              <span className="delivery-receipt__footer-label">Guest Sign. :</span>
              <span className="delivery-receipt__sign-line" aria-label="Guest signature" />
            </div>
            <p className="delivery-receipt__company-footer">{RECEIPT_BRAND.footer}</p>
          </div>
        </footer>
      </div>
    </article>
  );
}
