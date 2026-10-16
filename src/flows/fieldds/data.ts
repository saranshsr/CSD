/** Copy for the Field Design System gallery. Each section names the Field (M-*) component and the kit API it maps to. */
export const fielddsCopy = {
  title: 'Field Design System',
  subtitle: 'Components',
  sections: {
    buttons: 'M-Button · Button variant="field*"',
    iconButtons: 'M-IconButton · IconButton variant="field*"',
    selection: 'M-Checkbox · M-Radio · M-Toggle · M-Switch',
    chips: 'M-FilterChip · Pill variant="fieldChip"',
    banners: 'M-InfoBanner · StatusChip variant="field"',
    rating: 'M-RatingInput · Stars variant="field"',
    inputs: 'M-InputText · M-InputTextarea · M-SearchBar',
    lists: 'M-ListItem · M-Accordion · M-Divider',
    feedback: 'M-Toast · M-BottomSheet · M-BottomNav',
  },
  delivery: [
    { id: 'standard', label: 'Standard delivery', subtitle: 'Arrives Tue, 20 Oct' },
    { id: 'express', label: 'Express delivery', subtitle: 'Arrives tomorrow' },
    { id: 'pickup', label: 'Pick up from a locker', subtitle: 'Ready in 2 days' },
  ],
  languages: [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' },
  ],
  views: [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'past', label: 'Past' },
  ],
  accordion: [
    { title: 'Specifications', body: 'Water resistant to 50m. Sapphire crystal glass. 18 hours of battery life.' },
    { title: 'Returns', body: 'Free returns within 15 days of delivery for most items.' },
  ],
  toast: 'Address saved',
  sheet: {
    title: 'Clear all filters?',
    subtitle: 'Your selections in every category will be removed.',
    body: 'You can set them again from the Filter chip.',
    primary: 'Clear all',
    secondary: 'Cancel',
  },
  glass: { title: 'Liquid Glass', subtitle: 'Glass tab bar · glass sticky footer' },
  tabs: { title: 'Bottom navigation', body: 'This screen shows the Field M-BottomNav (TabBar variant="field"). Tap a tab.' },
};
