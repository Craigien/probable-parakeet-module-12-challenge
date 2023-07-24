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

init();