import { defineFlow } from '../../kit/registry';
import { lazyScreen } from '../../kit/lazyScreen';
import { fielddsFlowTokens } from './tokens';

// screens load on demand (only what a page shows is in its first download)
const FielddsScreen = lazyScreen(() => import('./FielddsScreen'), 'FielddsScreen');
const FielddsSheet = lazyScreen(() => import('./FielddsScreen'), 'FielddsSheet');
const FielddsTabsScreen = lazyScreen(() => import('./FielddsScreen'), 'FielddsTabsScreen');
const FielddsGlassScreen = lazyScreen(() => import('./FielddsScreen'), 'FielddsGlassScreen');

const SRC = 'github.com/ayaneshu/field-design-system packages/components/src';

export const fielddsFlow = defineFlow({
  id: 'fieldds',
  title: 'Field Design System',
  group: 'Design system',
  description:
    'Gallery of the Field Design System (the coded Origin DS) as kit components: the new Radio, ActionBar, Accordion, TextField and TextArea, and the opt-in field variants of Button, IconButton, Header, Checkbox, Switch, Segmented, Pill, StatusChip, Stars, ListRow, SearchInput, Divider, Snackbar, SheetFooter and TabBar.',
  initial: 'gallery',
  tokens: fielddsFlowTokens,
  tabBar: { tab: 'home', screens: ['glass'] },
  screens: [
    {
      id: 'gallery',
      title: 'Field components',
      component: FielddsScreen,
      truth: 'reference',
      notes: 'Tap Continue (loading cross-fade), the checkbox, radios, toggles and segmented controls; add / clear the Filter chip; rate; type an email without "@" (error); expand the accordions; open the toasts, the sheet and the bottom nav.',
      source: `reference: ${SRC} (Button, IconButton, PageHeader, Checkbox, Radio, Toggle, Switch, FilterChip, InfoBanner, RatingInput, SearchBar, InputText, InputTextarea, ListItem, Accordion, Divider, ActionBar, Toast)`,
    },
    {
      id: 'sheet',
      title: 'Bottom sheet + action bar',
      component: FielddsSheet,
      presentation: 'sheet',
      truth: 'reference',
      notes: 'M-BottomSheet with an M-ActionBar split footer (SheetFooter layout="split").',
      source: `reference: ${SRC}/BottomSheet, ActionBar`,
    },
    {
      id: 'tabs',
      title: 'Bottom navigation',
      component: FielddsTabsScreen,
      truth: 'reference',
      notes: 'TabBar variant="field": blue indicator, bottomnav-* icons, B11 labels.',
      source: `reference: ${SRC}/BottomNav`,
    },
    {
      id: 'glass',
      title: 'Liquid Glass',
      component: FielddsGlassScreen,
      truth: 'bappzaar',
      parent: 'fieldds/gallery',
      notes: 'The default glass bottom nav (scroll down: it slides away; scroll up or to the top: it returns) and the glass sticky footer (ActionBar surface="glass" aboveTabBar) above it.',
      source: 'bappzaar origin/noon/ios/liquid-upgrade: marketplaces/noon/NoonApp.ts (getTab iOS 26), src/utils/BottomTabs/ScrollVisibilityProvider.ts, marketplaces/noon/components/NoonNativeStickyBar (embedded), ios/noon/NoonStickyBar/NoonStickyBarComponentView.mm',
    },
  ],
});
