import { Skeleton } from '../../../components';
import { ref } from '../../../foundations/tokens';

/** NoonPLPSkeleton card: same footprint as ProductCard so the swap doesn't jump. */
export function SkeletonCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderRadius: 12, overflow: 'hidden', border: `0.5px solid ${ref.palette('lightGray')}`, paddingBottom: 10 }}>
      <Skeleton height={undefined as unknown as number} radius={0} style={{ aspectRatio: '0.8', height: 'auto' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 8px' }}>
        <Skeleton height={12} />
        <Skeleton height={12} width="70%" />
        <Skeleton height={18} width={60} />
        <Skeleton height={16} width="50%" />
      </div>
    </div>
  );
}
