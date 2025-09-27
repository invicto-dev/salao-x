export {};

declare global {
  interface LoginRequest {
    email: string;
    senha: string;
  }

  interface LoginResponse {
    user: User;
    token: string;
  }
}
