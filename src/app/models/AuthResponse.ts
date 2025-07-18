import Company from "./Company";
import User from "./User";

export class AuthResponse {  
  accessToken!: string;
  refreshToken!: string;
  user!: User; 
  socialReason!: string
  company : Company | null = null;
}
