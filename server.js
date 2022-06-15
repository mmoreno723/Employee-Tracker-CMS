const inquirer = require("inquirer");
const express = require("express");
const mysql = require("mysql2");
const cTable = require("console.table");
const res = require("express/lib/response");
require("dotenv").config();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
  {
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  console.log("Connected to workspace_db database")
);
function start() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "list",
        message: "What would you like to do?",
        choices: [
          "View ALL Employees",
          "View ALL Employees By Department",
          "View ALL Departments",
          "View ALL Roles",
          "Add Employee",
          "Add Role",
          "Remove Employee",
          "Add Department",
          "Update Employee Role",
          "Quit",
        ],
      },
    ])
    .then((userInput) => {
      switch (userInput.list) {
        case "View ALL Employees":
          viewAllEmployees();
          break;
        case "View ALL Employees By Department":
          viewAllEmployeesByDept();
          break;
        case "View ALL Departments":
          viewAllDepartments();
          break;
        case "View ALL Roles":
          viewRoles();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Add Role":
          addRole();
          break;
        case "Remove Employee":
          deleteEmployee();
          break;
        case "Update Employee Role":
          start();
          break;
        default:
          start();
      }
    });
}
function viewAllEmployees() {
  let sql = `SELECT employee.id, employee.first_name, employee.last_name, roles.title, departments.department_name, roles.salary, CONCAT(manager.first_name , ' ' , manager.last_name) as "manager" FROM departments JOIN roles ON departments.id = roles.department_id JOIN employee ON roles.id = employee.role_id LEFT JOIN employee manager ON employee.manager_id = manager.id ORDER BY employee.id ASC;`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.table(result);
    start();
  });
}

function viewAllEmployeesByDept() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "department",
        message: "Which department would you like to see?",
        choices: ["Sales", "Engineering", "Finance", "Legal"],
      },
    ])
    .then((userInput) => {
      let depId;
      switch (userInput.department) {
        case "Sales":
          depId = 1;
          break;
        case "Engineering":
          depId = 2;
          break;
        case "Finance":
          depId = 3;
          break;
        case "Legal":
          depId = 4;
          break;
      }
      let sql = `SELECT employee.id, employee.first_name, employee.last_name, roles.title FROM roles JOIN employee ON roles.id = employee.role_id && roles.department_id =?;`;
      db.query(sql, depId, (err, result) => {
        if (err) {
          console.log(err);
        }
        console.table(result);
        start();
      });
    });
}

function viewAllDepartments() {
  let sql = `SELECT * FROM departments;`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.table(result);
    start();
  });
}

function viewRoles() {
  let sql = `SELECT * FROM roles;`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.table(result);
    start();
  });
}

function addEmployee() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the employee's first name?",
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the employee's last name?",
      },
      {
        type: "list",
        name: "roleId",
        message: "What is the employee's role?",
        choices: ["1", "2", "3", "4"],
      },
    ])
    .then((userInput) => {
      userFirst = userInput.first_name;
      userLast = userInput.last_name;
      userRole = userInput.roleId;

      let sql = `INSERT INTO employee (first_name, last_name, role_id) VALUES ("${this.userFirst}", "${this.userLast}", "${this.userRole}");`;
      db.query(sql, (err, result) => {
        if (err) {
          console.log(err);
        }
        console.table(result);
        start();
      });
    });
}

function deleteEmployee() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "What is the employee's id?",
        choices: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      },
    ])
    .then((userInput) => {
      userEmployeeId = userInput.employeeId;

      let sql = `DELETE FROM employee WHERE id = ${this.userEmployeeId};`;
      db.query(sql, (err, result) => {
        if (err) {
          console.log(err);
        }
        console.table(result);
        start();
      });
    });
}

function addRole() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "title",
        message: "What is the name of the role?",
      },
      {
        type: "list",
        name: "department",
        message: "Which department does it belong to?",
        choices: ["1", "2", "3", "4"],
      },
      {
        type: "number",
        name: "salary",
        message: "What is the salary of the role?",
      },
    ])
    .then((userInput) => {
      userRoleTitle = userInput.title;
      userRoleDepartment = userInput.department;
      userRoleSalary = userInput.salary;

      let sql = `INSERT INTO roles (title, department_id, salary) VALUES ("${this.userRoleTitle}", "${this.userRoleDepartment}", "${this.userRoleSalary}");`;
      db.query(sql, (err, result) => {
        if (err) {
          console.log(err);
        }
        console.table(result);
        start();
      });
    });
}
start();
// gets all of the departments
app.get("/api/department", (req, res) => {
  db.query("SELECT * FROM departments", (err, result) => {
    res.json(result);
  });
});

// gets all of the roles
app.get("/api/roles", (req, res) => {
  db.query("SELECT * FROM roles", (err, result) => {
    res.json(result);
  });
});

//gets all of the employees
app.get("/api/employee", (req, res) => {
  db.query("SELECT * FROM employee", (err, result) => {
    res.json(result);
  });
});

app.listen(PORT, () => console.log(`Express server listening on port ${PORT}`));
