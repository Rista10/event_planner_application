export interface SignupRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface AuthResponseData {
  user: {
    id: string;
    name: string;
    email: string;
  };
  accessToken: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}
