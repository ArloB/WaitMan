drop table users CASCADE;
drop table restaurant_info CASCADE;
drop table categories CASCADE;
drop table items CASCADE;
drop table addons CASCADE;
drop table ingredients CASCADE;
drop table item_ingredients;
drop table addon_options CASCADE;
drop table tables CASCADE;
drop table item_orders CASCADE;
drop table addon_orders CASCADE;
drop table addon_options_orders CASCADE;
drop table reservations CASCADE;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
drop table coupons CASCADE;
drop table order_coupons CASCADE;

create table users (
  id serial,
  email varchar(40) not null unique,
  password text not null,
  role integer default 1 check (role between 0 and 2),
  iat integer,
  primary key (id)
);

create table restaurant_info (
  name varchar(30) not null
);

insert into restaurant_info(name) VALUES ('Restaurant');

create table categories (
  id serial,
  name varchar(30) not null unique,
  ord int,
  primary key (id)
);

create table items (
  id serial,
  name varchar(30) not null unique,
  img varchar(40) DEFAULT '',
  description text DEFAULT '',
  category integer not null,
  price numeric not null,
  available bool DEFAULT true,
  ord int,
  foreign key (category) references categories(id) on DELETE CASCADE,
  primary key (id)
);

create table addons (
  id serial,
  item integer,
  multiselect bool DEFAULT false,
  title varchar(40) DEFAULT '',
  foreign key (item) references items(id) on DELETE CASCADE,
  primary key (id)
);

create table addon_options (
  addon integer,
  name varchar(30) DEFAULT '',
  price numeric DEFAULT 0,
  foreign key (addon) references addons(id) on DELETE CASCADE,
  primary key (addon, name)
);

create table ingredients (
  id serial,
  name varchar(20) not null unique,
  primary key (id)
);

create table item_ingredients (
  item integer,
  ingredient integer,
  foreign key (item) references items(id) on DELETE CASCADE,
  foreign key (ingredient) references ingredients(id) on DELETE CASCADE,
  primary key (item, ingredient)
);

create table tables (
  number integer,
  primary key (number)
);

create table item_orders (
  id serial,
  table_number integer,
  item integer,
  amount integer,
  order_status varchar(20),
  foreign key (table_number) references tables(number) on DELETE CASCADE,
  foreign key (item) references items(id) on DELETE CASCADE,
  primary key (id)
);

create table addon_orders (
  id serial,
  item integer,
  addon integer, 
  foreign key (item) references item_orders(id) on DELETE CASCADE,
  foreign key (addon) references addons(id) on DELETE CASCADE,
  primary key (id)
);

create table addon_options_orders (
  id serial,
  addon integer,
  addon_option text,
  foreign key (addon) references addon_orders(id) on DELETE CASCADE,
  primary key (id)
);

create table coupons (
  id serial,
  code text unique not null,
  description text not null,
  type integer not null,
  active bool not null,
  one_time bool not null,
  discount numeric,
  minimum numeric,
  item integer,
  foreign key (item) references items(id) on DELETE SET NULL,
  primary key (id)
);

create table reservations (
  id uuid DEFAULT uuid_generate_v4(),
  name varchar(40),
  phone varchar(40),
  no_guests integer,
  date date,
  time time,
  primary key(id)
);

create table order_coupons (
  table_number integer,
  coupon integer,
  foreign key (table_number) references tables(number) on DELETE CASCADE,
  foreign key (coupon) references coupons(id) on DELETE CASCADE,
  primary key (table_number, coupon)
);
