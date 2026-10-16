import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { getProduct, type Product } from '../data';

/**
 * Tiny in-memory store so prototypes feel alive across flows:
 * add to cart on PDP → cart badge bumps → Cart screen lists it → checkout total updates.
 * Nothing is persisted; refresh resets the demo.
 *
 * Cart lines are keyed by product id. The optional fields are cart-owned (set from the cart
 * overlays) — flows that only know `{ product, qty }` keep working unchanged.
 */
export interface CartCustomizationAnswer {
  /** question code, e.g. 'engraving' */
  code: string;
  question: string;
  answer: string;
}

export interface CartLine {
  product: Product;
  qty: number;
  /** chosen variant label (NoonCartVariantsOverlayScreen), e.g. "46mm" or "Black" */
  variant?: string;
  /** NoonCartCustomizeOverlayScreen answers (engraving / gift text) */
  customization?: CartCustomizationAnswer[];
  /** extended-warranty / protection plan id added from the cart (see cartAddOns) */
  warranty?: string | null;
  /** free coupon ("foupon") ticked on the item */
  foupon?: boolean;
}

/** Add-on prices the invoice needs (warranty plans). Keyed by plan id. */
export const cartAddOns: Record<string, { label: string; price: number }> = {
  ew1: { label: '1 Year Extended Warranty', price: 59 },
  ew2: { label: '2 Year Extended Warranty', price: 99 },
};

/** Coupon rules (server-side on master). NOON10 = 10% off capped at AED 150. */
export const cartCoupons: Record<string, { pct?: number; flat?: number; cap?: number; min?: number }> = {
  NOON10: { pct: 10, cap: 150 },
  SAVE50: { flat: 50, min: 300 },
  ONE20: { pct: 20, cap: 100 }, // coupon tray: noon One exclusive
  WEEKEND15: { pct: 15, cap: 75 }, // coupon tray: expiring coupon
  BUY3: { pct: 5, cap: 50 }, // coupon tray: unlocks at 3 units
};

/** Per-group free-delivery threshold + fee (shown by NoonCartGroupProgressBar). */
export const FREE_DELIVERY_THRESHOLD = 100;
export const SHIPPING_FEE = 10;
/** Foupon value (AED) taken off an item when its free coupon is ticked. */
export const FOUPON_VALUE = 15;

/** NoonCartGroup serviceMode: supermall = 'rocket', express, marketplace = 'mp', xborder = 'global'. */
export type CartGroupType = 'supermall' | 'express' | 'marketplace' | 'xborder';
/** Which shipment group (NoonCartGroup) a product lands in. */
export function cartGroupOf(p: Product): CartGroupType {
  if (p.supermall) return 'supermall';
  if (p.express) return 'express';
  if (p.seller?.startsWith('Global')) return 'xborder';
  return 'marketplace';
}

export interface CouponState {
  code: string;
  state: 'success' | 'invalid';
  /** discount actually applied (0 when invalid / below minimum) */
  amount: number;
}

/**
 * Invoice totals — single source of truth for cart + checkout.
 * Use `computeCartTotals(cart, coupon)` (pure) or `useCartTotals()` (reads the store).
 */
export interface CartTotals {
  /** number of units (sum of qty) */
  itemCount: number;
  /** Σ qty × price */
  subtotal: number;
  /** Σ qty × (was − price) — strike-through savings */
  savings: number;
  /** Σ warranty / protection add-ons */
  addOns: number;
  /** Σ foupon (free coupon) discounts */
  foupons: number;
  /** shipping per shipment group, 0 once that group passes FREE_DELIVERY_THRESHOLD */
  shipping: number;
  freeDelivery: boolean;
  groups: Array<{ type: CartGroupType; subtotal: number; shipping: number; remaining: number }>;
  coupon: CouponState | null;
  /** coupon discount (0 when no / invalid coupon) */
  couponDiscount: number;
  /** subtotal + addOns + shipping − foupons − couponDiscount */
  total: number;
  /** savings + foupons + couponDiscount (+ shipping waived) — the footer "You're saving" figure */
  totalSavings: number;
}

