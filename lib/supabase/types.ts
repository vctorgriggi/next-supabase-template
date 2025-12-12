export interface Profile {
  full_name: string;
  username: string;
  website: string | null;
  avatar_url: string | null;
}

export interface ProfileUpdate {
  full_name?: string;
  username?: string;
  website?: string | null;
  avatar_url?: string | null;
}
