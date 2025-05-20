export type Comment = {
  id: string;
  hostname: string;
  pathname: string;
  body: string;
  author_name: string | null;
  created_at: number;
};
