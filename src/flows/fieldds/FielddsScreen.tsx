import { useState, type ReactNode } from 'react';
import {
  Accordion,
  ActionBar,
  Button,
  Checkbox,
  Divider,
  DashedDivider,
  Header,
  IconButton,
  ListRow,
  Money,
  OriginIcon,
  Pill,
  ProductCard,
  Radio,
  Screen,
  SearchInput,
  Segmented,
  SheetBody,
  SheetFooter,
  SheetHeader,
  Stars,
  StatusChip,
  Switch,
  TabBar,
  Text,
  TextArea,
  TextField,
} from '../../components';
import { products } from '../../data';
import { useNav } from '../../kit/Navigator';
import { fielddsCopy as c } from './data';
import styles from './fieldds.module.css';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <span className={styles.sectionTitle}>{title}</span>
      {children}
    </section>
  );
}

/** Gallery of the Field Design System (coded Origin DS) components as kit components / opt-in variants. */
export function FielddsScreen() {
  const nav = useNav();
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(true);
  const [delivery, setDelivery] = useState('express');
  const [notify, setNotify] = useState(true);
  const [lang, setLang] = useState('en');
  const [view, setView] = useState('all');
  const [filters, setFilters] = useState(2);
  const [rating, setRating] = useState(4);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('Hala Ankit');
  const [note, setNote] = useState('');
  const [query, setQuery] = useState('');

  const pressLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1400);
  };

  return (
    <Screen
      header={<Header variant="field" align="left" title={c.title} subtitle={c.subtitle} right={<IconButton icon="share" variant="fieldDefault" label="Share" />} />}
      footer={
        <ActionBar
          layout="leadingTrailing"
          leading={
            <div className={styles.price}>
              <Money value={249} bold />
              <Text variant="caption" color="textSecondary">Inclusive of VAT</Text>
            </div>
          }
          primary={{ label: 'Add to cart', onPress: () => nav.toast(c.toast, { action: 'close' }) }}
        />
      }
    >
      <div className={styles.page}>
        <Section title={c.sections.buttons}>
          <Button variant="fieldPrimary" fieldSize="H52" block loading={loading} onClick={pressLoading}>Continue</Button>
          <Button variant="fieldSecondary" fieldSize="H52" block>Save for later</Button>
          <div className={styles.row}>
            <Button variant="fieldNeutral" fieldSize="H48">Neutral</Button>
            <Button variant="fieldSecondaryNeutral" fieldSize="H48">Secondary</Button>
            <Button variant="fieldPrimary" fieldSize="H40" disabled>Disabled</Button>
          </div>
          <div className={styles.row}>
            <Button variant="fieldRound" fieldSize="H40">Round</Button>
            <Button variant="fieldRound" fieldSize="H36">Round 36</Button>
            <Button variant="fieldText" fieldSize="A14">Text button</Button>
            <Button variant="fieldNeutralText" fieldSize="A12">Neutral text</Button>
          </div>
        </Section>

        <Section title={c.sections.iconButtons}>
          <div className={styles.row}>
            <IconButton icon="heart" variant="fieldDefault" label="Save" />
            <IconButton icon="share" variant="fieldGhost" label="Share" />
            <IconButton icon="cart" variant="fieldAction" label="Cart" />
            <IconButton icon="search" variant="fieldDefault" size={36} label="Search" />
            <IconButton icon="close" variant="fieldDefault" disabled label="Close" />
          </div>
        </Section>

        <Section title={c.sections.selection}>
          <label className={styles.option}>
            <Checkbox variant="field" checked={agree} onChange={setAgree} label="Accept terms" />
            <span className={styles.optionLabel}>Accept the terms of sale</span>
          </label>
          <div className={styles.row}>
            <Checkbox variant="field" checked size={20} />
            <Checkbox variant="field" checked={false} size={20} />
            <Checkbox variant="field" checked disabled size={16} />
          </div>
          <div className={styles.stack}>
            {c.delivery.map((d) => (
              <label key={d.id} className={styles.option}>
                <Radio checked={delivery === d.id} onChange={() => setDelivery(d.id)} size={20} label={d.label} />
                <span className={styles.optionLabel}>{d.label}</span>
              </label>
            ))}
          </div>
          <div className={styles.row}>
            <Switch variant="field" size={24} value={notify} onChange={setNotify} label="Notifications" />
            <Switch variant="field" value={!notify} onChange={(v) => setNotify(!v)} label="Toggle" />
            <Switch variant="field" size={16} value disabled label="Disabled" />
          </div>
          <Segmented variant="field" options={c.languages} value={lang} onChange={setLang} />
          <Segmented variant="field" size={48} options={c.views} value={view} onChange={setView} />
        </Section>

        <Section title={c.sections.chips}>
          <div className={styles.row}>
            <Pill variant="fieldChip" selected={filters > 0} count={filters} onPress={() => setFilters((n) => n + 1)} onClear={() => setFilters(0)}>
              Filter
            </Pill>
            <Pill variant="fieldChip" fieldIcon={null}>Brand</Pill>
            <Pill variant="fieldChip" fieldIcon={null} disabled>Price</Pill>
          </div>
        </Section>

        <Section title={c.sections.banners}>
          <div className={styles.row}>
            <StatusChip variant="field" tone="success" fieldIcon="check-circle">Delivered</StatusChip>
            <StatusChip variant="field" tone="info">Arrives Tue</StatusChip>
            <StatusChip variant="field" tone="warning">Few left</StatusChip>
            <StatusChip variant="field" tone="danger">Out of stock</StatusChip>
          </div>
          <div className={styles.row}>
            <StatusChip variant="field" tone="supermall" size="large">supermall</StatusChip>
            <StatusChip variant="field" tone="purple" size="large">noon One</StatusChip>
            <StatusChip variant="field" tone="neutral" size="large" shape="rectangular">Verified seller</StatusChip>
          </div>
        </Section>

        <Section title={c.sections.rating}>
          <Stars variant="field" value={rating} onChange={setRating} size={32} />
          <Stars variant="field" value={3} size={20} disabled />
        </Section>

        <Section title={c.sections.inputs}>
          <SearchInput variant="field" value={query} onChange={setQuery} iconRight={<OriginIcon name="camera" size={24} />} />
          <SearchInput variant="field" fieldSize="H44" elevation value="" onChange={() => undefined} iconRight={<OriginIcon name="camera" size={20} />} iconRightTwo={<OriginIcon name="mic" size={20} />} />
          <TextField label="Email" required placeholder="you@noon.com" value={email} onChange={setEmail} error={email.length > 0 && !email.includes('@') ? 'Enter a valid email' : false} helperText="We'll send the receipt here" />
          <TextField labelMode="inline" label="Full name" value={name} onChange={setName} />
          <TextField label="Phone" value="+971 50 123 4567" disabled />
          <TextArea label="Delivery note" placeholder="Anything for the rider…" maxLength={200} showCounter value={note} onChange={setNote} minHeight={120} />
        </Section>

        <Section title={c.sections.lists}>
          <div className={styles.list}>
            <ListRow variant="field" leading={<OriginIcon name="location" />} title="Home" subtitle="Villa 52, Dubai Marina" onPress={() => undefined} />
            <Divider emphasis="low" />
            <ListRow variant="field" size="big" leading={<OriginIcon name="notification" />} title="Notifications" trailing={<Switch variant="field" value={notify} onChange={setNotify} label="Notifications" />} />
            <Divider emphasis="low" />
            <ListRow variant="field" leading={<OriginIcon name="calendar" />} title="Delivery slot" subtitle="Tomorrow, 9am – 12pm" onPress={() => undefined} />
          </div>
          {c.accordion.map((a, i) => (
            <Accordion key={a.title} title={a.title} iconLeft="info-circle" defaultExpanded={i === 0}>
              {a.body}
            </Accordion>
          ))}
          <Divider emphasis="high" />
          <DashedDivider emphasis="high" dash={4} gap={3} inset={0} />
        </Section>

        <Section title={c.sections.feedback}>
          <div className={styles.row}>
            <Button variant="fieldSecondaryNeutral" fieldSize="H40" onClick={() => nav.toast(c.toast, { action: 'close' })}>Dark toast</Button>
            <Button variant="fieldSecondaryNeutral" fieldSize="H40" onClick={() => nav.toast(c.toast, { type: 'light', action: 'close' })}>Light toast</Button>
          </div>
          <div className={styles.row}>
            <Button variant="fieldSecondaryNeutral" fieldSize="H40" onClick={() => nav.sheet('fieldds/sheet')}>Bottom sheet</Button>
            <Button variant="fieldSecondaryNeutral" fieldSize="H40" onClick={() => nav.push('fieldds/tabs')}>Bottom nav</Button>
            <Button variant="fieldSecondaryNeutral" fieldSize="H40" onClick={() => nav.reset('fieldds/glass')}>Liquid Glass</Button>
          </div>
        </Section>
      </div>
    </Screen>
  );
}

