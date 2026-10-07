import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { trendData } from '../data';
import { CHART_PALETTE, useTheme } from '../theme';

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
  stroke?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: TooltipPayloadItem[];
}

function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      {payload.map((item) => (
        <div className="chart-tooltip__row" key={item.name}>
          <span
            className="chart-tooltip__dot"
            style={{ background: item.color ?? item.stroke }}
          />
          <span>{item.name}</span>
          <span className="chart-tooltip__value">{item.value}%</span>
        </div>
      ))}
    </div>
  );
}

export function AttendanceTrendChart() {
  const { theme } = useTheme();
  const palette = CHART_PALETTE[theme];

  const series = [
    { key: 'seriesA', name: 'Attendance rate', color: palette.green, dashed: false },
    { key: 'seriesB', name: 'Target', color: palette.blue, dashed: true },
    { key: 'seriesC', name: 'Previous year', color: palette.slate, dashed: false },
  ] as const;

  return (
    <div className="panel__body">
      <div className="chart-legend">
        {series.map((s) => (
          <span className="chart-legend__item" key={s.key}>
            <span
              className={`chart-legend__swatch${s.dashed ? ' is-dashed' : ''}`}
              style={{ background: s.color, color: s.color }}
            />
            {s.name}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={trendData} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke={palette.grid} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: palette.tick }}
            dy={8}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: palette.tick }}
            width={48}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: palette.cursor }}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? '5 4' : undefined}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <p className="chart-note">
        Weekly attendance rate compared against the campus target and the same
        period last year. Figures are aggregated across all selected classes.
      </p>
    </div>
  );
}
