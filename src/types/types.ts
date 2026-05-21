export const role = ["contributor", "maintainer"] as const;

type Role = (typeof role)[number];

export type User = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  created_at: Date;
  updated_at: Date;
};

export type RUser = Omit<User, "passwordHash">;

export type Issues = {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
};
