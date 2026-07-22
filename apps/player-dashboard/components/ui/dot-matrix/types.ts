export type LoaderProps = {
  /** Width and height of the SVG, in pixels. */
  size?: number;
  /** Animation speed multiplier. Higher is faster. */
  speed?: number;
  /** Any CSS color. Defaults to `currentColor` (the theme foreground). */
  color?: string;
  className?: string;
  "aria-label"?: string;
};
