// Cursor-Z brand mark. Monochrome, inherits `currentColor` so it takes the
// surrounding text color (works in both themes). Set `blink` to animate the
// cursor block via the shared `.zh-blink` keyframes (respects reduced-motion) —
// header only, never in the favicon/OG (see logo rules).

export function LogoMark({
  size = 20,
  blink = false,
  className,
  style,
}: {
  size?: number;
  blink?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="8">
        <path d="M11 17H41" />
        <path d="M41 17L11 47" />
        <path d="M11 47H41" />
      </g>
      <rect
        x="45"
        y="23"
        width="12"
        height="28"
        fill="currentColor"
        className={blink ? "zh-blink" : undefined}
      />
    </svg>
  );
}
