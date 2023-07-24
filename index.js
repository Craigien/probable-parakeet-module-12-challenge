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
        });
}

function viewAllDepartments()
{

}

init();