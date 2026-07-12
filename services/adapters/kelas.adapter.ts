import type {
  ClassDetailContract,
  ClassListItemContract,
  ClassStudentContract,
  CreateClassResponseContract,
} from "@/lib/contracts/kelas";
import type { ClassStudent, KelasClass } from "@/types";

export function adaptClassListItem(contract: ClassListItemContract): KelasClass {
  return {
    id: contract.id,
    name: contract.name,
    classCode: contract.class_code,
    studentCount: contract.student_count,
    createdAt: contract.created_at,
  };
}

export function adaptClassDetail(contract: ClassDetailContract): KelasClass {
  return adaptClassListItem(contract);
}

export function adaptCreatedClass(
  contract: CreateClassResponseContract
): Omit<KelasClass, "studentCount"> {
  return {
    id: contract.id,
    name: contract.name,
    classCode: contract.class_code,
    createdAt: contract.created_at,
  };
}

export function adaptClassStudent(contract: ClassStudentContract): ClassStudent {
  return {
    id: contract.id,
    name: contract.name,
    nis: contract.nis,
    isClaimed: contract.is_claimed,
    joinedAt: contract.joined_at,
  };
}
