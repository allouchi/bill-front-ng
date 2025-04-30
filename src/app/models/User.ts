import Role from "./Role";
import Company from "./Company";

export default interface User {
  userName?: string;
  firstName?: string;
  lastName?: string;
  password: string;
  company?: Partial<Company>;
  roles?: Role[];
}
