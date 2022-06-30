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

export interface Comment1Response {
  count: number;
  comments: CommentsResponse;
}

export interface CommentsResponse {
  data: CommentType[];
}

export interface CommentType {
  current_user_reaction: number;
  reactions: { count: number; value: number }[];
  reply_count: number;
  data: {
    text: string;
    slug: string;
  };
  ts: number;
  ref: Ref;
  user: User;
}

interface User {
  "@ref": {
    id: string;
  };
  ts: number;
  data: {
    username: string;
    email: string;
    photo_url: string;
  };
}
