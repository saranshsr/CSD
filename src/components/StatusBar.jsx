import './StatusBar.css';

// iOS status bar (Figma M-Status bar, 375×62). tone="light" → white glyphs.
export default function StatusBar({ tone = 'dark', style }) {
  const c = tone === 'light' ? '#fff' : '#000';
  return (
    <div className="sb" style={{ color: c, ...style }}>
      <div className="sb-time">9:41</div>
      <div className="sb-right">
        <svg width="19" height="12" viewBox="0 0 19 12" aria-hidden="true">
          <rect x="0" y="7.5" width="3.2" height="4.5" rx="0.9" fill={c} />
          <rect x="5" y="5.2" width="3.2" height="6.8" rx="0.9" fill={c} />
          <rect x="10" y="2.6" width="3.2" height="9.4" rx="0.9" fill={c} />
          <rect x="15" y="0" width="3.2" height="12" rx="0.9" fill={c} />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" aria-hidden="true">
          <path fill={c} d="M8.5 2.4c2.3 0 4.5.9 6.1 2.4.1.1.3.1.4 0l1.2-1.2c.1-.1.1-.3 0-.4A11 11 0 0 0 8.5 0 11 11 0 0 0 .8 3.2c-.1.1-.1.3 0 .4L2 4.8c.1.1.3.1.4 0a8.8 8.8 0 0 1 6.1-2.4Z" />
          <path fill={c} d="M8.5 6.3c1.3 0 2.5.5 3.4 1.3.1.1.3.1.4 0l1.2-1.2c.1-.1.1-.3 0-.4a7.2 7.2 0 0 0-10 0c-.1.1-.1.3 0 .4l1.2 1.2c.1.1.3.1.4 0 .9-.8 2.1-1.3 3.4-1.3Z" />
          <path fill={c} d="M10.8 9.4c.1-.1.1-.3 0-.4a3.4 3.4 0 0 0-4.6 0c-.1.1-.1.3 0 .4l2.1 2.1c.1.1.3.1.4 0l2.1-2.1Z" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke={c} strokeOpacity="0.35" />
          <rect x="2" y="2" width="20" height="9" rx="2.5" fill={c} />
          <path d="M25 4.4v4.2c.8-.3 1.4-1.2 1.4-2.1s-.6-1.8-1.4-2.1Z" fill={c} fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
