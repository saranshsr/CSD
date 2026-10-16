// named imports: a namespace import (`* as L`) pulls every lucide icon into the bundle
import { ArrowLeft, ArrowUp, ArrowUpDown, BadgePercent, Bell, Bookmark, Box, Building2, Calendar, Camera, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleAlert, CircleCheck, CircleHelp, Clock, Copy, CreditCard, Crown, Ellipsis, FileText, Flame, Gift, Globe, Heart, House, ImagePlus, Info, Languages, LayoutGrid, Lock, LogOut, MapPin, MessageCircle, Mic, Minus, Package, PackageCheck, PackageOpen, Pencil, Percent, Phone, Plus, Receipt, RotateCcw, ScanLine, Search, Settings, Share, ShieldCheck, ShoppingCart, SlidersHorizontal, Sparkles, Star, Store, Tag, Trash2, TrendingUp, Truck, Upload, User, Wallet, X, Zap } from 'lucide-react';
import type { CSSProperties } from 'react';

/**
 * Central icon set. Flows reference icons by NAME only, so swapping the whole set
 * (e.g. for exported noon SVGs) is a one-file change. Add a key → any lucide icon
 * (https://lucide.dev/icons) or your own SVG component.
 */
export const icons = {
  back: ChevronLeft,
  arrowLeft: ArrowLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  search: Search,
  camera: Camera,
  mic: Mic,
  heart: Heart,
  share: Share,
  cart: ShoppingCart,
  home: House,
  categories: LayoutGrid,
  account: User,
  deals: BadgePercent,
  plus: Plus,
  minus: Minus,
  trash: Trash2,
  star: Star,
  close: X,
  filter: SlidersHorizontal,
  sort: ArrowUpDown,
  pin: MapPin,
  truck: Truck,
  package: Package,
  packageCheck: PackageCheck,
  packageOpen: PackageOpen,
  returns: RotateCcw,
  card: CreditCard,
  gift: Gift,
  bell: Bell,
  settings: Settings,
  shield: ShieldCheck,
  logout: LogOut,
  globe: Globe,
  language: Languages,
  check: Check,
  checkCircle: CircleCheck,
  info: Info,
  tag: Tag,
  percent: Percent,
  clock: Clock,
  wallet: Wallet,
  edit: Pencil,
  copy: Copy,
  upload: Upload,
  arrowUp: ArrowUp,
  store: Store,
  zap: Zap,
  lock: Lock,
  chat: MessageCircle,
  help: CircleHelp,
  sparkles: Sparkles,
  imagePlus: ImagePlus,
  flame: Flame,
  trendingUp: TrendingUp,
  receipt: Receipt,
  file: FileText,
  more: Ellipsis,
  calendar: Calendar,
  phone: Phone,
  alert: CircleAlert,
  bookmark: Bookmark,
  scan: ScanLine,
  crown: Crown,
  building: Building2,
  box: Box,
} as const;

export type IconName = keyof typeof icons;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
  className?: string;
  style?: CSSProperties;
  /** mirror in RTL (arrows / chevrons) */
  flipRtl?: boolean;
}

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 2, fill = 'none', className, style, flipRtl }: IconProps) {
  const Cmp = icons[name];
  return (
    <Cmp
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      fill={fill}
      className={[flipRtl ? 'nk-flip-rtl' : '', className].filter(Boolean).join(' ') || undefined}
      style={{ flexShrink: 0, ...style }}
      aria-hidden
    />
  );
}
