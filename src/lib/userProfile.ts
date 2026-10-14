export interface UserProfileField {
  id: string;
  label: string;
  value: string;
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  initials: string;
  fields: UserProfileField[];
}

export const userProfile: UserProfile = {
  name: "Maruf Hossen",
  role: "UI Designer",
  email: "maruf.hossen@greenhill.ac.ug",
  initials: "M",
  fields: [
    {
      id: "email",
      label: "Email",
      value: "maruf.hossen@greenhill.ac.ug",
    },
    {
      id: "phone",
      label: "Phone",
      value: "+256 772 480 116",
    },
    {
      id: "campus",
      label: "Campus",
      value: "Green Hill Academy Secondary School Kibuli",
    },
    {
      id: "department",
      label: "Department",
      value: "Digital & Innovation",
    },
    {
      id: "staffId",
      label: "Staff ID",
      value: "GH-STAFF-0284",
    },
    {
      id: "lastLogin",
      label: "Last Login",
      value: "Today · 08:42",
    },
  ],
};