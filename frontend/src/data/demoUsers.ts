import type { RoleArea, Screen } from "../types/navigation";

export type DemoUser = {
  name: string;
  email: string;
  password: string;
  role: RoleArea;
  dashboard: Screen;
};

export const demoUsers: DemoUser[] = [
  {
    name: "Moise Arihafi",
    email: "admin@adventist.rw",
    password: "admin123",
    role: "admin",
    dashboard: "dashboard",
  },
  {
    name: "Jean-Claude N.",
    email: "sales@adventist.rw",
    password: "sales123",
    role: "sales",
    dashboard: "sales-dashboard",
  },
  {
    name: "Sarah Uwase",
    email: "inventory@adventist.rw",
    password: "inventory123",
    role: "inventory-manager",
    dashboard: "inventory-manager",
  },
  {
    name: "Eric Manzi",
    email: "coordinator@adventist.rw",
    password: "coordinator123",
    role: "coordinator",
    dashboard: "coordinator",
  },
  // customer demo user removed
];

export function findDemoUser(email: string, password: string) {
  return demoUsers.find(
    (user) =>
      user.email.toLowerCase() === email.trim().toLowerCase() &&
      user.password === password,
  );
}
