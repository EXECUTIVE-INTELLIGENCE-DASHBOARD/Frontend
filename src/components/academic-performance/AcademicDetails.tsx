import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
// import { useMemo } from "react";
import api from "../../api/axios";
import type { AcademicFilterValues } from "../filters/academicFilters.types";

import "./AcademicDetails.css";

interface AcademicDetailsProps {
  filters?: AcademicFilterValues;
}

interface SyllabusRecord {
  id: number;
  subject_name: string;
  class_level: string;
  topics_planned: number | null;
  topics_covered: number | null;
  school: number;
  term: number;
}

interface NationalExamResult {
  id: number;
  exam_display: string;
  division_display: string;
  exam: string;
  year: number;
  division: string;
  aggregate: number | null;
  principal_passes: number | null;
  passed: boolean;
  student: number;
  school: number;
}

interface SubjectRow {
  key: string;
  subject: string;
  level: string;
  planned: number;
  covered: number;
  records: number;
}

interface ExamRow {
  key: string;
  exam: string;
  result: string;
  candidates: number;
  passed: number;
}

const REFRESH_INTERVAL = 30_000;

const DEFAULT_FILTERS: AcademicFilterValues = {
  school: "",
  campus: "",
  section: "",
  term: "",
  year: String(new Date().getFullYear()),
};

const SCIENCE_SUBJECTS = new Set([
  "biology",
  "chemistry",
  "physics",
  "mathematics",
  "integrated science",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (isRecord(response)) {
    for (const key of ["results", "data", "records", "items"]) {
      if (Array.isArray(response[key])) {
        return response[key] as T[];
      }
    }
  }

  return [];
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

function getErrorMessage(error: unknown): string {
  if (
    isRecord(error) &&
    isRecord(error.response) &&
    typeof error.response.status === "number"
  ) {
    return `Unable to load data (HTTP ${error.response.status})`;
  }

  return "Unable to load data. Please try again.";
}

function getSchoolId(school: string): number | null {
  if (!school.trim()) {
    return null;
  }

  const id = Number(school);

  return Number.isInteger(id) && id > 0 ? id : null;
}

function getStage(classLevel: string): string {
  const normalized = classLevel.trim().toUpperCase();
  const match = normalized.match(/^S(\d+)$/);

  if (match) {
    return Number(match[1]) <= 4 ? "O Level" : "A Level";
  }

  if (/^P\d+$/.test(normalized)) {
    return "Primary";
  }

  return "Nursery";
}

function isScienceSubject(subject: string): boolean {
  return SCIENCE_SUBJECTS.has(subject.trim().toLowerCase());
}

function getSecondaryStage(
  classLevel: string,
  selectedLevel: "O Level" | "A Level",
): boolean {
  const stage = getStage(classLevel);
  return stage === selectedLevel;
}

function buildSubjectRows(
  records: SyllabusRecord[],
  selectedSchool: number | null,
  section: string,
  secondaryLevel: "O Level" | "A Level",
): SubjectRow[] {
  const selectedSection = selectedSchool ? section.trim().toLowerCase() : "";

  const schoolRecords = records.filter(
    (record) => selectedSchool === null || record.school === selectedSchool,
  );

  const grouped = new Map<string, SubjectRow>();

  for (const record of schoolRecords) {
    const stage = getStage(record.class_level);
    let subject: string;
    let level: string;

    if (selectedSection === "secondary") {
      if (stage !== "O Level" && stage !== "A Level") {
        continue;
      }

      if (!getSecondaryStage(record.class_level, secondaryLevel)) {
        continue;
      }

      subject = isScienceSubject(record.subject_name) ? "SCIENCES" : "ARTS";

      level = secondaryLevel;
    } else if (selectedSection === "primary") {
      if (stage !== "Primary") {
        continue;
      }

      subject = record.subject_name;
      level = "Primary";
    } else if (selectedSection === "nursery") {
      subject = record.subject_name;
      level = "Nursery";
    } else {
      // All Schools: keep primary subjects individually and
      // group secondary subjects into ARTS and SCIENCES.
      if (stage === "O Level" || stage === "A Level") {
        subject = isScienceSubject(record.subject_name) ? "SCIENCES" : "ARTS";

        level = stage;
      } else {
        subject = record.subject_name;
        level = stage;
      }
    }

    const key = `${level}:${subject}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        subject,
        level,
        planned: 0,
        covered: 0,
        records: 0,
      });
    }

    const row = grouped.get(key)!;
    const planned = toNumber(record.topics_planned);
    const covered = toNumber(record.topics_covered);

    if (planned !== null && covered !== null && planned > 0 && covered >= 0) {
      row.planned += planned;
      row.covered += covered;
      row.records += 1;
    }
  }

  return Array.from(grouped.values()).sort((a, b) => {
    const levelOrder = ["Nursery", "Primary", "O Level", "A Level"];

    const levelDifference =
      levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);

    if (levelDifference !== 0) {
      return levelDifference;
    }

    return a.subject.localeCompare(b.subject);
  });
}

function getCoverage(row: SubjectRow): string {
  if (row.planned <= 0) {
    return "—";
  }

  return `${((row.covered / row.planned) * 100).toFixed(1)}%`;
}

function buildExamRows(results: NationalExamResult[]): ExamRow[] {
  const grouped = new Map<
    string,
    {
      exam: string;
      result: string;
      candidates: number;
      passed: number;
    }
  >();

  for (const record of results) {
    let resultLabel: string;

    if (record.exam.toLowerCase() === "uace") {
      resultLabel =
        record.principal_passes === null
          ? "Principal passes not recorded"
          : `${record.principal_passes} principal passes`;
    } else {
      resultLabel =
        record.division_display || (record.passed ? "Passed" : "Not passed");
    }

    const key = `${record.exam}:${record.year}:${resultLabel}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        exam: record.exam_display || record.exam.toUpperCase(),
        result: resultLabel,
        candidates: 0,
        passed: 0,
      });
    }

    const row = grouped.get(key)!;

    row.candidates += 1;

    if (record.passed) {
      row.passed += 1;
    }
  }

  return Array.from(grouped.entries()).map(([key, row]) => ({
    key,
    ...row,
  }));
}

