import { useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import "./AcademicDetails.css";

type SubjectResult = {
  subject: string;
  level: "O Level" | "A Level";
  category: "Science" | "Arts";
  average: number;
  passRate: number;
  previousPassRate: number;
};

type TestResult = {
  subject: string;
  level: "O Level" | "A Level";
  testOne: number;
  testTwo: number;
  passRate: number;
  studentsAssessed: number;
};

const subjectResults: SubjectResult[] = [
  {
    subject: "Mathematics",
    level: "O Level",
    category: "Science",
    average: 76,
    passRate: 88,
    previousPassRate: 84,
  },
  {
    subject: "Biology",
    level: "O Level",
    category: "Science",
    average: 81,
    passRate: 91,
    previousPassRate: 87,
  },
  {
    subject: "Chemistry",
    level: "O Level",
    category: "Science",
    average: 72,
    passRate: 83,
    previousPassRate: 85,
  },
  {
    subject: "Physics",
    level: "O Level",
    category: "Science",
    average: 69,
    passRate: 79,
    previousPassRate: 76,
  },
  {
    subject: "English Language",
    level: "O Level",
    category: "Arts",
    average: 84,
    passRate: 94,
    previousPassRate: 90,
  },
  {
    subject: "History",
    level: "O Level",
    category: "Arts",
    average: 78,
    passRate: 89,
    previousPassRate: 86,
  },
  {
    subject: "Geography",
    level: "O Level",
    category: "Arts",
    average: 75,
    passRate: 86,
    previousPassRate: 83,
  },
  {
    subject: "Literature",
    level: "A Level",
    category: "Arts",
    average: 82,
    passRate: 92,
    previousPassRate: 89,
  },
  {
    subject: "Physics",
    level: "A Level",
    category: "Science",
    average: 74,
    passRate: 85,
    previousPassRate: 82,
  },
  {
    subject: "Economics",
    level: "A Level",
    category: "Arts",
    average: 79,
    passRate: 90,
    previousPassRate: 87,
  },
  {
    subject: "Mathematics",
    level: "A Level",
    category: "Science",
    average: 77,
    passRate: 88,
    previousPassRate: 85,
  },
  {
    subject: "Chemistry",
    level: "A Level",
    category: "Science",
    average: 73,
    passRate: 84,
    previousPassRate: 81,
  },
];

const testResults: TestResult[] = [
  {
    subject: "Mathematics",
    level: "O Level",
    testOne: 72,
    testTwo: 78,
    passRate: 88,
    studentsAssessed: 120,
  },
  {
    subject: "English Language",
    level: "O Level",
    testOne: 81,
    testTwo: 84,
    passRate: 94,
    studentsAssessed: 120,
  },
  {
    subject: "Biology",
    level: "O Level",
    testOne: 76,
    testTwo: 81,
    passRate: 91,
    studentsAssessed: 96,
  },
  {
    subject: "Chemistry",
    level: "O Level",
    testOne: 75,
    testTwo: 72,
    passRate: 83,
    studentsAssessed: 96,
  },
  {
    subject: "Physics",
    level: "A Level",
    testOne: 70,
    testTwo: 74,
    passRate: 85,
    studentsAssessed: 54,
  },
  {
    subject: "Mathematics",
    level: "A Level",
    testOne: 74,
    testTwo: 77,
    passRate: 88,
    studentsAssessed: 54,
  },
  {
    subject: "Literature",
    level: "A Level",
    testOne: 79,
    testTwo: 82,
    passRate: 92,
    studentsAssessed: 42,
  },
  {
    subject: "Economics",
    level: "A Level",
    testOne: 76,
    testTwo: 79,
    passRate: 90,
    studentsAssessed: 42,
  },
];

type LevelFilter = "All Levels" | "O Level" | "A Level";
type CategoryFilter = "All Subjects" | "Science" | "Arts";
type TestFilter = "Test 1" | "Test 2";

function SubjectComparison() {
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("All Levels");

  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>("All Subjects");

  const filteredSubjects = subjectResults.filter((item) => {
    const matchesLevel =
      levelFilter === "All Levels" || item.level === levelFilter;

    const matchesCategory =
      categoryFilter === "All Subjects" || item.category === categoryFilter;

    return matchesLevel && matchesCategory;
  });

  return (
    <article className="acad-details__card">
      <div className="acad-details__heading">
        <div className="acad-details__title">
          <h2>Subject Comparison</h2>
        </div>
      </div>

      <div className="acad-details__filters">
        <label className="acad-details__filter">
          <span>Academic level</span>
          <select
            value={levelFilter}
            onChange={(event) =>
              setLevelFilter(event.target.value as LevelFilter)
            }
          >
            <option>All Levels</option>
            <option>O Level</option>
            <option>A Level</option>
          </select>
        </label>

        <label className="acad-details__filter">
          <span>Subject category</span>
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value as CategoryFilter)
            }
          >
            <option>All Subjects</option>
            <option>Science</option>
            <option>Arts</option>
          </select>
        </label>
      </div>

      <div className="acad-details__subject-list">
        <div className="acad-details__list-header">
          <span>Subject</span>
          <span>Level</span>
          <span>Pass rate</span>
          <span>Change</span>
        </div>

        {filteredSubjects.map((item) => {
          const change = item.passRate - item.previousPassRate;

          return (
            <div
              className="acad-details__subject-row"
              key={`${item.level}-${item.subject}`}
            >
              <div className="acad-details__subject-name">
                <strong>{item.subject}</strong>
              </div>

              <span className="acad-details__level">{item.level}</span>

              <strong className="acad-details__pass-rate">
                {item.passRate}%
              </strong>

              <span
                className={
                  change >= 0
                    ? "acad-details__change acad-details__change--up"
                    : "acad-details__change acad-details__change--down"
                }
              >
                {change >= 0 ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                {change > 0 ? "+" : ""}
                {change}%
              </span>
            </div>
          );
        })}

        {filteredSubjects.length === 0 && (
          <p className="acad-details__empty">
            No subjects match the selected filters.
          </p>
        )}
      </div>
    </article>
  );
}

