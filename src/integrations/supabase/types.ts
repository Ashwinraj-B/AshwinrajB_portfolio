export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      certifications: {
        Row: {
          created_at: string;
          file_path: string;
          file_size: number;
          file_type: string;
          id: string;
          issuer: string;
          name: string;
          sort_order: number;
          updated_at: string;
          url: string;
          year: string;
        };
        Insert: {
          created_at?: string;
          file_path?: string;
          file_size?: number;
          file_type?: string;
          id?: string;
          issuer?: string;
          name: string;
          sort_order?: number;
          updated_at?: string;
          url?: string;
          year?: string;
        };
        Update: {
          created_at?: string;
          file_path?: string;
          file_size?: number;
          file_type?: string;
          id?: string;
          issuer?: string;
          name?: string;
          sort_order?: number;
          updated_at?: string;
          url?: string;
          year?: string;
        };
        Relationships: [];
      };
      experiences: {
        Row: {
          company: string;
          created_at: string;
          description: string;
          id: string;
          period: string;
          role: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          company: string;
          created_at?: string;
          description?: string;
          id?: string;
          period?: string;
          role: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          company?: string;
          created_at?: string;
          description?: string;
          id?: string;
          period?: string;
          role?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          created_at: string;
          demo_url: string;
          featured: boolean;
          id: string;
          image_path: string;
          repo_url: string;
          sort_order: number;
          summary: string;
          tech: string[];
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          demo_url?: string;
          featured?: boolean;
          id?: string;
          image_path?: string;
          repo_url?: string;
          sort_order?: number;
          summary?: string;
          tech?: string[];
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          demo_url?: string;
          featured?: boolean;
          id?: string;
          image_path?: string;
          repo_url?: string;
          sort_order?: number;
          summary?: string;
          tech?: string[];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          about: string;
          avatar_path: string;
          email: string;
          full_name: string;
          github_url: string;
          headline: string;
          id: boolean;
          linkedin_url: string;
          location: string;
          resume_url: string;
          tagline: string;
          updated_at: string;
        };
        Insert: {
          about?: string;
          avatar_path?: string;
          email?: string;
          full_name?: string;
          github_url?: string;
          headline?: string;
          id?: boolean;
          linkedin_url?: string;
          location?: string;
          resume_url?: string;
          tagline?: string;
          updated_at?: string;
        };
        Update: {
          about?: string;
          avatar_path?: string;
          email?: string;
          full_name?: string;
          github_url?: string;
          headline?: string;
          id?: boolean;
          linkedin_url?: string;
          location?: string;
          resume_url?: string;
          tagline?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      skills: {
        Row: {
          category: string;
          created_at: string;
          id: string;
          name: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          id?: string;
          name: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          id?: string;
          name?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
    Row: infer R;
  }
  ? R
  : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I;
  }
  ? I
  : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U;
  }
  ? U
  : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const;