import { Session } from "next-auth";

export type UserSession = {
  expires?: string;
  user?: Session["user"] & { id?: string };
} | null;

export interface SitesListResponse {
  data: {
    ref: Ref;
    ts: number;
    data: {
      name: string;
      allowed_origins: string[];
    };
  }[];
}
interface Ref {
  "@ref": {
    id: string;
  };
}
