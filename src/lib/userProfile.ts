/**
 * Prototype user profile.
 *
 * The dashboard has no authentication yet, so these details stand in for the
 * signed-in user and are shown in the header profile panel.
 */

export interface UserProfileField {
  id: string;
  label: string;
  value: string;
}

export interface UserProfile {
  name: string;
  role: string;
  initials: string;
  fields: UserProfileField[];
}

export const userProfile: UserProfile = {
  name: "Maruf Hossen",
  role: "UI Designer",
  initials: "M",
  fields: [
    { id: "email", label: "Email", value: "maruf.hossen@greenhill.ac.ug" },
    { id: "phone", label: "Phone", value: "+256 772 480 116" },
    {
      id: "campus",
      label: "Campus",
      value: "Green Hill Academy Secondary School Kibuli",
    },
    { id: "department", label: "Department", value: "Digital & Innovation" },
    { id: "staff-id", label: "Staff ID", value: "GH-STAFF-0284" },
    { id: "last-login", label: "Last login", value: "Today · 08:42" },
  ],
};
