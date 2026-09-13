export type Database = {
  public: {
    Tables: {
      conference_stats: {
        Row: {
          id: number;
          total_registrations: number;
          total_attendees: number;
          countries_represented: number;
          churches_represented: number;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      country_registration_stats: {
        Row: {
          country: string;
          country_code: string | null;
          registration_count: number;
          attendee_count: number;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
