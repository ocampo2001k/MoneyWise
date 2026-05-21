'use client'

type Segment = { label: string; value: number; color: string; percent?: number }

export default function DonutChart({ segments, size = 220, thickness = 32, centerLabel }: { segments: Segment[]; size?: number; thickness?: number; centerLabel?: string }) {
  const total = segments.reduce((s, d) => s + d.value, 0)
  const radius = size / 2
  const innerRadius = radius - thickness
  let cumulative = 0

  const arcs = segments.map((s) => {
    const fraction = total ? s.value / total : 0
    const startAngle = cumulative * 2 * Math.PI
    cumulative += fraction
    const endAngle = cumulative * 2 * Math.PI
    return { ...s, startAngle, endAngle }
  })

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`translate(${radius}, ${radius})`}>
          {arcs.map((a, idx) => (
            <path key={idx} d={describeArc(0, 0, radius, innerRadius, a.startAngle, a.endAngle)} fill={a.color} />
          ))}
        </g>
      </svg>
      {centerLabel && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
          {centerLabel}
        </div>
      )}
    </div>
  )
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle - Math.PI / 2), y: cy + r * Math.sin(angle - Math.PI / 2) }
}

function describeArc(cx: number, cy: number, rOuter: number, rInner: number, start: number, end: number) {
  if (end - start <= 0) return ''
  // Outer arc
  const p1 = polarToCartesian(cx, cy, rOuter, end)
  const p2 = polarToCartesian(cx, cy, rOuter, start)
  const largeArc = end - start > Math.PI ? 1 : 0
  // Inner arc
  const p3 = polarToCartesian(cx, cy, rInner, start)
  const p4 = polarToCartesian(cx, cy, rInner, end)
  return [
    'M', p1.x, p1.y,
    'A', rOuter, rOuter, 0, largeArc, 0, p2.x, p2.y,
    'L', p3.x, p3.y,
    'A', rInner, rInner, 0, largeArc, 1, p4.x, p4.y,
    'Z',
  ].join(' ')
}


