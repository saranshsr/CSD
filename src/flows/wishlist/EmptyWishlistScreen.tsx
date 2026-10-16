import { EmptyWishlist } from './components/EmptyState';
import { ViewCartPill } from './components/ViewCartPill';
import styles from './wishlist.module.css';

/** Empty wishlist (NoonWishlistV2Screen `isEmpty`) — always empty, regardless of the demo store, for presenting the state on its own. */
export function EmptyWishlistScreen() {
  return (
    <div className={styles.stage}>
      <EmptyWishlist />
      <ViewCartPill />
    </div>
  );
}
