/**
 * Small SVGs are inlined by Vite as `data:image/svg+xml,…'…'` URLs; MaskIcon writes `url(${src})` unquoted, and an
 * unquoted CSS url() cannot contain quotes, so the mask silently fails (solid square). Quote data URLs.
 * (Shared follow-up: quote the url in src/components/MaskIcon.)
 */
export const maskSrc = (src: string) => (src.startsWith('data:') ? `"${src}"` : src);
