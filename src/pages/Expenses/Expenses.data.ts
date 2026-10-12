import type { FilterControl } from "./Expenses.types";

export const departmentOptions = [
  "All Departments",
  "Academics",
  "Administration",
  "Finance",
  "Facilities",
  "Human Resources",
  "ICT",
  "Marketing & Admissions",
  "Catering & Boarding",
  "Transport",
];

export const costCentreOptions = [
  "All Cost Centres",
  "CC-100 Teaching",
  "CC-200 Facilities",
  "CC-300 Welfare",
  "CC-400 Admin",
  "CC-500 Transport",
  "CC-600 Marketing",
];

export const filterControls: FilterControl[] = [
  {
    id: "department",
    label: "Department",
    value: departmentOptions[0],
    options: departmentOptions,
  },
  {
    id: "cost-centre",
    label: "Cost Centre",
    value: costCentreOptions[0],
    options: costCentreOptions,
  },
];