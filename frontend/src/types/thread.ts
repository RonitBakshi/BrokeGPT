export interface Thread {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateThreadResponse {
  id: string;
  title: string;
}
