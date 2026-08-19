export interface GuruListItemContract {
  id: number;
  name: string;
  email: string;
  school_id: number;
  is_active: boolean;
}

export interface GuruListResponseContract {
  data: GuruListItemContract[];
}

export interface GuruAnalyticsContract {
  guru_id: number;
  guru_name: string;
  school_name: string | null;
  class_count: number;
  student_count: number;
}

export interface GuruAnalyticsResponseContract {
  data: GuruAnalyticsContract[];
}
