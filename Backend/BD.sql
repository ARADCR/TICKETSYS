CREATE DATABASE TICKETS
create table users(
    id int primary key identity(1,1),
    name varchar(255) not null,
    email varchar(255) not null unique,
    password varchar(255) not null
)