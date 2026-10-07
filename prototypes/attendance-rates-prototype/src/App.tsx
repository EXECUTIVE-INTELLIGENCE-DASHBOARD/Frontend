import { useState } from 'react';
import {
  Building2,
  CalendarDays,
  ChevronDown,
  Download,
  MoreHorizontal,
} from 'lucide-react';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { SelectField } from './components/SelectField';
import { StatCard } from './components/StatCard';
import { Panel } from './components/Panel';
import { AttendanceTrendChart } from './components/AttendanceTrendChart';
import { StudentGroupChart } from './components/StudentGroupChart';
import { ClassComparisonTable } from './components/ClassComparisonTable';
import { InterventionQueueTable } from './components/InterventionQueueTable';
import { academicYears, campuses, stats } from './data';

function MiniSelect({
  value,
  options,
  label,
}: {
  value: string;
  options: string[];
  label: string;
}) {
  const [current, setCurrent] = useState(value);

  return (
    <div className="mini-select">
      <select
        aria-label={label}
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown size={14} aria-hidden />
    </div>
  );
}

export default function App() {
  const [activeId, setActiveId] = useState('attendance-rates');
  const [academicYear, setAcademicYear] = useState(academicYears[0]);
  const [campus, setCampus] = useState(campuses[0]);

  return (
    <div className="app">
      <Sidebar activeId={activeId} onSelect={setActiveId} />

      <div className="app__main">
        <Topbar />

        <main className="app__content">
          <p className="section-eyebrow">Academic Intelligence &amp; Attendance Rates</p>

          <div className="page-head">
            <div>
              <h1 className="page-head__title">Attendance Rates</h1>
              <p className="page-head__subtitle">
                Monitor constituent attendance and identify classes and learners
                needing follow-up.
              </p>
            </div>
          </div>

          <div className="filters">
            <SelectField
              label="Select Academic Year"
              icon={CalendarDays}
              value={academicYear}
              options={academicYears}
              onChange={setAcademicYear}
            />
            <SelectField
              label="Select Campus"
              icon={Building2}
              value={campus}
              options={campuses}
              onChange={setCampus}
            />
          </div>

          <div className="stat-grid">
            {stats.map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))}
          </div>

          <div className="chart-grid">
            <Panel title="Attendance Trend Comparison" subtitle="Weekly attendance vs. target">
              <AttendanceTrendChart />
            </Panel>
            <Panel title="Attendance by Student Group" subtitle="Current reporting period">
              <StudentGroupChart />
            </Panel>
          </div>

          <div className="stack">
            <Panel
              title="Class, Grade &amp; Student Group Comparison"
              subtitle="Term-by-term attendance across cohorts"
              tools={
                <>
                  <MiniSelect
                    label="Select term"
                    value="All Terms"
                    options={['All Terms', 'Term 1', 'Term 2', 'Term 3']}
                  />
                  <button type="button" className="icon-button" aria-label="More options">
                    <MoreHorizontal size={18} aria-hidden />
                  </button>
                </>
              }
            >
              <ClassComparisonTable />
            </Panel>

            <Panel
              title="Declining Attendance &amp; Intervention Queue"
              subtitle="Learners and classes requiring follow-up"
              tools={
                <button type="button" className="ghost-button">
                  <Download size={15} aria-hidden />
                  Export
                </button>
              }
            >
              <InterventionQueueTable />
            </Panel>
          </div>
        </main>
      </div>
    </div>
  );
}