/** M-BottomSheet with an M-ActionBar `split` footer (SheetFooter layout="split"). */
export function FielddsSheet() {
  const nav = useNav();
  return (
    <>
      <SheetHeader title={c.sheet.title} subtitle={c.sheet.subtitle} />
      <SheetBody>
        <p className={styles.body}>{c.sheet.body}</p>
      </SheetBody>
      <SheetFooter layout="split" secondary={{ label: c.sheet.secondary, onPress: () => nav.back() }} primary={{ label: c.sheet.primary, onPress: () => nav.back() }} />
    </>
  );
}

/** M-BottomNav: `TabBar variant="field"`, drawn by the screen (the flow's own tab bar is the default glass one). */
export function FielddsTabsScreen() {
  return (
    <Screen
      header={<Header variant="field" title={c.tabs.title} />}
      footer={
        <div className={styles.tabDock}>
          <TabBar active="home" variant="field" />
        </div>
      }
    >
      <div className={styles.page}>
        <Section title={c.sections.feedback}>
          <p className={styles.body}>{c.tabs.body}</p>
        </Section>
      </div>
    </Screen>
  );
}

/**
 * Liquid Glass (bappzaar noon/ios/liquid-upgrade): the default glass TabBar (hides on scroll) and an
 * `ActionBar surface="glass" aboveTabBar` sticky footer — the embedded glass sticky bar — over scrolling content.
 */
export function FielddsGlassScreen() {
  const nav = useNav();
  return (
    <Screen
      header={<Header variant="field" align="left" title={c.glass.title} subtitle={c.glass.subtitle} back={false} />}
      background="bgSurface"
      floatingFooter
      footer={
        <ActionBar
          surface="glass"
          aboveTabBar
          layout="leadingTrailing"
          leading={
            <div className={styles.price}>
              <Money value={249} bold />
              <Text variant="caption" color="textSecondary">Inclusive of VAT</Text>
            </div>
          }
          primary={{ label: 'Add to cart', onPress: () => nav.toast(c.toast, { action: 'close' }) }}
        />
      }
    >
      <div className={styles.grid}>
        {[...products, ...products].slice(0, 12).map((p, i) => (
          <ProductCard key={`${p.id}-${i}`} product={p} />
        ))}
      </div>
    </Screen>
  );
}