function getAllowedExams(
  section: string,
  secondaryLevel: "O Level" | "A Level",
): string[] | null {
  switch (section.toLowerCase()) {
    case "primary":
      return ["ple"];

    case "secondary":
      return [secondaryLevel === "A Level" ? "uace" : "uce"];

    case "nursery":
      return [];

    default:
      return null;
  }
}

export function AcademicDetails({
  filters = DEFAULT_FILTERS,
}: AcademicDetailsProps) {
  const [secondaryLevel, setSecondaryLevel] = useState<"O Level" | "A Level">(
    "O Level",
  );

  const schoolId = getSchoolId(filters.school);

  const section = schoolId === null ? "" : filters.section.trim().toLowerCase();

  const syllabusQuery = useQuery({
    queryKey: ["academic-details-syllabus"],
    queryFn: async ({ signal }) => {
      const response = await api.get<unknown>("/academics/syllabus-coverage/", {
        signal,
      });

      return normalizeArray<SyllabusRecord>(response.data);
    },
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  });

  const nationalExamsQuery = useQuery({
    queryKey: ["academic-national-exam-results"],
    queryFn: async ({ signal }) => {
      const response = await api.get<unknown>(
        "/academics/national-exam-results/",
        { signal },
      );

      return normalizeArray<NationalExamResult>(response.data);
    },
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  });

  const allSyllabusRecords = syllabusQuery.data ?? [];

  const subjectRows = buildSubjectRows(
    allSyllabusRecords,
    schoolId,
    section,
    secondaryLevel,
  );

  const allowedExams = getAllowedExams(section, secondaryLevel);
  const selectedYear = Number(filters.year);

  const nationalResults = (nationalExamsQuery.data ?? []).filter((record) => {
    const matchesSchool = schoolId === null || record.school === schoolId;

    const matchesYear = !filters.year || record.year === selectedYear;

    const matchesLevel =
      allowedExams === null || allowedExams.includes(record.exam.toLowerCase());

    return matchesSchool && matchesYear && matchesLevel;
  });

  const examRows = buildExamRows(nationalResults);
  const candidateCount = nationalResults.length;
  const passedCount = nationalResults.filter((record) => record.passed).length;

  const passRate =
    candidateCount > 0
      ? `${((passedCount / candidateCount) * 100).toFixed(1)}%`
      : "—";

  const isNursery = section === "nursery";

  return (
    <section
      className="acad-details"
      aria-label="Subject comparison and national examination results"
      aria-busy={syllabusQuery.isLoading || nationalExamsQuery.isLoading}
    >
      <div className="acad-details__grid">
        <article className="acad-details__card">
          <header className="acad-details__header">
            <div>
              <h2>Subject Comparison</h2>
              <p>
                {schoolId === null
                  ? "Subject coverage across all schools"
                  : "Subject coverage for the selected school"}
              </p>
            </div>

            {section === "secondary" && (
              <label className="acad-details__filter">
                <span>Academic level</span>

                <select
                  aria-label="Academic level"
                  value={secondaryLevel}
                  onChange={(event) =>
                    setSecondaryLevel(
                      event.target.value as "O Level" | "A Level",
                    )
                  }
                >
                  <option value="O Level">O Level</option>
                  <option value="A Level">A Level</option>
                </select>
              </label>
            )}
          </header>

          {syllabusQuery.isLoading ? (
            <p role="status">Loading subject coverage...</p>
          ) : syllabusQuery.isError ? (
            <p role="alert">{getErrorMessage(syllabusQuery.error)}</p>
          ) : (
            <div className="acad-details__table-wrapper">
              <table className="acad-details__table">
                <thead>
                  <tr>
                    <th scope="col">Subject</th>
                    <th scope="col">Level</th>
                    <th scope="col">Syllabus coverage</th>
                  </tr>
                </thead>

                <tbody>
                  {subjectRows.length === 0 ? (
                    <tr>
                      <td colSpan={3}>
                        No syllabus records available for this selection.
                      </td>
                    </tr>
                  ) : (
                    subjectRows.map((row) => (
                      <tr className="acad-details__subject-row" key={row.key}>
                        <td>{row.subject}</td>
                        <td>{row.level}</td>
                        <td>
                          <span>{getCoverage(row)}</span>

                          <span className="acad-details__coverage-detail">
                            {" "}
                            ({formatNumber(row.covered)} /{" "}
                            {formatNumber(row.planned)})
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="acad-details__card">
          <header className="acad-details__header">
            <div>
              <h2>National Examinations</h2>
              <p>
                {section === "secondary"
                  ? secondaryLevel === "A Level"
                    ? "UACE results"
                    : "UCE results"
                  : section === "primary"
                    ? "PLE results"
                    : isNursery
                      ? "National examinations are not applicable to this nursery selection."
                      : "National examination results across schools"}
              </p>
            </div>
          </header>

          {isNursery ? (
            <p>
              National examination results are not applicable to nursery
              schools.
            </p>
          ) : nationalExamsQuery.isLoading ? (
            <p role="status">Loading national examination results...</p>
          ) : nationalExamsQuery.isError ? (
            <p role="alert">{getErrorMessage(nationalExamsQuery.error)}</p>
          ) : nationalResults.length === 0 ? (
            <p>
              No national examination results are available for{" "}
              {filters.year || "the selected year"}.
            </p>
          ) : (
            <>
              <div className="acad-details__exam-summary">
                <div>
                  <span>Candidates</span>
                  <strong>{formatNumber(candidateCount)}</strong>
                </div>

                <div>
                  <span>Passed</span>
                  <strong>{formatNumber(passedCount)}</strong>
                </div>

                <div>
                  <span>Pass rate</span>
                  <strong>{passRate}</strong>
                </div>
              </div>

              <div className="acad-details__table-wrapper">
                <table className="acad-details__table">
                  <thead>
                    <tr>
                      <th scope="col">Examination</th>
                      <th scope="col">Result / Division</th>
                      <th scope="col">Candidates</th>
                      <th scope="col">Pass rate</th>
                    </tr>
                  </thead>

                  <tbody>
                    {examRows.map((row) => (
                      <tr key={row.key}>
                        <td>{row.exam}</td>
                        <td>{row.result}</td>
                        <td>{formatNumber(row.candidates)}</td>
                        <td>
                          {row.candidates > 0
                            ? `${((row.passed / row.candidates) * 100).toFixed(
                                1,
                              )}%`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
