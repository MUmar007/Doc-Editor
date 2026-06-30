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
  my_permission: 'owner' | 'edit' | 'view';
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

export interface DocumentVersion {
  id: string;
  document_id: string;
  title: string;
  content: TiptapContent;
  created_by: string;
  created_at: string;
  author: User;
}

export interface Comment {
  id: string;
  document_id: string;
  author_id: string;
  body: string;
  resolved: boolean;
  created_at: string;
  updated_at: string;
  author: User;
}

export interface PresenceUser {
  user_id: string;
  display_name: string;
  color: string;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}
