create or replace function public.admin_exists() returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where role = 'admin') $$;
grant execute on function public.admin_exists() to anon, authenticated;
create or replace function public.block_extra_signups() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from auth.users) then
    raise exception 'Sign-ups are closed';
  end if;
  return new;
end $$;
create trigger before_auth_user_created_single_admin before insert on auth.users for each row execute function public.block_extra_signups();