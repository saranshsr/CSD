import Icon from './Icon.jsx';
import Pressable from './Pressable.jsx';
import './BottomNav.css';

// Figma M-Bottomnav (2323:153504): 85px incl. home-indicator area (the indicator itself is drawn by DeviceFrame).
const ITEMS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'categories', label: 'Categories', icon: 'categories' },
  { id: 'deals', label: 'Deals', icon: 'deals' },
  { id: 'profile', label: 'Accounts', icon: 'profile' },
  { id: 'cart', label: 'Cart', icon: 'cart' },
];

export default function BottomNav({ active = 'home', cartCount = 0 }) {
  return (
    <nav className="bn">
      {ITEMS.map((it) => {
        const on = it.id === active;
        return (
          <Pressable key={it.id} className={`bn-item${on ? ' is-on' : ''}`} aria-label={it.label} aria-current={on ? 'page' : undefined}>
            {on && <span className="bn-ind" aria-hidden />}
            <span className="bn-icon">
              <Icon name={on && it.id === 'home' ? 'home-active' : it.icon} size={28} color={on ? '#0f61ff' : '#666d85'} />
              {it.id === 'cart' && cartCount > 0 && <span className="bn-badge">{cartCount}</span>}
            </span>
            <span className="bn-label">{it.label}</span>
          </Pressable>
        );
      })}
    </nav>
  );
}
