export interface User {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface DocumentListItem {
  id: string;
  title: string;
  owner_id: string;
  owner: User;
  created_at: string;
  updated_at: string;
  is_owned: boolean;
  shared_by: User | null;
}

export interface Document extends DocumentListItem {
  content: TiptapContent;
}

export type TiptapContent = Record<string, unknown>;

export interface DocumentsListResponse {
  owned: DocumentListItem[];
  shared: DocumentListItem[];
}

export interface Share {
  id: string;
  document_id: string;
  shared_with: string;
  user: User;
  permission: 'view' | 'edit';
  created_at: string;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}
