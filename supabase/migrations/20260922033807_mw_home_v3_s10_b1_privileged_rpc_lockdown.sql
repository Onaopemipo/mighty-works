-- MW-HOME-V3-S10-B1 — Supabase Privileged RPC Lockdown
-- Live database ACL correction was applied and independently verified before this migration was recorded.
-- Function bodies, SECURITY DEFINER authority, search_path, tables and RLS remain unchanged.

revoke execute on function public.process_registration_checkin_scan_partial(uuid, integer, text, integer, uuid) from public, anon, authenticated;
grant execute on function public.process_registration_checkin_scan_partial(uuid, integer, text, integer, uuid) to service_role;

revoke execute on function public.set_registration_attendance_admin_partial(uuid, text, text, integer, uuid) from public, anon, authenticated;
grant execute on function public.set_registration_attendance_admin_partial(uuid, text, text, integer, uuid) to service_role;
