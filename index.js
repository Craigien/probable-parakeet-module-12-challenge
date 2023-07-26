// Import required libraries
const inquirer = require('inquirer');
const mysql = require('mysql2');

// Create SQL database connection
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'FunWithSQL$?',
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

    db.query('SELECT * FROM department', function (err, results) {
        
        for (let i = 0; i < results.length; i++)
        {
            departments.push(results[i].name);
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
                choices: departments,
                name: 'department',
            },
        ])
        .then((response) => {
            // console.log(response);

            let departmentID;

            db.query('SELECT id FROM department WHERE name = ?', response.department, function (err, results) {
                if (err)
                {
                    console.log(err);
                }

                departmentID = results[0].id;

                const params = [response.title, response.salary, departmentID];

                console.log("Params: " + params);

                db.query('INSERT INTO `role` (title, salary, department_id) VALUES (?, ?, ?)', params, function (err, results) {
                    if (err)
                    {
                        console.log(err);
                    }
    
                    console.log(results);
                });
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

            for (let i = 0; i < roleNames.length; i++)
            {
                if (roleNames[i] === roles[i].roleName)
                {
                    roleID = roles[i].id;

                    break;
                }
            }

            for (let i = 0; i < managersFullNames.length; i++)
            {
                if (managersFullNames[i] === managers[i].fullName)
                {
                    managerID = managers[i].id;

                    break;
                }
            }

            if (response.manager === "None")
            {
                params = [response.firstName, response.lastName, roleID, managerID];
            }

            else
            {
                params = [response.firstName, response.lastName, roleID, null];
            }

            console.log("Role ID: " + roleID);
            console.log("Manager ID: " + managerID);

            db.query('INSERT INTO `employee` (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', params, function (err, results) {
                if (err)
                {
                    console.log(err);
                }

                console.log(results);
            });
        });
}

init();

// To Do