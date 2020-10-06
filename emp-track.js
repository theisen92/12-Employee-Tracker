const mysql = require("mysql");
const inquirer = require("inquirer");
const figlet = require("figlet");
const cTable = require("console.table");
const userCred = require("./config");

// Create the connection information for the sql database

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306

  port: 3306,

  // Your username

  user: userCred.user,

  // Your password

  password: userCred.password,
  database: "emp_DB",

  // To allow for multiple statements

  multipleStatements: true,
});

// Connect to the mysql server and sql database

connection.connect(function (err) {
  if (err) throw err;

  // Run the start function after the connection is made to prompt the user

  figlet("Employee Manager", function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(data);
    start();
  });
});

// Function which prompts the user for what action they should take

function start() {
  inquirer
    .prompt({
      name: "choice",
      type: "list",
      message: "Would you like to do?",
      choices: [
        "View all employees",
        "View employee by manager",
        "View all roles",
        "View all departments",
        "Add an employee",
        "Add a role",
        "Add a department",
        "Update employee information",
      ],
    })
    .then(function (answer) {
      switch (answer.choice) {
        case "View all employees":
          empAll();
          break;

        case "View employee by manager":
          empMan();
          break;

        case "View all roles":
          roleAll();
          break;

        case "View all departments":
          deptAll();
          break;

        case "Add an employee":
          empAdd();
          break;

        case "Add a role":
          roleAdd();
          break;

        case "Add a department":
          deptAdd();
          break;

        case "Update employee information":
          empUpdate();
          break;
      }
    });
}

function empAll() {
  // Query the database for all the employees

  connection.query(
    `select a.id, a.first_name, a.last_name, title, salary, name, concat(b.first_name, " ", b.last_name) as manager
    from employee as a
    left join employee as b on a.manager_id = b.id
    left join role on a.role_id = role.id
    left join department ON department.id = role.department_id;`,
    function (err, res) {
      let arr = [];

      // Going through the res, grabbing the employee information and pushing to an array

      res.forEach((el) => {
        arr.push([
          el.id,
          el.first_name,
          el.last_name,
          el.title,
          el.salary,
          el.name,
          el.manager,
        ]);
      });

      // Displaying the employee information

      console.log(" ");
      console.table(
        [
          "ID",
          "First Name",
          "Last Name",
          "Role",
          "Salary",
          "Department",
          "Manager",
        ],
        arr
      );
      console.log(" ");

      // Going back to start

      start();
    }
  );
}

// View employee by manager

function empMan() {
  // Query the database for all the employees name and ids

  connection.query(
    `select a.id, a.first_name, a.last_name, a.manager_id,
    concat(b.first_name, " ", b.last_name) as manager, b.id as boss_id
    from employee as a left join employee as b on a.manager_id = b.id;`,
    function (err, res) {
      if (err) throw err;
      var empByManArr = [];
      res.forEach((el) => {
        empByManArr.push(`${el.first_name} ${el.last_name}`);
      });

      // Prompt for which manager you want to choose

      inquirer
        .prompt([
          {
            name: "manager",
            type: "rawlist",
            message: "Who do you want to view the employees he manages?",
            choices: empByManArr,
          },
        ])
        .then(function (answer) {
          var empByManList = res;

          // Filtering and grabbing the manager who you selected

          var manSearchFiltered = empByManList.filter(
            (obj) => `${obj.first_name} ${obj.last_name}` === answer.manager
          );
          manSearchId = manSearchFiltered[0].id;

          // Compairing it to the employee manager_id

          var empByManFiltered = empByManList.filter(
            (obj) => obj.manager_id === manSearchId
          );

          var filteredEmpByMan = [];

          // Going through the filtered array, grabbing the employee information and pushing to an array

          empByManFiltered.forEach((el) => {
            filteredEmpByMan.push([
              el.id,
              el.first_name,
              el.last_name,
              el.manager,
            ]);
          });

          // Displaying the employees who are being managed by the person you selected

          if (filteredEmpByMan.length <= 0) {
            console.log(" ");
            console.log("No one reports to this person!");
            console.log(" ");
          } else {
            console.log(" ");
            console.table(
              ["ID", "First Name", "Last Name", "Manager"],
              filteredEmpByMan
            );
            console.log(" ");
          }

          // Going back to start

          start();
        });
    }
  );
}

// View all roles

function roleAll() {
  // Query the database for all the roles and the deparments that they fall under

  connection.query(
    `select title, salary, name from role
  left join department on role.department_id = department.id;`,
    function (err, res) {
      if (err) throw err;
      let arr = [];
      res.forEach((el) => {
        arr.push([el.title, el.salary, el.name]);
      });
      console.log(" ");
      console.table(["Role", "Salary", "Department"], arr);
      console.log(" ");

      // Going back to start

      start();
    }
  );
}

// View all departments

function deptAll() {
  // Query the database for all departments

  connection.query("select * from department", function (err, res) {
    if (err) throw err;
    let arr = [];

    // Pushing all the department names to the array

    res.forEach((el) => {
      arr.push([el.name]);
    });
    console.log(" ");
    console.table(["Department"], arr);
    console.log(" ");

    // Going back to start

    start();
  });
}

// Adding an employee

