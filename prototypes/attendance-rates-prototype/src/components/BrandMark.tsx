interface BrandMarkProps {
  /** Rendered height in px. Width follows the crest's 24:28 aspect ratio. */
  height?: number;
  className?: string;
}

/**
 * Greenhill crest — a heater shield (rounded shoulders, pointed base) carrying
 * three horizontal stripes: navy, gold, azure.
 *
 * Authored as inline SVG so it stays crisp at any size and needs no raster
 * assets. Colours are sampled directly from the design reference:
 *   navy  stripe #273C83
 *   gold  stripe #EED04E
 *   azure stripe #1C83B2
 *
 * The shield body is white, so on a white surface (the light-mode sidebar) it
 * picks up a hairline outline from `--brand-mark-outline`.
 */
export function BrandMark({ height = 34, className }: BrandMarkProps) {
  const width = (height * 24) / 28;

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 24 28"
      role="img"
      aria-label="Greenhill"
    >
      {/* shield */}
      <path
        d="M4.2 0.9H19.8A3.1 3.1 0 0 1 22.9 4V11C22.9 18.5 18.4 24.3 12 27.3C5.6 24.3 1.1 18.5 1.1 11V4A3.1 3.1 0 0 1 4.2 0.9Z"
        fill="#FFFFFF"
        stroke="var(--brand-mark-outline, transparent)"
        strokeWidth="1"
      />

      {/* stripes, top to bottom */}
      <rect x="3.6" y="7.5" width="16.8" height="3.6" fill="#273C83" />
      <rect x="3.6" y="12" width="16.8" height="3.6" fill="#EED04E" />
      <rect x="3.6" y="16.5" width="16.8" height="3.6" fill="#1C83B2" />
    </svg>
  );
}
