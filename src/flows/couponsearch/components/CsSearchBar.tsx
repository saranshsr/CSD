import { OriginIcon, Pressable, SearchInput, type SearchInputProps } from '../../../components';
import { field } from '../../../foundations/tokens';
import { copy } from '../data';

/**
 * The team file's search bar on every coupon screen: Field DS M-SearchBar H48 (`SearchInput variant="field"`), Origin
 * chevron-left (back) and camera, "Search" placeholder. The camera stays while typing, as in the typing frames.
 */
export function CsSearchBar({ camera = true, ...props }: Omit<SearchInputProps, 'variant' | 'iconLeft' | 'iconRight' | 'placeholder'> & { /** results bars carry no camera (team file Results frames) */ camera?: boolean }) {
  const { onBack } = props;
  return (
    <SearchInput
      {...props}
      variant="field"
      placeholder={copy.search.placeholder}
      iconLeft={
        onBack ? (
          <Pressable onClick={onBack} aria-label="Back" style={{ display: 'flex' }}>
            <OriginIcon name="chevron-left" size={24} color={field.textPrimary} />
          </Pressable>
        ) : null
      }
      iconRight={camera ? <OriginIcon name="camera" size={24} color={field.textPrimary} /> : null}
    />
  );
}
