/**
 * Pure SVG DonutChart. Accepts [{ label, value, color? }] data.
 */

const DonutChart = ({ data = [], size = 200, thickness = 26, centerLabel, centerValue }) => {
  if (!data.length || data.reduce((acc, d) => acc + d.value, 0) === 0) {
    return <p className="chart-empty">No data to display.</p>;
  }
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} className="donut-chart" role="img" aria-label="Distribution">
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--color-surface-2)"
          strokeWidth={thickness}
        />
        {data.map((d, i) => {
          const length = (d.value / total) * circumference;
          const dashArray = `${length} ${circumference - length}`;
          const dashOffset = -offset;
          offset += length;
          return (
            <circle
              key={`${d.label}-${i}`}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={d.color || '#2563EB'}
              strokeWidth={thickness}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          );
        })}
        {(centerLabel || centerValue) && (
          <g>
            {centerValue && (
              <text
                x={cx}
                y={cy + 2}
                textAnchor="middle"
                fontSize="22"
                fontWeight="700"
                fill="var(--color-text-primary)"
              >
                {centerValue}
              </text>
            )}
            {centerLabel && (
              <text
                x={cx}
                y={cy + 22}
                textAnchor="middle"
                fontSize="11"
                fill="var(--color-text-tertiary)"
              >
                {centerLabel}
              </text>
            )}
          </g>
        )}
      </svg>
      <ul className="donut-legend">
        {data.map((d, i) => (
          <li key={`${d.label}-${i}`}>
            <span className="donut-legend__dot" style={{ backgroundColor: d.color || '#2563EB' }} />
            <span className="donut-legend__label">{d.label}</span>
            <span className="donut-legend__value">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DonutChart;