function TestResultsTable() {
  const [selectedTest, setSelectedTest] = useState<TestFilter>("Test 2");

  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>("All Levels");

  const filteredResults = testResults.filter((item) => {
    return selectedLevel === "All Levels" || item.level === selectedLevel;
  });

  return (
    <article className="acad-details__card acad-details__tests">
      <div className="acad-details__heading">
        <div className="acad-details__title">
          <h2>Test Results</h2>
        </div>
      </div>

      <div className="acad-details__table-filters">
        <label className="acad-details__filter">
          <span>Assessment</span>
          <select
            value={selectedTest}
            onChange={(event) =>
              setSelectedTest(event.target.value as TestFilter)
            }
          >
            <option>Test 1</option>
            <option>Test 2</option>
          </select>
        </label>

        <label className="acad-details__filter">
          <span>Academic level</span>
          <select
            value={selectedLevel}
            onChange={(event) =>
              setSelectedLevel(event.target.value as LevelFilter)
            }
          >
            <option>All Levels</option>
            <option>O Level</option>
            <option>A Level</option>
          </select>
        </label>
      </div>

      <div className="acad-details__table-scroll">
        <table className="acad-details__table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Level</th>
              <th>{selectedTest} score</th>
              <th>Pass rate</th>
              <th>Students assessed</th>
            </tr>
          </thead>

          <tbody>
            {filteredResults.map((item) => {
              const score =
                selectedTest === "Test 1" ? item.testOne : item.testTwo;

              return (
                <tr key={`${item.level}-${item.subject}`}>
                  <td className="acad-details__table-subject">
                    {item.subject}
                  </td>

                  <td>
                    <span className="acad-details__level-badge">
                      {item.level}
                    </span>
                  </td>

                  <td>
                    <div className="acad-details__score">
                      <strong>{score}%</strong>
                    </div>
                  </td>

                  <td>
                    <span className="acad-details__table-pass">
                      {item.passRate}%
                    </span>
                  </td>

                  <td>{item.studentsAssessed}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredResults.length === 0 && (
          <p className="acad-details__empty">
            No test results are available for these filters.
          </p>
        )}
      </div>
    </article>
  );
}

export function AcademicDetails() {
  return (
    <section
      className="acad-details"
      aria-label="Subject comparison and test results"
    >
      <SubjectComparison />
      <TestResultsTable />
    </section>
  );
}
