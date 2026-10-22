/**
 * `academics` app endpoints.
 *
 * Mounted by `config/urls.py` as `path("api/", include("academics.urls"))` with
 * a `DefaultRouter` mounted at `academics/`, so every URL is
 * `/api/academics/<resource>/`.
 */
import { createCrudResource } from "./resources";
import type {
  AcademicRecord,
  AttendanceRecord,
  Curricular,
  GradeResult,
  HomeworkRecord,
  SectionRecord,
  StaffMember,
  Student,
  StudentEvent,
} from "./types";

export const students = createCrudResource<Student>("academics/students");

/** `Academic` records (per-student syllabus/outcome rows). */
export const academicRecords =
  createCrudResource<AcademicRecord>("academics/academics");

export const sections = createCrudResource<SectionRecord>("academics/sections");

export const gradeResults =
  createCrudResource<GradeResult>("academics/grade-results");

export const homework = createCrudResource<HomeworkRecord>("academics/homework");

export const attendance =
  createCrudResource<AttendanceRecord>("academics/attendance");

export const curricular = createCrudResource<Curricular>("academics/curricular");

export const events = createCrudResource<StudentEvent>("academics/events");

export const staff = createCrudResource<StaffMember>("academics/staff");

export const academicsApi = {
  students,
  academicRecords,
  sections,
  gradeResults,
  homework,
  attendance,
  curricular,
  events,
  staff,
} as const;

export type AcademicsApi = typeof academicsApi;

/** Resource key used by React Query caches. */
export type AcademicsResource = keyof AcademicsApi;
