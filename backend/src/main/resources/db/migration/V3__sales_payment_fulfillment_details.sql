alter table sales add column if not exists receipt_number varchar(40);
alter table sales add column if not exists payment_status varchar(255) not null default 'UNPAID';
alter table sales add column if not exists payment_method varchar(255);
alter table sales add column if not exists payment_reference varchar(120);
alter table sales add column if not exists amount_paid numeric(12,2) not null default 0;
alter table sales add column if not exists fulfillment_method varchar(255) not null default 'PICKUP';
alter table sales add column if not exists delivery_contact varchar(255);
alter table sales add column if not exists delivery_address varchar(500);
alter table sales add column if not exists delivered_at timestamp with time zone;

create unique index if not exists idx_sales_receipt_number on sales (receipt_number);
