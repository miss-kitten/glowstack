/**
 * GlowStack logo mark + wordmark.
 *
 * Flower geometry:
 *   - 8 petals, each an ellipse (rx=5, ry=11) whose centre sits 9 px above
 *     the flower centre (22, 22) in local space before rotation.
 *   - Rotated at 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315° around (22, 22).
 *   - Even-index petals: rose pink #C2477A
 *   - Odd-index petals: blush #ED93B1
 *   - Small sparkle circles at the four cardinal tips.
 *   - White centre dot to tie the overlapping petals together.
 */

const PETALS = [0, 45, 90, 135, 180, 225, 270, 315]
const ROSE  = '#C2477A'
const BLUSH = '#ED93B1'

export default function GlowStackLogo({ className, style }) {
  return (
    <svg
      viewBox="0 0 140 44"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="GlowStack"
      role="img"
      className={className}
      style={style}
    >
      {/* ── Petals ── */}
      {PETALS.map((deg, i) => (
        <ellipse
          key={deg}
          cx="0"
          cy="-9"
          rx="5"
          ry="11"
          fill={i % 2 === 0 ? ROSE : BLUSH}
          fillOpacity="0.88"
          transform={`translate(22 22) rotate(${deg})`}
        />
      ))}

      {/* ── Cardinal sparkle dots (top, right, bottom, left) ── */}
      <circle cx="22"   cy="2"  r="1.8" fill={ROSE} />
      <circle cx="42"   cy="22" r="1.8" fill={ROSE} />
      <circle cx="22"   cy="42" r="1.8" fill={ROSE} />
      <circle cx="2"    cy="22" r="1.8" fill={ROSE} />

      {/* ── White centre dot ── */}
      <circle cx="22" cy="22" r="4.5" fill="#ffffff" />

      {/* ── Wordmark ── */}
      <text
        x="52"
        y="20"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="17"
        fontWeight="700"
        fill="#3d2a1e"
        letterSpacing="-0.3"
      >
        glow
      </text>
      <text
        x="52"
        y="39"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="17"
        fontWeight="700"
        fill="#C2477A"
        letterSpacing="-0.3"
      >
        stack
      </text>
    </svg>
  )
}
