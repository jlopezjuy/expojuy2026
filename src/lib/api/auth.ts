import { apiRequest } from './client';

/** JHipster's UserDTO (GET /api/account), fields confirmed against the backend. */
export interface UserDTO {
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  activated: boolean;
  langKey: string;
  authorities: string[];
  imageUrl?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  id_token: string;
}

export function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/authenticate', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function getAccount(token: string): Promise<UserDTO> {
  return apiRequest<UserDTO>('/api/account', { token });
}
