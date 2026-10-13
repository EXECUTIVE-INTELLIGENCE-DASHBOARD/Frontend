
import { apiClient } from "./api";

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

interface CurrentUserResponse {
  authenticated: boolean;
  user?: {
    id: number;
    email: string;
    name: string;
    first_name: string;
    last_name: string;
  };
}

function getInitials(name: string, email: string): string {
  const nameInitials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  if (nameInitials) {
    return nameInitials;
  }

  return email.trim().charAt(0).toUpperCase() || "U";
}

export async function getCurrentUserProfile(): Promise<UserProfile> {
  const response =
    await apiClient.get<CurrentUserResponse>("/auth/me/");

  if (!response.data.authenticated || !response.data.user) {
    throw new Error("No authenticated EID user was returned.");
  }

  const user = response.data.user;
  const email = user.email || "";
  const name = user.name?.trim() || email || "GreenHill User";

  return {
    name,
    role: "Role not provided",
    email,
    initials: getInitials(name, email),
    fields: [
      {
        id: "email",
        label: "Email",
        value: email || "Not available",
      },
    ],
  };
}


export function startGreenHillSignIn(): void {
  const apiBaseUrl = apiClient.defaults.baseURL?.replace(/\/+$/, "");

  if (!apiBaseUrl) {
    throw new Error("The EID API URL is not configured.");
  }

  window.location.assign(`${apiBaseUrl}/auth/login/`);
}