import "./AcademicAnalytics.css";

type GradeItem = {
  grade: string;
  students: number;
};

type GraduationItem = {
  level: string;
  enrolled: number;
  graduated: number;
};

const oLevelGrades: GradeItem[] = [
  { grade: "A", students: 42 },
  { grade: "B", students: 86 },
  { grade: "C", students: 124 },
  { grade: "D", students: 98 },
  { grade: "E", students: 38 },
  { grade: "U", students: 12 },
];

const aLevelGrades: GradeItem[] = [
  { grade: "A", students: 28 },
  { grade: "B", students: 56 },
  { grade: "C", students: 74 },
  { grade: "D", students: 42 },
  { grade: "E", students: 18 },
  { grade: "O", students: 8 },
];

const graduationData: GraduationItem[] = [
  {
    level: "O Level",
    enrolled: 420,
    graduated: 386,
  },
  {
    level: "A Level",
    enrolled: 226,
    graduated: 205,
  },
];

function GradeDistribution({
  title,
  grades,
}: {
  title: string;
  grades: GradeItem[];
}) {
  const totalStudents = grades.reduce(
    (total, item) => total + item.students,
    0,
  );

  return (
    <div className="acad-analytics__grade-level">
      <div className="acad-analytics__grade-heading">
        <h3>{title}</h3>
        <span>{totalStudents} students</span>
      </div>

      <div className="acad-analytics__grade-list">
        {grades.map((item) => {
          const percentage =
            totalStudents > 0 ? (item.students / totalStudents) * 100 : 0;

          return (
            <div className="acad-analytics__grade-row" key={item.grade}>
              <span className="acad-analytics__grade-label">{item.grade}</span>

              <div
                className="acad-analytics__grade-track"
                role="progressbar"
                aria-label={`${title} grade ${item.grade}`}
                aria-valuemin={0}
                aria-valuemax={totalStudents}
                aria-valuenow={item.students}
              >
                <span
                  className="acad-analytics__grade-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <span className="acad-analytics__grade-count">
                {item.students}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GraduationBarChart() {
  return (
    <div className="acad-analytics__completion-chart">
      <div className="acad-analytics__completion-bars">
        {graduationData.map((item) => {
          const percentage =
            item.enrolled > 0 ? (item.graduated / item.enrolled) * 100 : 0;

          const levelClass = item.level === "O Level" ? "o-level" : "a-level";

          return (
            <div
              className="acad-analytics__completion-bar-column"
              key={item.level}
            >
              <span className="acad-analytics__completion-percentage">
                {percentage.toFixed(1)}%
              </span>

              <div className="acad-analytics__completion-bar-area">
                <div
                  className="acad-analytics__completion-bar"
                  role="progressbar"
                  aria-label={`${item.level} graduation rate`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Number(percentage.toFixed(1))}
                >
                  <span
                    className={`acad-analytics__completion-bar-fill acad-analytics__completion-bar-fill--${levelClass}`}
                    style={{ height: `${percentage}%` }}
                  />
                </div>
              </div>

              <span className="acad-analytics__completion-level-label">
                {item.level}
              </span>

              <span className="acad-analytics__completion-student-count">
                {item.graduated.toLocaleString()} of{" "}
                {item.enrolled.toLocaleString()} students
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AcademicAnalytics() {
  return (
    <section className="acad-analytics" aria-label="Academic analytics">
      <article className="acad-analytics__card">
        <header className="acad-analytics__header">
          <div>
            <h2>Grade Distribution</h2>
            <p>Breakdown of student grades across academic levels</p>
          </div>
        </header>

        <div className="acad-analytics__grade-columns">
          <GradeDistribution title="O Level" grades={oLevelGrades} />

          <GradeDistribution title="A Level" grades={aLevelGrades} />
        </div>
      </article>

      <article className="acad-analytics__card">
        <header className="acad-analytics__header">
          <div>
            <h2>Graduation Rate</h2>
            <p>Graduation rates by academic level</p>
          </div>
        </header>

        <GraduationBarChart />
      </article>
    </section>
  );
}
