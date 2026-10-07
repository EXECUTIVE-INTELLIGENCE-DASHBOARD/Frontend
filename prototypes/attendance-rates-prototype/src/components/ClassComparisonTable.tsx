import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { classComparison } from '../data';
import { Badge } from './Badge';

export function ClassComparisonTable() {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Class</th>
            <th scope="col">Class / grade name</th>
            <th scope="col" className="is-numeric">Term 1</th>
            <th scope="col" className="is-numeric">Term 2</th>
            <th scope="col" className="is-numeric">Term 3</th>
            <th scope="col" className="is-numeric">Change (ppl)</th>
            <th scope="col">Flag</th>
          </tr>
        </thead>
        <tbody>
          {classComparison.map((row) => {
            const isUp = row.change > 0;
            const isFlat = row.change === 0;
            const DeltaIcon = isFlat ? Minus : isUp ? ArrowUp : ArrowDown;

            return (
              <tr key={`${row.kind}-${row.name}`}>
                <td>
                  <span className="kind-tag">{row.kind}</span>
                </td>
                <td className="cell-strong">{row.name}</td>
                <td className="is-numeric">{row.term1.toFixed(1)}%</td>
                <td className="is-numeric">{row.term2.toFixed(1)}%</td>
                <td className="is-numeric">{row.term3.toFixed(1)}%</td>
                <td className="is-numeric">
                  <span
                    className={`delta ${
                      isFlat ? 'is-flat' : isUp ? 'is-up' : 'is-down'
                    }`}
                  >
                    <DeltaIcon size={13} strokeWidth={2.5} aria-hidden />
                    {Math.abs(row.change).toFixed(1)}
                  </span>
                </td>
                <td>
                  <Badge tone={row.tone}>{row.flag}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
