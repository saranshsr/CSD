import { useState } from 'react';
import StatusBar from '../components/StatusBar.jsx';
import SearchBar from '../components/SearchBar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import Pressable from '../components/Pressable.jsx';
import Icon from '../components/Icon.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { products } from '../data.js';
import './PLP.css';

// Figma 04 · Eligible items (2321:96371)
const TABS = [
  { logo: 'noon', w: 52.9, h: 18, caption: 'Wide assortment' },
  { logo: 'minutes', w: 73.3, h: 17, caption: 'In minutes' },
  { logo: 'supermall', w: 68.9, h: 19, caption: 'Direct from brand' },
  { logo: 'express', w: 63.7, h: 19, caption: 'Fulfilled by noon' },
];
const CHIPS = [
  { label: 'Filter', lead: 'preferences' },
  { label: 'Sort', trail: true },
  { label: 'Price', trail: true },
  { label: 'Face' },
  { label: 'Eyes' },
];
const P = '/assets/products/';
const CATEGORIES = [
  { label: 'Makeup', img: P + '10_makeup-brush-set_1.jpg' },
  { label: 'Skincare', img: P + '13_sunscreen-spf-50_1.jpg' },
  { label: 'Haircare', img: P + '07_olaplex-no-7_1.jpg' },
  { label: 'Bath and\nbody', img: P + '03_sebamed-baby-lotion_1.jpg' },
  { label: 'Grooming', img: P + '14_shampoo_1.jpg' },
];

// Floating "Sort ⇅ | Filter" pill + share circle (shared with Results)
export function SortFilterPill() {
  return (
    <div className="sfp">
      <Pressable className="sfp-pill">
        <span className="sfp-seg">Sort <Icon name="sort" size={24} color="#fff" /></span>
        <span className="sfp-sep" />
        <span className="sfp-seg">Filter <Icon name="filter" size={24} color="#fff" /></span>
      </Pressable>
      <Pressable className="sfp-share" aria-label="Share">
        <Icon name="share" size={24} color="#3866df" />
      </Pressable>
    </div>
  );
}

// 2-col grid: padding 0 12, column gap 10, row gap 16
export function ProductGrid({ items, renderItem }) {
  return <div className="pgrid">{items.map((p, i) => renderItem ? renderItem(p, i) : <ProductCard key={p.id} product={p} />)}</div>;
}

export default function PLP({ nav }) {
  const [scrolled, setScrolled] = useState(false);
  const onScroll = (e) => {
    const s = e.currentTarget.scrollTop > 8;
    if (s !== scrolled) setScrolled(s);
  };

  return (
    <div className="plp">
      <header className="plp-header">
        <StatusBar tone="dark" />
        <div className="plp-searchwrap">
          <SearchBar
            layoutId="search-bar"
            placeholder="Search"
            state="placeholder"
            trailing="camera"
            onBack={() => nav.pop()}
            onTap={() => nav.push('search', { query: '', script: 'serum' }, { transition: 'morph' })}
          />
        </div>
        <div className="plp-hairline" style={{ opacity: scrolled ? 1 : 0 }} />
      </header>

      <div className="plp-scroll" onScroll={onScroll}>
        <div className="plp-tabs">
          {TABS.map((t, i) => (
            <div key={t.logo} className="plp-tab">
              <img src={`/assets/logos/${t.logo}.png`} alt={t.logo} style={{ width: t.w, height: t.h }} draggable={false} />
              <span className="plp-tab-cap">{t.caption}</span>
              <span className="plp-tab-ind" style={{ opacity: i === 0 ? 1 : 0 }} />
            </div>
          ))}
        </div>

        <div className="plp-chips">
          {CHIPS.map((c) => (
            <Pressable key={c.label} className={`plp-chip${c.lead ? ' has-lead' : ''}${c.trail ? ' has-trail' : ''}`}>
              {c.lead && <Icon name={c.lead} size={16} color="#0f172a" />}
              <span className="plp-chip-label">{c.label}</span>
              {c.trail && <Icon name="caret-down" size={20} color="#0f172a" />}
            </Pressable>
          ))}
        </div>

        <img className="plp-banner" src="/assets/banner/beauty10.png" alt="Extra 10% off — use code BEAUTY10" draggable={false} />

        <div className="plp-cats">
          {CATEGORIES.map((c) => (
            <Pressable key={c.label} className="plp-cat">
              <span className="plp-cat-img"><img src={c.img} alt="" draggable={false} /></span>
              <span className="plp-cat-label">{c.label}</span>
            </Pressable>
          ))}
        </div>

        <ProductGrid items={products.plp} />
        <div className="plp-foot" />
      </div>

      <SortFilterPill />
      <div className="plp-nav"><BottomNav active="cart" cartCount={0} /></div>
    </div>
  );
}
