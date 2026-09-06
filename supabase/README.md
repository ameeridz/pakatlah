# Supabase migrations

These migrations document the Pakatlah production database in creation order.

## Important

- The production database already contains these changes.
- Do not paste the full migration set into the existing production project.
- Use the files to reproduce a fresh environment or as the baseline for future Supabase CLI workflows.
- New database changes should be added as a new timestamped migration. Do not edit an already-applied production migration.

## Current public RPC surface

- `create_decision`
- `get_public_decision`
- `submit_participant_response`
- `get_manage_dashboard`
- `close_decision_responses`
- `finalize_decision`
- `get_participant_results`

Direct `anon` and `authenticated` table privileges are revoked. RLS is enabled on the four application tables. The internal `set_updated_at` trigger function is not executable by browser roles.
