export type User = {
  id: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
};

export type AuthResponse = {
  user: User;
  token: {
    access_token: string;
    token_type: "bearer";
  };
};

