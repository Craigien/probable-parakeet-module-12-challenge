// Import required libraries
const inquirer = require('inquirer');
const mysql = require('mysql2');

// Create SQL database connection
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'human_resources_db',
    }
);

// Present user with initial list of options
function init()
{
    inquirer
        .prompt([
            {
                type: 'list',
                message: 'What would you like to do?',
                choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role'],
                name: 'userChoice',
            }
        ])
        .then((response) => {
            console.log(response);

            if (response.userChoice === "View all departments")
            {
                viewAllDepartments();
            }

            else if (response.userChoice === "View all roles")
            {
                viewAllRoles();
            }

            else if (response.userChoice === "View all employees")
            {
                viewAllEmployees();
            }

            else if (response.userChoice === "Add a department")
            {
                addDepartment();
            }

            else if (response.userChoice === "Add a role")
            {
                addRole();
            }

            else if (response.userChoice === "Add an employee")
            {
                addEmployee();
            }

            else if (response.userChoice === "Update an employee role")
            {
                updateEmployeeRole();
            }
        });
}

function viewAllDepartments()
{
    db.query('SELECT * FROM department', function (err, results) {
        console.table(results);
    });

    // init();
}

function viewAllRoles()
{
    db.query('SELECT * FROM role', function (err, results) {
        console.table(results);
    });

    // init();
}

function viewAllEmployees()
{
    db.query('SELECT * FROM employee', function (err, results) {
        console.table(results);
    });

    // init();
}

function addDepartment()
{
    inquirer
        .prompt([
            {
                type: 'input',
                message: 'Please enter a name for the new department',
                name: 'newDepartment',
            },
        ])
        .then((response) => {
            console.log(response);

            db.query('INSERT INTO department (name) VALUES (?)', response.newDepartment, (err, results) => {
                if (err)
                {
                    console.error(err);
                }
                console.log(results);
            })
        });

    // init();
}

function addRole()
{
    const departments = [];
    const departmentNames = [];

    db.query('SELECT * FROM department', function (err, results) {
        
        for (let i = 0; i < results.length; i++)
        {
            departmentNames.push(results[i].name);

            const departmentInfo = {
                departmentName: results[i].name,
                id: results[i].id
            };

            departments.push(departmentInfo);
        }

        // console.log(departments);
    });

    inquirer
        .prompt([
            {
                type: 'input',
                message: 'Please enter the title of the new role',
                name: 'title',
            },

            {
                type: 'number',
                message: 'Please enter the salary for the new role',
                name: 'salary',
            },

            {
                type: 'list',
                message: 'Please select the department the role will be a part of',
                choices: departmentNames,
                name: 'department',
            },
        ])
        .then((response) => {
            // console.log(response);

            let departmentID;

            for (let i = 0; i < departments.length; i++)
            {
                if (response.department === departments[i].name)
                {
                    departmentID = departments[i].id;

                    break;
                }
            }

            const params = [response.title, response.salary, departmentID];

            console.log("Params: " + params);

            db.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', params, function (err, results) {
                if (err)
                {
                    console.log(err);
                }
    
                console.log(results);
            });
        });
}

function addEmployee()
{
    const roleNames = [];
    const roles = [];

    const managersFullNames = [];
    const managers = [];

    db.query('SELECT * FROM role', function (err, results) {

        if (err) throw err;
        
        for (let i = 0; i < results.length; i++)
        {
            roleNames.push(results[i].title);

            const roleInfo = {
                roleName: results[i].title,
                id: results[i].id
            };

            roles.push(roleInfo);
        }

        console.log(roleNames);
        console.log(roles);
    });

    db.query('SELECT * FROM employee', function (err, results) {

        if (err) throw err;
        
        for (let i = 0; i < results.length; i++)
        {
            const fullName = results[i].first_name + " " + results[i].last_name;

            managersFullNames.push(fullName);

            const managerInfo = {
                fullName: fullName,
                id: results[i].id
            };

            managers.push(managerInfo);
        }

        managersFullNames.push("None");

        console.log(managersFullNames);
        console.log(managers);
    });

    inquirer
        .prompt([
            {
                type: 'input',
                message: "Please enter the employee's first name",
                name: 'firstName',
            },

            {
                type: 'input',
                message: "Please enter the employee's last name",
                name: 'lastName',
            },

            {
                type: 'list',
                message: "Please select the employee's role",
                choices: roleNames,
                name: 'role',
            },

            {
                type: 'list',
                message: "Please select the employee's manager",
                choices: managersFullNames,
                name: 'manager',
            },
        ])
        .then((response) => {
            console.log(response);

            let roleID;
            let managerID;
            let params;

            for (let i = 0; i < roles.length; i++)
            {
                if (response.role === roles[i].roleName)
                {
                    roleID = roles[i].id;

                    break;
                }
            }

            for (let i = 0; i < managers.length; i++)
            {
                if (response.manager === managers[i].fullName)
                {
                    managerID = managers[i].id;

                    break;
                }
            }

            if (response.manager === "None")
            {
                params = [response.firstName, response.lastName, roleID, null];
            }

            else
            {
                params = [response.firstName, response.lastName, roleID, managerID];
            }

            console.log("Role ID: " + roleID);
            console.log("Manager ID: " + managerID);

            db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', params, function (err, results) {
                if (err)
                {
                    console.log(err);
                }

                console.log(results);
            });
        });
}

function updateEmployeeRole()
{
    const roleNames = [];
    const roles = [];

    const employeesFullNames = [];
    const employees = [];

    db.query('SELECT * FROM role', function (err, results) {

        if (err) throw err;
        
        for (let i = 0; i < results.length; i++)
        {
            roleNames.push(results[i].title);

            const roleInfo = {
                roleName: results[i].title,
                id: results[i].id
            };

            roles.push(roleInfo);
        }

        console.log(roleNames);
        console.log(roles);
    });

    db.query('SELECT * FROM employee', function (err, results) {

        if (err) throw err;
        
        for (let i = 0; i < results.length; i++)
        {
            const fullName = results[i].first_name + " " + results[i].last_name;

            employeesFullNames.push(fullName);

            const employeeInfo = {
                fullName: fullName,
                id: results[i].id
            };

            employees.push(employeeInfo);
        }

        console.log(employeesFullNames);
        console.log(employees);

        inquirer
        .prompt([
            {
                type: 'list',
                message: "Please select the employee who will receive the new role",
                choices: employeesFullNames,
                name: 'employee',
            },

            {
                type: 'list',
                message: "Please select the employee's new role",
                choices: roleNames,
                name: 'role',
            },
        ])
        .then((response) => {
            console.log(response);

            let roleID;
            let employeeID;

            for (let i = 0; i < roles.length; i++)
            {
                if (response.role == roles[i].roleName)
                {
                    roleID = roles[i].id;

                    break;
                }
            }

            for (let i = 0; i < employees.length; i++)
            {
                if (response.employee == employees[i].fullName)
                {
                    employeeID = employees[i].id;

                    break;
                }
            }

            console.log("Role ID: " + roleID);
            console.log("Employee ID: " + employeeID);

            const params = [roleID, employeeID];

            db.query('UPDATE employee SET role_id = ? WHERE id = ?', params, function (err, results) {
                if (err)
                {
                    console.log(err);
                }

                console.log(results);
            });
        });
    });
}

init();

// To Do