export function evaluateCoupon(code: string, subtotal: number): CouponState {
  const rule = cartCoupons[code.trim().toUpperCase()];
  if (!rule || (rule.min && subtotal < rule.min)) return { code: code.trim().toUpperCase(), state: 'invalid', amount: 0 };
  let amount = rule.flat ?? Math.round((subtotal * (rule.pct ?? 0)) / 100);
  if (rule.cap) amount = Math.min(amount, rule.cap);
  return { code: code.trim().toUpperCase(), state: 'success', amount };
}

export function computeCartTotals(cart: CartLine[], couponCode?: string | null): CartTotals {
  const subtotal = cart.reduce((n, l) => n + l.qty * l.product.price, 0);
  const savings = cart.reduce((n, l) => n + l.qty * ((l.product.was ?? l.product.price) - l.product.price), 0);
  const addOns = cart.reduce((n, l) => n + (l.warranty ? (cartAddOns[l.warranty]?.price ?? 0) * l.qty : 0), 0);
  const foupons = cart.reduce((n, l) => n + (l.foupon ? FOUPON_VALUE : 0), 0);
  const groupTypes: CartGroupType[] = ['supermall', 'express', 'marketplace', 'xborder'];
  const groups = groupTypes
    .map((type) => {
      const sub = cart.filter((l) => cartGroupOf(l.product) === type).reduce((n, l) => n + l.qty * l.product.price, 0);
      return { type, subtotal: sub, shipping: sub >= FREE_DELIVERY_THRESHOLD ? 0 : SHIPPING_FEE, remaining: Math.max(0, FREE_DELIVERY_THRESHOLD - sub) };
    })
    .filter((g) => g.subtotal > 0);
  const shipping = groups.reduce((n, g) => n + g.shipping, 0);
  const coupon = couponCode ? evaluateCoupon(couponCode, subtotal) : null;
  const couponDiscount = coupon?.amount ?? 0;
  const waived = groups.filter((g) => g.shipping === 0).length * SHIPPING_FEE;
  return {
    itemCount: cart.reduce((n, l) => n + l.qty, 0),
    subtotal,
    savings,
    addOns,
    foupons,
    shipping,
    freeDelivery: shipping === 0,
    groups,
    coupon,
    couponDiscount,
    total: Math.max(0, subtotal + addOns + shipping - foupons - couponDiscount),
    totalSavings: savings + foupons + couponDiscount + waived,
  };
}

interface DemoStore {
  cart: CartLine[];
  cartCount: number;
  /** what the tab bar's cart badge shows: `cartCount`, unless a screen forces a state (e.g. `cart/empty` → 0) */
  cartBadge: number;
  /** a screen previewing a forced cart state pins the badge (null releases it); the cart itself is untouched */
  setCartBadgeOverride: (count: number | null) => void;
  cartTotal: number;
  addToCart: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  /** patch cart-owned fields of a line (variant, customization, warranty, foupon) */
  updateLine: (productId: string, patch: Partial<Omit<CartLine, 'product'>>) => void;
  /** NoonCartActions.moveCartItemToSavedCart: drop from cart + add to wishlist */
  moveToWishlist: (productId: string) => void;
  /** applied cart coupon code (null = none). Read the evaluated state from `cartTotals.coupon`. */
  coupon: string | null;
  applyCoupon: (code: string) => CouponState;
  removeCoupon: () => void;
  /** live invoice totals for the current cart + coupon */
  cartTotals: CartTotals;
  /** out-of-stock / unserviceable items (NoonCartInactiveGroup) */
  inactiveCart: CartLine[];
  removeInactive: (productId: string) => void;
  /** "Your cart's been updated" banner dismissed (NoonCartScreen updates section) */
  cartUpdatesDismissed: boolean;
  dismissCartUpdates: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => boolean;
  isWishlisted: (productId: string) => boolean;
}

const Ctx = createContext<DemoStore | null>(null);

const byId = (id: string) => getProduct(id)!;

const seedCart: CartLine[] = [
  { product: byId('p1'), qty: 1, customization: [{ code: 'engraving', question: 'Engraving text', answer: 'AD ♥ 2025' }] },
  { product: byId('p6'), qty: 1, variant: '46mm' },
  { product: byId('p8'), qty: 1, warranty: null },
  { product: byId('p11'), qty: 1 },
];

