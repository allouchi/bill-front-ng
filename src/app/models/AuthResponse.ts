import Company from "./Company";
import User from "./User";

export class AuthResponse {  
  token!: string;
  user!: User; 
  socialReason!: string
  company : Company | null = null;
}
