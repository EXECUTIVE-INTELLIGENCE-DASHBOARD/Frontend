import { interventionQueue } from '../data';
import { Badge } from './Badge';

export function InterventionQueueTable() {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Class / band</th>
            <th scope="col">Signal</th>
            <th scope="col">Next report action</th>
            <th scope="col">Owner</th>
            <th scope="col">Growth ends</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {interventionQueue.map((row) => (
            <tr key={row.band}>
              <td>
                <span className="cell-stack">
                  <span className="cell-strong">{row.band}</span>
                  {row.bandMeta && (
                    <span className="cell-stack__meta">{row.bandMeta}</span>
                  )}
                </span>
              </td>
              <td>
                <span className="cell-stack">
                  <span className="cell-strong">{row.signal}</span>
                  {row.signalMeta && (
                    <span className="cell-stack__meta">{row.signalMeta}</span>
                  )}
                </span>
              </td>
              <td>{row.action}</td>
              <td>
                <span className="cell-stack">
                  <span className="cell-strong">{row.owner}</span>
                  {row.ownerMeta && (
                    <span className="cell-stack__meta">{row.ownerMeta}</span>
                  )}
                </span>
              </td>
              <td>{row.due}</td>
              <td>
                <Badge tone={row.tone}>{row.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
