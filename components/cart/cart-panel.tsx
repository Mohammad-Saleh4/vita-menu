"use client";

import { X, Minus, Plus, MessageCircle } from "lucide-react";
import {
  getItemName,
  useCartStore,
  type CartItem,
  type OrderType,
} from "@/store/cart";

type CartPanelProps = {
  restaurantName: string;
  currency: string;
  isArabic?: boolean;
};

const ORDER_TYPES: OrderType[] = ["Dine-in", "Delivery", "Takeaway"];

function formatWhatsAppNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

function buildOrderMessage(
  restaurantName: string,
  items: CartItem[],
  grandTotal: number,
  currency: string,
  isArabic: boolean,
  orderType: OrderType,
  tableNumber: string,
  customerName: string,
  customerPhone: string,
  deliveryAddress: string,
  deliveryNotes: string
): string {
  const itemLines = items.flatMap((item) => {
    const name = getItemName(item, isArabic);
    const lineTotal = item.price * item.quantity;
    const rows = [
      `- ${item.quantity} x ${name} — ${currency} ${lineTotal.toLocaleString()}`,
    ];
    if (item.note?.trim()) {
      rows.push(`  _Note: ${item.note.trim()}_`);
    }
    return rows;
  });

  const sections: string[] = [
    `*New Order — ${restaurantName}*`,
    "",
    `*Order Type:* ${orderType}`,
  ];

  if (orderType === "Dine-in" && tableNumber.trim()) {
    sections.push(`*Table Number:* ${tableNumber.trim()}`);
  }

  if (orderType === "Delivery") {
    if (customerName.trim()) {
      sections.push(`*Name:* ${customerName.trim()}`);
    }
    if (customerPhone.trim()) {
      sections.push(`*Phone:* ${customerPhone.trim()}`);
    }
    if (deliveryAddress.trim()) {
      sections.push(`*Delivery Address:* ${deliveryAddress.trim()}`);
    }
    if (deliveryNotes.trim()) {
      sections.push(`*Notes:* ${deliveryNotes.trim()}`);
    }
  }

  sections.push(
    "",
    "*Items:*",
    ...itemLines,
    "",
    `*Grand Total:* ${currency} ${grandTotal.toLocaleString()}`
  );

  return sections.join("\n");
}

function SlideOverShell({
  isArabic,
  onBackdropClose,
  onHeaderClose,
  title,
  children,
  footer,
}: {
  isArabic?: boolean;
  onBackdropClose: () => void;
  onHeaderClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <>
      <button
        type="button"
        aria-label={isArabic ? "إغلاق" : "Close cart overlay"}
        onClick={onBackdropClose}
        className="fixed inset-0 z-50 bg-zinc-900/40 transition-opacity"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-panel-title"
        dir={isArabic ? "rtl" : "ltr"}
        className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-xl transition-transform duration-300 ease-out md:w-[400px] md:max-w-[400px]"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2
            id="cart-panel-title"
            className="text-lg font-semibold text-zinc-900"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onHeaderClose}
            aria-label={
              isArabic ? "إغلاق أو رجوع" : "Close or go back"
            }
            className="rounded-full p-2 hover:bg-zinc-100"
          >
            <X className="h-5 w-5 text-zinc-600" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {footer && (
          <footer className="shrink-0 border-t border-zinc-100 bg-white px-5 py-4">
            {footer}
          </footer>
        )}
      </aside>
    </>
  );
}

