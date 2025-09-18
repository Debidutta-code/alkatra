// types.ts
import { Dayjs } from "dayjs";

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  type: 'adult' | 'child' | 'infant';
}