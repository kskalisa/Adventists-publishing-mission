alter table notifications add column if not exists user_id bigint references app_users(id);
create index if not exists idx_notifications_user on notifications(user_id);
