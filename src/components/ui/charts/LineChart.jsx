/**
 * Pure SVG LineChart. Accepts [{ label, value }] data.
 */
const LineChart = ({
  data = [],
  height = 220,
  valueFormatter = (v) => v,
  yAxisLabel = '',
  showDots = true,
  areaFill = true,
}) => {
  if (!data.length) {
    return <p className="chart-empty">No data to display.</p>;
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  const padding = { top: 18, right: 16, bottom: 36, left: 56 };
  const width = 600;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const step = data.length > 1 ? innerWidth / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = padding.left + i * step;
    const y = padding.top + innerHeight - (d.value / max) * innerHeight;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath =
    `${linePath} L${padding.left + (points.length - 1) * step},${padding.top + innerHeight} ` +
    `L${padding.left},${padding.top + innerHeight} Z`;

  const ticks = [];
  for (let i = 0; i <= 4; i += 1) ticks.push((max / 4) * i);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="line-chart" role="img" aria-label={yAxisLabel}>
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(37, 99, 235, 0.3)" />
          <stop offset="100%" stopColor="rgba(37, 99, 235, 0)" />
        </linearGradient>
      </defs>
      {ticks.map((tick) => {
        const y = padding.top + innerHeight - (tick / max) * innerHeight;
        return (
          <g key={tick}>
            <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="var(--color-border)" strokeDasharray="3 3" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="var(--color-text-tertiary)">
              {valueFormatter(tick).toString()}
            </text>
          </g>
        );
      })}
      {areaFill && <path d={areaPath} fill="url(#lineGradient)" />}
      <path d={linePath} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {showDots && points.map((p, i) => (
        <g key={`${p.label}-${i}`}>
          <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="var(--color-primary)" strokeWidth="2.5" />
        </g>
      ))}
      {points.map((p, i) => (
        <text key={`label-${i}`} x={p.x} y={height - padding.bottom + 16} textAnchor="middle" fontSize="11" fill="var(--color-text-secondary)">
          {p.label}
        </text>
      ))}
    </svg>
  );
};

export default LineChart;