function CheckoutForm({ isArabic }: { isArabic?: boolean }) {
  const orderType = useCartStore((s) => s.orderType);
  const tableNumber = useCartStore((s) => s.tableNumber);
  const customerName = useCartStore((s) => s.customerName);
  const customerPhone = useCartStore((s) => s.customerPhone);
  const deliveryAddress = useCartStore((s) => s.deliveryAddress);
  const deliveryNotes = useCartStore((s) => s.deliveryNotes);
  const setOrderType = useCartStore((s) => s.setOrderType);
  const setTableNumber = useCartStore((s) => s.setTableNumber);
  const setCustomerName = useCartStore((s) => s.setCustomerName);
  const setCustomerPhone = useCartStore((s) => s.setCustomerPhone);
  const setDeliveryAddress = useCartStore((s) => s.setDeliveryAddress);
  const setDeliveryNotes = useCartStore((s) => s.setDeliveryNotes);

  const fieldClassName =
    "w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-emerald-800";
  const labelClassName =
    "mb-2 block text-xs font-semibold tracking-wide text-zinc-500";

  return (
    <div className="space-y-6">
      <section>
        <p className="mb-3 text-xs font-semibold tracking-wide text-zinc-500">
          {isArabic ? "نوع الطلب" : "ORDER TYPE"}
        </p>
        <div className="flex gap-2">
          {ORDER_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={`flex-1 rounded-full border px-2 py-2.5 text-xs font-semibold transition ${
                orderType === type
                  ? "border-emerald-800 bg-emerald-800 text-white shadow-sm"
                  : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      {orderType === "Dine-in" && (
        <section>
          <label
            htmlFor="table-number"
            className="mb-2 block text-xs font-semibold tracking-wide text-zinc-500"
          >
            {isArabic ? "رقم الطاولة (اختياري)" : "TABLE NUMBER (OPTIONAL)"}
          </label>
          <input
            id="table-number"
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder={isArabic ? "مثال: طاولة 5" : "e.g., Table 5"}
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-emerald-800"
          />
        </section>
      )}

      {orderType === "Delivery" && (
        <section className="space-y-4">
          <div>
            <label htmlFor="customer-name" className={labelClassName}>
              {isArabic ? "اسمك" : "YOUR NAME"}
            </label>
            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={isArabic ? "الاسم الكامل" : "Full name"}
              className={fieldClassName}
            />
          </div>

          <div>
            <label htmlFor="customer-phone" className={labelClassName}>
              {isArabic ? "رقم هاتفك" : "YOUR PHONE NUMBER"}
            </label>
            <input
              id="customer-phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+961..."
              className={fieldClassName}
            />
          </div>

          <div>
            <label htmlFor="delivery-address" className={labelClassName}>
              {isArabic ? "عنوان التوصيل" : "DELIVERY ADDRESS"}
            </label>
            <textarea
              id="delivery-address"
              rows={3}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder={
                isArabic
                  ? "الشارع، المبنى، الطابق، معالم..."
                  : "Street, building, floor, landmarks..."
              }
              className={`${fieldClassName} resize-none`}
            />
          </div>

          <div>
            <label htmlFor="delivery-notes" className={labelClassName}>
              {isArabic ? "ملاحظات" : "NOTES"}
            </label>
            <textarea
              id="delivery-notes"
              rows={2}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder={
                isArabic
                  ? "تعليمات إضافية للتوصيل..."
                  : "Any extra delivery instructions..."
              }
              className={`${fieldClassName} resize-none`}
            />
          </div>
        </section>
      )}
    </div>
  );
}

export function CartPanel({
  restaurantName,
  currency,
  isArabic,
}: CartPanelProps) {
  const isOpen = useCartStore((s) => s.isOpen);
  const view = useCartStore((s) => s.view);
  const items = useCartStore((s) => s.items);
  const orderType = useCartStore((s) => s.orderType);
  const tableNumber = useCartStore((s) => s.tableNumber);
  const customerName = useCartStore((s) => s.customerName);
  const customerPhone = useCartStore((s) => s.customerPhone);
  const deliveryAddress = useCartStore((s) => s.deliveryAddress);
  const deliveryNotes = useCartStore((s) => s.deliveryNotes);
  const whatsappNumber = useCartStore((s) => s.whatsappNumber);

  const closeCart = useCartStore((s) => s.closeCart);
  const setView = useCartStore((s) => s.setView);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const updateNote = useCartStore((s) => s.updateNote);
  const clearCart = useCartStore((s) => s.clearCart);

  const itemCount = items.reduce((sum, line) => sum + line.quantity, 0);
  const grandTotal = items.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0
  );

  if (!isOpen) return null;

  function handleHeaderClose() {
    if (view === "checkout") {
      setView("cart");
    } else {
      closeCart();
    }
  }

  function handleSendWhatsApp() {
    if (!whatsappNumber || items.length === 0) return;

    if (
      orderType === "Delivery" &&
      (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim())
    ) {
      return;
    }

    const message = buildOrderMessage(
      restaurantName,
      items,
      grandTotal,
      currency,
      isArabic ?? false,
      orderType,
      tableNumber,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryNotes
    );
    const phone = formatWhatsAppNumber(whatsappNumber);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  const title =
    view === "checkout"
      ? isArabic
        ? "إتمام الطلب"
        : "Checkout"
      : isArabic
        ? `طلبك (${itemCount})`
        : `Your Order (${itemCount})`;

  const footer =
    items.length > 0 ? (
      <>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-base font-semibold text-zinc-900">
            {isArabic ? "المجموع" : "Total"}
          </span>
          <span className="text-base font-bold text-zinc-900">
            {currency} {grandTotal.toLocaleString()}
          </span>
        </div>

        {view === "cart" ? (
          <button
            type="button"
            onClick={() => setView("checkout")}
            className="w-full rounded-xl bg-emerald-800 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-900"
          >
            {isArabic ? "متابعة الدفع" : "Proceed to Checkout"}
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={
                !whatsappNumber ||
                (orderType === "Delivery" &&
                  (!customerName.trim() ||
                    !customerPhone.trim() ||
                    !deliveryAddress.trim()))
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MessageCircle className="h-5 w-5" />
              {isArabic
                ? "إرسال الطلب عبر واتساب"
                : "Send Order via WhatsApp"}
            </button>
            <button
              type="button"
              onClick={clearCart}
              className="text-sm text-zinc-500 transition hover:text-red-600"
            >
              {isArabic ? "إفراغ السلة" : "Clear cart"}
            </button>
          </div>
        )}
      </>
    ) : undefined;

  return (
    <SlideOverShell
      isArabic={isArabic}
      onBackdropClose={closeCart}
      onHeaderClose={handleHeaderClose}
      title={title}
      footer={footer}
    >
      {view === "cart" ? (
        items.length === 0 ? (
          <p className="py-12 text-center text-sm text-zinc-500">
            {isArabic ? "السلة فارغة." : "Your cart is empty."}
          </p>
        ) : (
          <ul className="space-y-6">
            {items.map((item) => {
              const lineTotal = item.price * item.quantity;
              return (
                <li
                  key={item.id}
                  className="border-b border-zinc-100 pb-6 last:border-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900">
                        {getItemName(item, isArabic ?? false)}
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-500">
                        {currency} {item.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        aria-label={isArabic ? "تقليل" : "Decrease quantity"}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition hover:bg-zinc-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold text-zinc-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        aria-label={isArabic ? "زيادة" : "Increase quantity"}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition hover:bg-zinc-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="w-24 shrink-0 text-right text-sm font-semibold text-zinc-900">
                      {currency} {lineTotal.toLocaleString()}
                    </p>
                  </div>

                  <input
                    type="text"
                    value={item.note ?? ""}
                    onChange={(e) => updateNote(item.id, e.target.value)}
                    placeholder={
                      isArabic
                        ? "أضف ملاحظة (اختياري)"
                        : "Add a note (optional)"
                    }
                    className="mt-3 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-400"
                  />
                </li>
              );
            })}
          </ul>
        )
      ) : (
        <CheckoutForm isArabic={isArabic} />
      )}
    </SlideOverShell>
  );
}
