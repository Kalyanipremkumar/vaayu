# Migrations

SQL migrations for the Vaayu Postgres schema live here, named with a sortable
timestamp prefix, e.g. `20260628093000_initial_schema.sql`.

**Status:** intentionally empty. The schema (tables, enums, RLS policies, the
`on_auth_user_created` trigger) is **Phase 1 Step 3** and will be added only
after the foundation scaffold is reviewed and approved — per the build plan, we
stop and review before committing to the schema.

When we build it, each migration will:

- be idempotent where practical;
- create every table with RLS **enabled** and explicit policies;
- wrap every `auth.uid()` as `(SELECT auth.uid())` for performance;
- be applied via the Supabase MCP `apply_migration` tool (or `supabase db push`).
