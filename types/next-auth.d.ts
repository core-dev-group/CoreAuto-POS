import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    branchId: string | null;
  }

  interface Session {
    user: User & {
      id: string;
      role: string;
      branchId: string | null;
    };
  }
}
