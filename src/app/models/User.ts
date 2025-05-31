import Role from "./Role";
import Company from "./Company";

export default interface User {
  id: number | null;
  email?: string;
  firstName?: string;
  lastName?: string;
  password: string;
  siret?: string;
  roles?: Role[];
  activated: boolean;
}
