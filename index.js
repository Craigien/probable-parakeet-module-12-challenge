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
    let params = [];

    const departments = [];

    db.query('SELECT * FROM department', function (err, results) {
        
        for (let i = 0; i < results.length; i++)
        {
            departments.push(results[i].name);
        }

        console.log(departments);
    });

    inquirer
        .prompt([
            {
                type: 'input',
                message: 'Please enter the name of the new role',
                name: 'name',
            },

            {
                type: 'input',
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
            console.log(response);

            let departmentID;

            db.query('SELECT id FROM department WHERE name = ?', response.department, function (err, results) {
                departmentID = results[0].id;

                params = [response.name, response.salary, departmentID];

                console.log(params);
            });
        })
        .then(() => {

            db.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', params, function (err, results) {
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

// Fix SQL syntax error