function empAdd() {
  // Query the database for selecting the role and the manager

  connection.query(`select * from employee; select * from role`, function (
    err,
    res
  ) {
    if (err) throw err;
    var roleArray = [];

    // Pushing all the role names to the array

    res[1].forEach((el) => {
      roleArray.push(el.title);
    });

    var manArray = ["None"];

    // Pushing all the manager names to the array

    res[0].forEach((el) => {
      manArray.push(`${el.first_name} ${el.last_name}`);
    });

    // Prompt for info about the new employee

    inquirer
      .prompt([
        {
          name: "firstName",
          type: "input",
          message: "What is the employees first name?",
        },
        {
          name: "lastName",
          type: "input",
          message: "What is the employees last name?",
        },
        {
          name: "role",
          type: "rawlist",
          message: "What is the employee's role?",
          choices: roleArray,
        },
        {
          name: "manager",
          type: "rawlist",
          message: "What is the employee's manager?",
          choices: manArray,
        },
      ])
      .then(function (answer) {
        var roleList = res[1];
        var manList = res[0];

        // Linking the role title to the role id

        var roleFiltered = roleList.filter((obj) => obj.title === answer.role);

        var managerVar;

        // Linking manager id with the employee id

        if (answer.manager === "None") {
          managerVar = null;
        } else {
          var manFiltered = manList.filter(
            (obj) => `${obj.first_name} ${obj.last_name}` === answer.manager
          );
          managerVar = manFiltered[0].id;
        }

        // Setting the new employee to the database

        connection.query(
          "insert into employee set ?",
          {
            first_name: answer.firstName,
            last_name: answer.lastName,
            role_id: roleFiltered[0].id,
            manager_id: managerVar,
          },
          function (err) {
            if (err) throw err;
            console.log("\nYour employee was added to the work force!\n");

            // Going back to start

            start();
          }
        );
      });
  });
}

// Adding a role

function roleAdd() {
  // Query the database for selecting the role and the department

  connection.query("select * from department", function (err, res) {
    if (err) throw err;
    var choiceArray = [];

    // Pushing all the department names to the array

    res.forEach((el) => {
      choiceArray.push(el.name);
    });

    // Prompt for info about the new role

    inquirer
      .prompt([
        {
          name: "role",
          type: "input",
          message: "What is the name of the role you want to add?",
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary?",
        },
        {
          name: "dept",
          type: "list",
          message: "What department is this role for?",
          choices: choiceArray,
        },
      ])
      .then(function (answer) {
        var deptList = res;

        // Linking department name to the department ID

        var deptFiltered = deptList.filter((obj) => obj.name === answer.dept);

        connection.query(
          // Setting the new role to the database

          "insert into role set ?",
          {
            title: answer.role,
            salary: answer.salary,
            department_id: deptFiltered[0].id,
          },
          function (err) {
            if (err) throw err;
            console.log(" ");
            console.log("Your role was added!");
            console.log(" ");

            // Going back to start

            start();
          }
        );
      });
  });
}

// Adding a department

function deptAdd() {
  // Prompt for info about the new department

  inquirer
    .prompt([
      {
        name: "deptName",
        type: "input",
        message: "What is the name of the department you want to add?",
      },
    ])
    .then(function (answer) {
      connection.query(
        // Setting the new role to the database

        "insert into department set ?",
        {
          name: answer.deptName,
        },
        function (err) {
          if (err) throw err;
          console.log("\nYour department was added!\n");

          // Going back to start

          start();
        }
      );
    });
}

// Updating the employee information

function empUpdate() {
  // Query the database for selecting the employee and the role

  connection.query("select * from employee; select * from role;", function (
    err,
    res
  ) {
    if (err) throw err;
    var empArray = [];
    var roleArray = [];
    var manArr = ["None"];

    // Pushing all the employee names to the array

    res[0].forEach((el) => {
      empArray.push(`${el.first_name} ${el.last_name}`);
      manArr.push(`${el.first_name} ${el.last_name}`);
    });

    // Pushing all the role names to the array

    res[1].forEach((el) => {
      roleArray.push(el.title);
    });

    // Prompt for what the new role is

    inquirer
      .prompt([
        {
          name: "employee",
          type: "rawlist",
          message: "What employee do you want to update their information?",
          choices: empArray,
        },
        {
          name: "roleUp",
          type: "rawlist",
          message: "What is the new role for the employee?",
          choices: roleArray,
        },
        {
          name: "managerUp",
          type: "rawlist",
          message: "What employee do you want is the employees manager?",
          choices: manArr,
        },
      ])
      .then(function (answer) {
        var empUpList = res[0];
        var roleUpList = res[1];

        // Linking employee name to the employee we want to update

        var empUpFilter = empUpList.filter(
          (obj) => `${obj.first_name} ${obj.last_name}` === answer.employee
        );

        // Linking role name to the role id

        var roleUpFilter = roleUpList.filter(
          (obj) => obj.title === answer.roleUp
        );

        var managerVar;

        // Linking manager id with the employee id

        if (answer.managerUp === "None") {
          managerVar = null;
        } else {
          var manFiltered = empUpList.filter(
            (obj) => `${obj.first_name} ${obj.last_name}` === answer.managerUp
          );
          managerVar = manFiltered[0].id;
        }

        connection.query(
          // Updating the information in the database

          "update employee set ? where ?",
          [
            {
              role_id: roleUpFilter[0].id,
              manager_id: managerVar,
            },
            {
              id: empUpFilter[0].id,
            },
          ],
          function (err) {
            if (err) throw err;
            console.log("\nYour employee infromation was updated!\n");

            // Going back to start

            start();
          }
        );
      });
  });
}
