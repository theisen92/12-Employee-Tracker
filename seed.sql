
INSERT INTO employee
    (first_name, last_name, role_id, manager_id)
VALUES
    ('Shane', 'Ritter', 3, null),
    ('Milan', 'Odling', 5, null),
    ('Tammy', 'Timms', 6, null),
    ('Tyler', 'Underwood', 7, null),
    ('Amar', 'Woods', 2, 3),
    ('Ralph', 'Dawe', 4, 1),
    ('Grover', 'Conner', 1, 5),
    ('Bruce', 'Conner', 1, 5),
    ('Chanelle', 'Reese', 4, 1),
    ('Josie', 'Adkins', 1, 5);

select *
from employee;

INSERT INTO role
    (title, salary, department_id)
VALUES
    ('Manufacturing Operator', 45000, 1),
    ('Manufacturing Lead', 65000, 1),
    ('Sales Manager', 75000, 2),
    ('Salesman', 50000, 2),
    ('Accountant', 70000, 3),
    ('Engineer', 45000, 4),
    ('HR Specialist', 45000, 5);



INSERT INTO department
    (name)
VALUES
    ("Production"),
    ("Marketing"),
    ("Accounting"),
    ("Research and Development"),
    ("Human Resource");