export interface LoginDto {
    email: string;
    password: string;
  }
  
  export interface RegisterDto {
    email: string;
    password: string;
    role: string; // "Librarian" or "Customer"
  }
  
  export interface AuthResponseDto {
    success: boolean;
    message: string;
    token: string;
    userId: string;
    userName: string;
    role: string;
    expiration: string; // ISO date
  }
  
  export interface User {
    id: string;
    name: string;
    role: string;
  }