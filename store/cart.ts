import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  quantity: number;
  note?: string;
};

export type CartView = "cart" | "checkout";
export type OrderType = "Dine-in" | "Delivery" | "Takeaway";

type CartState = {
  restaurantSlug: string | null;
  whatsappNumber: string | null;
  currency: string;
  items: CartItem[];
  isOpen: boolean;
  view: CartView;
  orderType: OrderType;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryNotes: string;
  setRestaurant: (data: {
    slug: string;
    whatsappNumber: string;
    currency: string;
  }) => void;
  openCart: () => void;
  closeCart: () => void;
  setView: (view: CartView) => void;
  addItem: (item: {
    id: string;
    nameEn: string;
    nameAr: string;
    price: number;
  }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNote: (id: string, note: string) => void;
  setOrderType: (orderType: OrderType) => void;
  setTableNumber: (tableNumber: string) => void;
  setCustomerName: (customerName: string) => void;
  setCustomerPhone: (customerPhone: string) => void;
  setDeliveryAddress: (deliveryAddress: string) => void;
  setDeliveryNotes: (deliveryNotes: string) => void;
  clearCart: () => void;
};

const tenantDefaults = {
  restaurantSlug: null as string | null,
  whatsappNumber: null as string | null,
  currency: "L.L.",
};

const cartDefaults = {
  items: [] as CartItem[],
  isOpen: false,
  view: "cart" as CartView,
  orderType: "Takeaway" as OrderType,
  tableNumber: "",
  customerName: "",
  customerPhone: "",
  deliveryAddress: "",
  deliveryNotes: "",
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      ...tenantDefaults,
      ...cartDefaults,

      setRestaurant: ({ slug, whatsappNumber, currency }) => {
        set((state) => {
          if (state.restaurantSlug && state.restaurantSlug !== slug) {
            return {
              ...tenantDefaults,
              ...cartDefaults,
              restaurantSlug: slug,
              whatsappNumber,
              currency,
            };
          }
          return { restaurantSlug: slug, whatsappNumber, currency };
        });
      },

      openCart: () => set({ isOpen: true, view: "cart" }),
      closeCart: () => set({ isOpen: false, view: "cart" }),
      setView: (view) => set({ view }),

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((line) => line.id === item.id);
          if (existing) {
            return {
              items: state.items.map((line) =>
                line.id === item.id
                  ? { ...line, quantity: line.quantity + 1 }
                  : line
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((line) => line.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((line) => line.id !== id)
              : state.items.map((line) =>
                  line.id === id ? { ...line, quantity } : line
                ),
        }));
      },

      updateNote: (id, note) => {
        set((state) => ({
          items: state.items.map((line) =>
            line.id === id ? { ...line, note: note.trim() || undefined } : line
          ),
        }));
      },

      setOrderType: (orderType) => {
        set((state) => ({
          orderType,
          tableNumber: orderType === "Dine-in" ? state.tableNumber : "",
          customerName: orderType === "Delivery" ? state.customerName : "",
          customerPhone: orderType === "Delivery" ? state.customerPhone : "",
          deliveryAddress:
            orderType === "Delivery" ? state.deliveryAddress : "",
          deliveryNotes: orderType === "Delivery" ? state.deliveryNotes : "",
        }));
      },

      setTableNumber: (tableNumber) => set({ tableNumber }),

      setCustomerName: (customerName) => set({ customerName }),

      setCustomerPhone: (customerPhone) => set({ customerPhone }),

      setDeliveryAddress: (deliveryAddress) => set({ deliveryAddress }),

      setDeliveryNotes: (deliveryNotes) => set({ deliveryNotes }),

      clearCart: () =>
        set({
          items: [],
          isOpen: false,
          view: "cart",
          orderType: "Takeaway",
          tableNumber: "",
          customerName: "",
          customerPhone: "",
          deliveryAddress: "",
          deliveryNotes: "",
        }),
    }),
    {
      name: "vitamin-menu-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        restaurantSlug: state.restaurantSlug,
        whatsappNumber: state.whatsappNumber,
        currency: state.currency,
        items: state.items,
        orderType: state.orderType,
        tableNumber: state.tableNumber,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        deliveryAddress: state.deliveryAddress,
        deliveryNotes: state.deliveryNotes,
      }),
    }
  )
);

export function getItemName(item: CartItem, isArabic: boolean): string {
  return isArabic ? item.nameAr : item.nameEn;
}
