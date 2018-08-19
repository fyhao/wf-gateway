drop table if exists app;
create table app (
  name varchar(100) not null,
  description varchar(300)
);

drop table if exists flow;
create table flow (
  app varchar(100) not null,
  name varchar(100) not null,
  content varchar(1000)
);

drop table if exists listener;
create table listener (
  id int not null primary key auto_increment,
  app varchar(100) not null,
  type varchar(20) not null,
  endpoint varchar(100),
  flow varchar(100) not null
);

drop table if exists listenerRequest;
create table listenerRequest (
  id int,
  name varchar(100) not null,
  conditions varchar(10) not null,
  type varchar(10) not null,
  defaultValue varchar(100),
  description varchar(100)
);

drop table if exists listenerHeader;
create table listenerHeader (
  id int,
  name varchar(100) not null,
  conditions varchar(10) not null,
  type varchar(10) not null,
  defaultValue varchar(100),
  description varchar(100)
);

drop table if exists instance;
create table instance (
  id int not null primary key auto_increment,
  name varchar(100) not null,
  description varchar(300),
  host varchar(50)
);