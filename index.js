// Import required libraries
const inquirer = require('inquirer');
const mysql = require('mysql2');
require('dotenv').config();

// Create SQL database connection
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
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
        // Call a different function depending on which option the user selects
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

// Queries database to return all departments
function viewAllDepartments()
{
    db.query('SELECT * FROM department', function (err, results) {
        if (err) throw err;

        console.table(results);

        init();
    });
}

// Queries database to return all roles with associated departments
function viewAllRoles()
{
    db.query('SELECT role.title, role.id, department.name, role.salary AS department FROM role JOIN department ON role.department_id = department.id ORDER BY role.id', function (err, results) {
        if (err) throw err;
        
        console.table(results);

        init();
    });
}

// Queries database to return all employees with associated roles and managers
function viewAllEmployees()
{
    db.query(`SELECT emp.id, emp.first_name, emp.last_name, role.title, department.name AS department, role.salary, CONCAT_WS(' ', manager.first_name, manager.last_name) AS manager
    FROM employee emp LEFT JOIN employee manager ON emp.id = manager.manager_id JOIN role ON emp.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY emp.id`, function (err, results) {
        if (err) throw err;

        console.table(results);

        init();
    });
}

// Add a new department to the departments table
function addDepartment()
{
    // Asks user to input new department name
    inquirer
        .prompt([
            {
                type: 'input',
                message: 'Please enter a name for the new department',
                name: 'newDepartment',
            },
        ])
        .then((response) => {

            // Inserts new department using user provided department name
            db.query('INSERT INTO department (name) VALUES (?)', response.newDepartment, (err, results) => {
                if (err)
                {
                    console.error(err);
                }
                console.log("Added new department " + response.newDepartment);

                init();
            })
        });
}

// Add a new role to the role table
function addRole()
{
    const departments = [];
    const departmentNames = [];

    // Query to get all department information to get department names and IDs
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
    });

    // Ask user to input role title, salary, and select a department that the role will be a part of
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

            // Get associated department ID based on the department the user selected
            let departmentID;

            for (let i = 0; i < departments.length; i++)
            {
                if (response.department === departments[i].departmentName)
                {
                    departmentID = departments[i].id;

                    break;
                }
            }

            const params = [response.title, response.salary, departmentID];

            // Insert response values into role table
            db.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', params, function (err, results) {
                if (err)
                {
                    console.log(err);
                }
    
                console.log("New role " + response.title + " added");

                init();
            });
        });
}

// Add a new employee to the employee table
function addEmployee()
{
    const roleNames = [];
    const roles = [];

    const managersFullNames = [];
    const managers = [];

    // Query to get all role information to get the role titles and IDs
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
    });

    // Query to get all employee information to get empoloyee names and IDs
    // This is so that any employee can be selected as a manager
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
    });

    // Ask user to input new employee's first name, last name, select a role, and select a manager
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

            let roleID;
            let managerID;
            let params;

            // Get role ID from selected role
            for (let i = 0; i < roles.length; i++)
            {
                if (response.role === roles[i].roleName)
                {
                    roleID = roles[i].id;

                    break;
                }
            }

            // Get employee ID from selected manager
            for (let i = 0; i < managers.length; i++)
            {
                if (response.manager === managers[i].fullName)
                {
                    managerID = managers[i].id;

                    break;
                }
            }

            // If user selected to have no manager, send null in query
            if (response.manager === "None")
            {
                params = [response.firstName, response.lastName, roleID, null];
            }

            // If user selected a manager name, send in manager ID
            else
            {
                params = [response.firstName, response.lastName, roleID, managerID];
            }

            // Insert response values into employee table
            db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', params, function (err, results) {
                if (err)
                {
                    console.log(err);
                }

                console.log("New employee " + response.firstName + " " + response.lastName + " added");

                init();
            });
        });
}

// Update existing employee's role
function updateEmployeeRole()
{
    const roleNames = [];
    const roles = [];

    const employeesFullNames = [];
    const employees = [];

    // Query to get all role information to get the role titles and IDs
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
    });

    // Query to get all employee information to get empoloyee names and IDs
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

        // Ask user to choose employee and role
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

            let roleID;
            let employeeID;

            // Get role ID from selected role
            for (let i = 0; i < roles.length; i++)
            {
                if (response.role == roles[i].roleName)
                {
                    roleID = roles[i].id;

                    break;
                }
            }

            // Get employee ID from selected employee
            for (let i = 0; i < employees.length; i++)
            {
                if (response.employee == employees[i].fullName)
                {
                    employeeID = employees[i].id;

                    break;
                }
            }

            const params = [roleID, employeeID];

            // Update employee's role in employee table
            db.query('UPDATE employee SET role_id = ? WHERE id = ?', params, function (err, results) {
                if (err)
                {
                    console.log(err);
                }

                console.log(response.employee + " updated to " + response.role);

                init();
            });
        });
    });
}

init();