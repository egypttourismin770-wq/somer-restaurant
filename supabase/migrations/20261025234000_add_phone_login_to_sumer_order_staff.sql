alter table public.order_staff_users
  add column if not exists phone text;

create unique index if not exists order_staff_users_phone_unique
  on public.order_staff_users (phone)
  where phone is not null;
