/** Demo collections — product ids from src/data (previewItems = the first three). */
export const collections = [
  { id: 'c1', name: 'Birthday ideas', items: ['p1', 'p7', 'p10'] },
  { id: 'c2', name: 'Tech upgrade', items: ['p2', 'p6', 'p9'] },
  { id: 'c3', name: 'Home refresh', items: ['p4', 'p8'] },
  { id: 'c4', name: 'Gym', items: ['p3'] },
];

/** Copy from bappzaar noon-en.json (noon_wishlist*, noon_wishlist_v2_*). */
export const copy = {
  title: 'Wishlist', // noon_wishlist
  allSavedItems: 'All Saved Items',
  create: 'Create',
  createNewCollection: 'Create a new collection',
  organiseShareNotify: 'Save, sort into collections & share with anyone',
  addToCart: 'Add to cart', // noon_wishlist_add_to_cart_v2
  viewOptions: 'View options', // view_options
  viewCart: 'View Cart',
  emptyTitle: 'Nothing saved yet',
  emptySubtitle: 'Tap the heart on any item you like to start saving!',
  startAddingItems: 'Start adding items',
  organise: 'Organise',
  addToCollection: 'Add to collection',
  removeItem: 'Remove item',
  removedFromPrefix: 'Removed from ', // + bold noon_wishlist
  /** noon_wishlist_v2_item_count: one → "{{count}} item", other → "{{count}} items" */
  itemCount: (n: number) => (n === 1 ? '1 item' : `${n} items`),
};
