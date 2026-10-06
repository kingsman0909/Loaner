create database loaner;

use loaner;


create table Loaner(
	id int auto_increment primary key,
    username varchar(30) not null,
    password varchar(20) not null,
    firstname varchar(20) not null,
    lastname varchar(20) not null,
    age int not null,
    source_of_income varchar(50) not null,
    province varchar(20) not null,
    city varchar(20) not null,
    brgy varchar(20) not null,
    subd varchar(20) not null,
    contact varchar(20) not null,
    role enum('admin'),
    
    unique(
		username, firstname, lastname
    )
);


create table Member(
	id int auto_increment primary key,
    loaner_id int,
    firstname varchar(20) not null,
    lastname varchar(20) not null,
    age int not null,
    source_of_income varchar(50) not null,
    province varchar(20) not null,
    city varchar(20) not null,
    brgy varchar(20) not null,
    subd varchar(20) not null,
    contact varchar(20) not null,
    status enum('pending', 'approved'),
    
    unique(
		firstname, lastname
    ),
    
    foreign key (loaner_id) references Loaner(id) on delete cascade
);

create table capital(
	id int auto_increment primary key,
    loaner_id int,
    amount int,
    source enum('capitalAdd', 'loanRelease', 'PaymentCollection') not null,
    added_at date,
    
    foreign key (loaner_id) references Loaner(id) on delete cascade
);

create table loan_type(
	id int auto_increment primary key,
    type varchar(20) not null,
    interest int not null
);


create table loans(
	id int auto_increment primary key,
    member_id int,
    loaner_id int,
    loan_type_id int,
    principalAmount int not null,
    interest int not null,
    totalDue int not null,
    releaseDate date,
    due_date date,
    status enum('active', 'overdue', 'paid', 'closed') default('active'),
    
    foreign key (loaner_id) references Loaner(id) on delete cascade,
    foreign key (member_id) references Member(id) on delete cascade,
    foreign key (loan_type_id) references loan_type(id) on delete cascade
);


create table blacklist(
	id int auto_increment primary key,
    member_id int,
    reason varchar(100),
    
    foreign key (member_id) references Member(id) on delete cascade
);

create table payments(
	id int auto_increment primary key,
    loan_id int,
    amount_paid int not null,
    payment_date date not null,
    collected_by_id int not null,
    method varchar(20),
    
    foreign key (collected_by_id) references Loaner(id) on delete cascade,
    foreign key (loan_id) references loans(id) on delete cascade
);

show tables;

insert into Loaner(username, password, firstname, lastname, age, source_of_income, province, city, brgy, subd, contact, role)
values("jaxpjax", "ken_09096068957", "cyrus ken", "orilleneda", 22, "Work", "Laguna", "Cabuyao", "banay banay", "lakeside",
		"09096068957", "admin");
        
insert into Member(firstname, lastname, age, source_of_income, province, city, brgy, subd, contact, status)
values("cyrus ken", "orilleneda", 22, "Work", "Laguna", "Cabuyao", "banay banay", "lakeside",
		"09096068957", "approved");
        

alter table Member
add column
activeLoan int default 0;

use loaner;
show tables;

select * from loan_type;
describe loans;

select * from Member where activeLoan > 0;

select m.firstname, l.principalAmount
from Member m
RIGHT JOIN loans l ON m.id = l.member_id
where l.principalAmount > 0;

delete from loans
where member_id = (select id from Member where activeLoan > 3 and id = loans.member_id);


select member_id, m.* from loans l
LEFT JOIN Member m ON member_id = m.id
group by member_id;


update Member m
LEFT JOIN (
	select member_id, count(*) as loan from loans
    group by member_id
) l ON m.id = l.member_id
set activeLoan = ifnull(l.loan, 0)