// Icon — renders /assets/icons/{name}.svg as a CSS mask so any colour works.
export default function Icon({ name, size = 20, color = 'currentColor', style, className }) {
  const url = `url(/assets/icons/${name}.svg)`;
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: 'inline-block', flex: 'none', width: size, height: size,
        backgroundColor: color,
        WebkitMaskImage: url, maskImage: url,
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        WebkitMaskSize: 'contain', maskSize: 'contain',
        ...style,
      }}
    />
  );
}
