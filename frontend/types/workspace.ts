export type Workspace = {
  id: string;
  owner_id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  status: string;
  extra_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

