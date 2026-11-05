import { useMemo, useState } from "react";

import type { IntakeFigure } from "./admissionsEnrollment.data";
import type {
  CohortRow,
  LevelId,
  SchoolSelection,
} from "./admissionsEnrollment.types";

import {
  classLabelFor,
  formatNumber,
  intakeBySchool,
  levelLabels,
  schoolShortNameFor,
} from "./admissionsEnrollment.data";

import "./SchoolIntakePanel.css";

interface SchoolIntakePanelProps {
  rows: CohortRow[];
  school: SchoolSelection;
  onSelect: (schoolId: string) => void;
}

interface ClassSummary {
  classId: string;
  level: LevelId;
  learners: number;
  streams: {
    name: string;
    learners: number;
  }[];
}

const tiers: {
  id: string;
  label: string;
  levels: LevelId[];
}[] = [
  { id: "nursery", label: "Nursery", levels: ["nursery"] },
  { id: "primary", label: "Primary", levels: ["primary"] },
  {
    id: "secondary",
    label: "Secondary",
    levels: ["olevel", "alevel"],
  },
  { id: "general", label: "Kansanga General", levels: ["general"] },
];

function MixCell({ figure }: { figure: IntakeFigure | null }) {
  if (!figure) {
    return <span className="ae-muted">—</span>;
  }

  return (
    <span className="ae-intake__mix">
      <span className="ae-intake__mix-label">{figure.label}</span>
    </span>
  );
}

function CountCell({ value }: { value: number }) {
  return (
    <td className="ae-num">
      {value === 0 ? <span className="ae-muted">—</span> : formatNumber(value)}
    </td>
  );
}

