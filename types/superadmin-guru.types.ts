export interface GuruWithStats {
  id: number;
  name: string;
  email: string;
  schoolId: number;
  schoolName: string | null;
  classCount: number;
  studentCount: number;
  isActive: boolean;
}
