import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { groupData } from '../data';
import { CHART_PALETTE, useTheme } from '../theme';

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  fill?: string;
  color?: string;
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
            style={{ background: item.fill ?? item.color }}
          />
          <span>{item.name}</span>
          <span className="chart-tooltip__value">{item.value}%</span>
        </div>
      ))}
    </div>
  );
}

export function StudentGroupChart() {
  const { theme } = useTheme();
  const palette = CHART_PALETTE[theme];

  const series = [
    { key: 'seriesA', name: 'Present', color: palette.green },
    { key: 'seriesB', name: 'Late', color: palette.blue },
    { key: 'seriesC', name: 'Absent', color: palette.slate },
  ] as const;

  return (
    <div className="panel__body">
      <div className="chart-legend">
        {series.map((s) => (
          <span className="chart-legend__item" key={s.key}>
            <span className="chart-legend__swatch" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={groupData}
          layout="vertical"
          barSize={6}
          barGap={2}
          margin={{ top: 8, right: 12, bottom: 0, left: -6 }}
        >
          <CartesianGrid horizontal={false} stroke={palette.grid} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: palette.tick }}
          />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: palette.tick }}
            width={64}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: palette.barCursor }}
          />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.color}
              radius={[0, 3, 3, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      <p className="chart-note">
        Attendance split by student group for the current reporting period.
      </p>
    </div>
  );
}