const seedInactive: CartLine[] = [{ product: byId('p7'), qty: 1 }];

export function DemoStoreProvider({ children, emptyCart = false }: { children: ReactNode; emptyCart?: boolean }) {
  const [cart, setCart] = useState<CartLine[]>(emptyCart ? [] : seedCart);
  const [inactiveCart, setInactiveCart] = useState<CartLine[]>(emptyCart ? [] : seedInactive);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [cartUpdatesDismissed, setCartUpdatesDismissed] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>(['p2', 'p6', 'p7']);

  const addToCart = useCallback((productId: string, qty = 1) => {
    // any collection (the PLP phones too), by id or sku
    const product = getProduct(productId);
    if (!product) return;
    setCart((c) => {
      const existing = c.find((l) => l.product.id === productId);
      if (existing) return c.map((l) => (l.product.id === productId ? { ...l, qty: l.qty + qty } : l));
      return [...c, { product, qty }];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setCart((c) => (qty <= 0 ? c.filter((l) => l.product.id !== productId) : c.map((l) => (l.product.id === productId ? { ...l, qty } : l))));
  }, []);

  const removeFromCart = useCallback((productId: string) => setCart((c) => c.filter((l) => l.product.id !== productId)), []);
  const clearCart = useCallback(() => {
    setCart([]);
    setCoupon(null);
  }, []);

  const updateLine = useCallback<DemoStore['updateLine']>((productId, patch) => {
    setCart((c) => c.map((l) => (l.product.id === productId ? { ...l, ...patch } : l)));
  }, []);

  const moveToWishlist = useCallback((productId: string) => {
    setCart((c) => c.filter((l) => l.product.id !== productId));
    setInactiveCart((c) => c.filter((l) => l.product.id !== productId));
    setWishlist((w) => (w.includes(productId) ? w : [...w, productId]));
  }, []);

  const removeInactive = useCallback((productId: string) => setInactiveCart((c) => c.filter((l) => l.product.id !== productId)), []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      const next = !wishlist.includes(productId);
      setWishlist((w) => (next ? [...w, productId] : w.filter((id) => id !== productId)));
      return next;
    },
    [wishlist],
  );

  const cartTotals = useMemo(() => computeCartTotals(cart, coupon), [cart, coupon]);

  const applyCoupon = useCallback(
    (code: string) => {
      const result = evaluateCoupon(code, cart.reduce((n, l) => n + l.qty * l.product.price, 0));
      setCoupon(result.code);
      return result;
    },
    [cart],
  );
  const removeCoupon = useCallback(() => setCoupon(null), []);
  const dismissCartUpdates = useCallback(() => setCartUpdatesDismissed(true), []);

  const [cartBadgeOverride, setCartBadgeOverride] = useState<number | null>(null);
  const value = useMemo<DemoStore>(
    () => ({
      cart,
      cartCount: cart.reduce((n, l) => n + l.qty, 0),
      cartBadge: cartBadgeOverride ?? cart.reduce((n, l) => n + l.qty, 0),
      setCartBadgeOverride,
      cartTotal: cart.reduce((n, l) => n + l.qty * l.product.price, 0),
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      updateLine,
      moveToWishlist,
      coupon,
      applyCoupon,
      removeCoupon,
      cartTotals,
      inactiveCart,
      removeInactive,
      cartUpdatesDismissed,
      dismissCartUpdates,
      wishlist,
      toggleWishlist,
      isWishlisted: (id) => wishlist.includes(id),
    }),
    [cart, cartBadgeOverride, wishlist, addToCart, setQty, removeFromCart, clearCart, updateLine, moveToWishlist, coupon, applyCoupon, removeCoupon, cartTotals, inactiveCart, removeInactive, cartUpdatesDismissed, dismissCartUpdates, toggleWishlist],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemoStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDemoStore must be used inside <NoonPrototype> / <DemoStoreProvider>');
  return v;
}

/** Live invoice totals (see `CartTotals`). Checkout should read this rather than recomputing. */
export function useCartTotals(): CartTotals {
  return useDemoStore().cartTotals;
}
