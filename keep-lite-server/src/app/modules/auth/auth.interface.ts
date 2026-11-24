import type { Role } from "../../../generated/prisma/enums";

export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IRequestUser {
  userId: number;
  email: string;
  name: string;
  role: Role;
}
