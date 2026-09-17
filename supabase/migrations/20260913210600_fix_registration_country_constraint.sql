alter table public.registrations drop constraint if exists registrations_country_check;
alter table public.registrations add constraint registrations_country_check check (char_length(btrim(country)) between 2 and 100);;
