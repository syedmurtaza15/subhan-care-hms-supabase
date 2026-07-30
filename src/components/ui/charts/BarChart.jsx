/**
 * Pure SVG BarChart. Accepts [{ label, value, color? }] data.
 * Responsive: viewBox-driven so it scales with the container.
 */
const BarChart = ({
  data = [],
  height = 220,
  valueFormatter = (v) => v,
  yAxisLabel = '',
  showValues = true,
}) => {
  if (!data.length) {
    return <p className="chart-empty">No data to display.</p>;
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  const padding = { top: 18, right: 16, bottom: 36, left: 56 };
  const width = 600;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const barWidth = Math.min(48, (innerWidth / data.length) * 0.6);
  const slotWidth = innerWidth / data.length;

  // Build Y-axis ticks
  const ticks = [];
  const tickCount = 4;
  for (let i = 0; i <= tickCount; i += 1) {
    const v = (max / tickCount) * i;
    ticks.push(v);
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="bar-chart" role="img" aria-label={yAxisLabel}>
      {/* Grid + Y-axis ticks */}
      {ticks.map((tick) => {
        const y = padding.top + innerHeight - (tick / max) * innerHeight;
        return (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="var(--color-border)"
              strokeDasharray="3 3"
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="var(--color-text-tertiary)"
            >
              {valueFormatter(tick).toString()}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const x = padding.left + i * slotWidth + (slotWidth - barWidth) / 2;
        const barHeight = (d.value / max) * innerHeight;
        const y = padding.top + innerHeight - barHeight;
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, 2)}
              rx="6"
              fill={d.color || 'url(#barGradient)'}
            />
            {showValues && d.value > 0 && (
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="var(--color-text-primary)"
              >
                {valueFormatter(d.value)}
              </text>
            )}
            <text
              x={x + barWidth / 2}
              y={height - padding.bottom + 16}
              textAnchor="middle"
              fontSize="11"
              fill="var(--color-text-secondary)"
            >
              {d.label}
            </text>
          </g>
        );
      })}

      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default BarChart;