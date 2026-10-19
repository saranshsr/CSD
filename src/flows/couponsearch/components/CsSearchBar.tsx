import { SearchInput, type SearchInputProps } from '../../../components';
import { copy } from '../data';

/**
 * The coupon screens' search bar: the kit's own SearchInput (NoonSearchScreen / PLP bar: back, field, camera, the clear
 * ✕ while typing), with the team file's "Search" placeholder (h2 with the band: "Search within BEAUTY10"). The same bar on the search page and the listings keeps
 * the kit's results-fade hand-off exact.
 */
export function CsSearchBar({ placeholder, ...props }: Omit<SearchInputProps, 'variant'>) {
  return <SearchInput {...props} placeholder={placeholder ?? copy.search.placeholder} />;
}
