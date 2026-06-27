/**
 * PLACEHOLDER generated types.
 *
 * This file is replaced wholesale once the schema exists, by running:
 *   supabase gen types typescript --project-id <PROJECT_REF> > src/types.ts
 *
 * Until then it carries a minimal `Database` shape so the client is typed and
 * the app compiles. Do not hand-edit beyond this scaffold — it is generated.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