export function SchoolIntakePanel({
  rows,
}: SchoolIntakePanelProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState("all");

  const tierData = useMemo(
    () =>
      tiers
        .map((tier) => {
          const tierRows = rows.filter((row) =>
            tier.levels.includes(row.level),
          );

          const classMap = new Map<string, ClassSummary>();

          tierRows.forEach((row) => {
            const existing = classMap.get(row.classId);

            if (existing) {
              existing.learners += row.learners;

              const stream = existing.streams.find(
                (item) => item.name === String(row.stream),
              );

              if (stream) {
                stream.learners += row.learners;
              } else {
                existing.streams.push({
                  name: String(row.stream),
                  learners: row.learners,
                });
              }
            } else {
              classMap.set(row.classId, {
                classId: row.classId,
                level: row.level,
                learners: row.learners,
                streams: [
                  {
                    name: String(row.stream),
                    learners: row.learners,
                  },
                ],
              });
            }
          });

          return {
            ...tier,
            learners: tierRows.reduce(
              (total, row) => total + row.learners,
              0,
            ),
            classes: Array.from(classMap.values()),
          };
        })
        .filter((tier) => tier.classes.length > 0),
    [rows],
  );

  const maximum = Math.max(...tierData.map((tier) => tier.learners), 1);
  const activeTier = tierData.find((tier) => tier.id === selectedTier);

  const selectedClassData = activeTier?.classes.find(
    (item) => item.classId === selectedClass,
  );

  // const selectedTierRows = rows.filter(
  //   (row) =>
  //     activeTier?.levels.includes(row.level) &&
  //     row.classId === selectedClass,
  // );

  const classStreams = selectedClassData?.streams ?? [];

  const tableRows =
    selectedClass && activeTier
      ? intakeBySchool(
          rows.filter((row) => activeTier.levels.includes(row.level)),
          selectedClass,
          selectedStream,
        )
      : [];

  const handleTierSelect = (tierId: string) => {
    setSelectedTier((current) => (current === tierId ? null : tierId));
    setSelectedClass(null);
    setSelectedStream("all");
  };

  const handleClassSelect = (classId: string) => {
    setSelectedClass((current) => (current === classId ? null : classId));
    setSelectedStream("all");
  };

  return (
    <section
      className="ae-block ae-block--flush ae-tier-panel"
      aria-labelledby="ae-intake-heading"
    >
      <div className="ae-block__head">
        <div>
          <h2 className="ae-block__title" id="ae-intake-heading">
            Enrolment by Campus & School Tier
          </h2>
          <p className="ae-tier-panel__description">
            Select a tier, then a class, to explore enrolment details.
          </p>
        </div>

        <span className="ae-chip">
          {formatNumber(rows.reduce((total, row) => total + row.learners, 0))}{" "}
          learners
        </span>
      </div>

      

      {/* Tier chart */}
      <div
        className="ae-tier-chart"
        role="group"
        aria-label="Enrolment by school tier"
      >
        {tierData.length === 0 ? (
          <p className="ae-muted">
            No enrolment data available for this selection.
          </p>
        ) : (
          tierData.map((tier) => {
            const percentage = (tier.learners / maximum) * 100;
            const isSelected = selectedTier === tier.id;

            return (
              <button
                type="button"
                key={tier.id}
                className={`ae-tier-bar${isSelected ? " is-selected" : ""}`}
                onClick={() => handleTierSelect(tier.id)}
                aria-expanded={isSelected}
              >
                <span className="ae-tier-bar__label">{tier.label}</span>

                <span className="ae-tier-bar__track">
                  <span
                    className={`ae-tier-bar__fill ae-tier-bar__fill--${tier.id}`}
                    style={{ width: `${percentage}%` }}
                  />
                </span>

                <span className="ae-tier-bar__value">
                  {formatNumber(tier.learners)}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Class selection */}
      {activeTier && (
        <div className="ae-tier-breakdown">
          <div className="ae-tier-breakdown__head">
            <div>
              <h3>{activeTier.label} breakdown</h3>
              <p>
                {formatNumber(activeTier.learners)} learners across{" "}
                {activeTier.classes.length} classes
              </p>
            </div>

            <button
              type="button"
              className="ae-tier-breakdown__close"
              onClick={() => {
                setSelectedTier(null);
                setSelectedClass(null);
                setSelectedStream("all");
              }}
            >
              Close
            </button>
          </div>

          {activeTier.id === "secondary" ? (
            (["olevel", "alevel"] as LevelId[]).map((level) => {
              const classes = activeTier.classes.filter(
                (item) => item.level === level,
              );

              if (classes.length === 0) return null;

              return (
                <div className="ae-tier-level" key={level}>
                  <h4>{levelLabels[level]}</h4>

                  <div className="ae-tier-class-list">
                    {classes.map((item) => (
                      <button
                        type="button"
                        key={item.classId}
                        className={`ae-tier-class ae-tier-class--button${
                          selectedClass === item.classId ? " is-selected" : ""
                        }`}
                        onClick={() => handleClassSelect(item.classId)}
                        aria-expanded={selectedClass === item.classId}
                      >
                        <span>{classLabelFor(item.classId)}</span>
                        <strong>{formatNumber(item.learners)}</strong>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="ae-tier-class-list">
              {activeTier.classes.map((item) => (
                <button
                  type="button"
                  key={item.classId}
                  className={`ae-tier-class ae-tier-class--button${
                    selectedClass === item.classId ? " is-selected" : ""
                  }`}
                  onClick={() => handleClassSelect(item.classId)}
                  aria-expanded={selectedClass === item.classId}
                >
                  <span>{classLabelFor(item.classId)}</span>
                  <strong>{formatNumber(item.learners)}</strong>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stream selection */}
      {selectedClassData &&
  activeTier?.id !== "nursery" &&
  classStreams.length > 1 && (
        <div className="ae-tier-stream-selection">
          <h4>
            {classLabelFor(selectedClassData.classId)} streams
          </h4>

          <div className="ae-tier-stream-options">
            <button
              type="button"
              className={`ae-tier-stream-option${
                selectedStream === "all" ? " is-selected" : ""
              }`}
              onClick={() => setSelectedStream("all")}
            >
              All streams
            </button>

            {classStreams.map((stream) => (
              <button
                type="button"
                key={stream.name}
                className={`ae-tier-stream-option${
                  selectedStream === stream.name ? " is-selected" : ""
                }`}
                onClick={() => setSelectedStream(stream.name)}
              >
                {stream.name}
                <span>{formatNumber(stream.learners)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Original detailed table */}
      {selectedClass && (
        <div className="ae-tier-detail-table">
          <div className="ae-tier-detail-table__heading">
            <div>
              <h3>
                {classLabelFor(selectedClass)}
                {selectedStream !== "all" ? ` — ${selectedStream}` : ""}
              </h3>
              <p>
                Detailed enrolment by school, gender, boarding, day and age.
              </p>
            </div>
          </div>

          <div className="ae-table-wrap">
            <table className="ae-table ae-table--intake">
              <caption className="ae-sr-only">
                {classLabelFor(selectedClass)} enrolment by school, with
                gender, boarding, day and age
              </caption>

              <colgroup>
                <col className="ae-intake__school-column" />
                <col className="ae-intake__count-column" />
                <col className="ae-intake__count-column" />
                <col className="ae-intake__count-column" />
                <col className="ae-intake__count-column" />
                <col className="ae-intake__age-column" />
              </colgroup>

              <thead>
                <tr>
                  <th scope="col">School</th>
                  <th scope="col" className="ae-num">Girls</th>
                  <th scope="col" className="ae-num">Boys</th>
                  <th scope="col" className="ae-num">Boarding</th>
                  <th scope="col" className="ae-num">Day</th>
                  <th scope="col">Age</th>
                </tr>
              </thead>

              <tbody>
                {tableRows.length === 0 ? (
                  <tr>
                    <td className="ae-muted" colSpan={6}>
                      No enrolment figures are available for this selection.
                    </td>
                  </tr>
                ) : (
                  tableRows.map((row) => (
                    <tr key={row.schoolId} className="ae-intake__row">
                      <th scope="row">
                        <span className="ae-intake__school-name">
  {schoolShortNameFor(row.schoolId)}
</span>
                      </th>

                      <CountCell value={row.girls} />
                      <CountCell value={row.boys} />
                      <CountCell value={row.boarding} />
                      <CountCell value={row.day} />

                      <td>
                        <MixCell figure={row.age} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}