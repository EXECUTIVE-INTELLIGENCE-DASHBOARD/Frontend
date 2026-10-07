import "./DonutChart.css";

export interface DonutSegment {
  id: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerValue: string;
  centerLabel?: string;
  ariaLabel: string;
  size?: number;
  thickness?: number;
}

export function DonutChart({
  segments,
  centerValue,
  centerLabel,
  ariaLabel,
  size = 196,
  thickness = 26,
}: DonutChartProps) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  const gap = 4;

  let rotation = 0;

  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg
        className="donut__svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={ariaLabel}
      >
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {segments.map((segment) => {
            const arc = (segment.value / total) * circumference;
            const dash = Math.max(arc - gap, 1);
            const offset = -rotation;
            rotation += arc;

            return (
              <circle
                key={segment.id}
                className="donut__segment"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ stroke: segment.color }}
              />
            );
          })}
        </g>
      </svg>

      <div className="donut__center">
        <span className="donut__value">{centerValue}</span>
        {centerLabel ? (
          <span className="donut__label">{centerLabel}</span>
        ) : null}
      </div>
    </div>
  );
}
