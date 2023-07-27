INSERT INTO department (name)
VALUES ("Human Resources"),
("Engineering"),
("Finance"),
("Legal"),
("Sales");

INSERT INTO role (title, salary, department_id)
VALUES ("HR Manager", 60000, 1),
("Sales Lead", 100000, 5),
("Salesperson", 80000, 5),
("Lead Engineer", 150000, 2),
("Software Engineer", 120000, 2),
("Account Manager", 160000, 2),
("Accountant", 125000, 3),
("Legal Team Lead", 250000, 4),
("Lawyer", 190000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Alice", "Brown", 1, null),
("John", "Doe", 2, null),
("Mike", "Chan", 3, 2),
("Ashley", "Rodriguez", 4, null),
("Kevin", "Tupik", 5, 4),
("Kunal", "Singh", 6, null),
("Malia", "Brown", 7, 6),
("Sarah", "Lourd", 8, null),
("Tom", "Allen", 9, 8);