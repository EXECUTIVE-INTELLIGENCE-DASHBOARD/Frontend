/**
 * Shared organisation reference data.
 *
 * Every filter control that switches academic year or campus reads from here
 * so the same list appears everywhere in the dashboard.
 */

export const campusOptions = [
  "All Campuses",
  "GreenHill Academy Nursery Kibuli",
  "GreenHill Academy Primary Kibuli",
  "Green Hill Academy Secondary School Kibuli",
  "GreenHill Academy Nursery Buwaate",
  "GreenHill Academy Primary Buwaate",
  "Green Hill International School",
];

export const academicYearOptions = [
  "AY 2025/2026",
  "AY 2024/2025",
  "AY 2023/2024",
  "AY 2022/2023",
];

export const defaultCampus = campusOptions[0];

export const defaultAcademicYear = academicYearOptions[0];
