const mysql2 = require('mysql2')
const express = require('express')

const bodyParse = require('body-parser')
const mssql = require('mssql')

const cors = require('cors');

const app = express();

app.use(bodyParse.json());

app.use(cors());

const server = app.listen(process.env.PORT || 5001, function () {
  const port_mssql = server.address().port;
  console.log("App now running on port ", port_mssql);
});

const dbConfig = {
  user: "sa",
  password: "13102003",
  server: `127.0.0.1`,
  database: "HRM",
  options: {
    encrypt: false,
  }
};

const connection = mysql2.createConnection({
  host: "localhost",
  database: "mydb",
  user: "root",
  password: "",
});

//MySQL

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`SERVER : http://localhost:${PORT}`);
  connection.connect((err) => {
    if (err) throw err;
    // console.log("DATABASE CONNECTED");
  })
  mssql.connect(dbConfig, (err) => {
    if (err) {
      console.log(err)
    } else {

      console.log('connect mssql successfully')
    }
  });
})

app.use("/all", (req, res) => {
  const sql_query =  `SELECT COUNT(*) AS total FROM employee`
  connection.query(sql_query, (err, result) => {
    if (err) throw err;
    res.send(result[0]);
  });
});

app.get("/totalEarningsMySQL", (req, res) => {
  const sql_query = `
    SELECT SUM(p.\`Pay Amount\` * p.Value * (1 - p.\`Tax Percentage\` / 100)) AS totalEarnings
    FROM \`pay rates\` p
    JOIN employee e ON p.\`idPay Rates\` = e.\`Pay Rates_idPay Rates\` 
  `;
  connection.query(sql_query, (err, result) => {
    if (err) throw err;
    res.send(result[0]);
  });
});

//SQL Server
app.get("/api/v1/employee", function (req, res) {
  new mssql.Request().query("select * from PERSONAL", (err, result) => {
    if (err) {
      console.log(err)
    } else {
      res.json(result.recordset);
    }
  })
});

app.get("/api/v1/employeeDetails", async function (req, res) {
  let responseMysql = [];
  let responseMssql = [];
  
  const sql_query_mysql = `
    SELECT e.\`Employee Number\` AS 'Employee_ID', e.\`Last Name\` AS Last_Name, e.\`First Name\` AS First_Name, (p.\`Pay Amount\` * p.Value * (1 - p.\`Tax Percentage\` / 100)) AS 'Income'
    FROM employee e
    JOIN \`pay rates\` p ON e.\`Pay Rates_idPay Rates\` = p.\`idPay Rates\`
  `;
  
  const sql_query_mssql = `
    SELECT e.Employment_Id AS 'Employment_ID', e.Hire_Date_For_Working AS 'Hire_Date', ew.number_days_actual_of_working_per_month AS 'Working_Days_Per_Month', 
    ew.total_number_vacation_working_days_per_month AS 'Vacation_Days_Per_Month' 
    FROM Employment e
    JOIN Personal p ON e.Personal_Id = p.Personal_Id
    JOIN Employment_working_time ew ON e.Employment_ID = ew.Employment_id
  `;
  
  try {
    // Perform MySQL query
    const mysqlPromise = new Promise((resolve, reject) => {
      connection.query(sql_query_mysql, (err, result_mysql) => {
        if (err) return reject(err);
        resolve(result_mysql);
      });
    });

    // Perform MSSQL query
    const mssqlPromise = new Promise((resolve, reject) => {
      new mssql.Request().query(sql_query_mssql, (err, result_mssql) => {
        if (err) return reject(err);
        resolve(result_mssql.recordset);
      });
    });

    // Wait for both queries to complete
    const [result_mysql, result_mssql] = await Promise.all([mysqlPromise, mssqlPromise]);

    // Combine results
    const data = result_mysql.map(mysqlItem => {
      const mssqlItem = result_mssql.find(item => item.Employment_ID === mysqlItem.Employee_ID);
      return {
        Employee_ID: mysqlItem.Employee_ID,
        Last_Name: mysqlItem.Last_Name,
        First_Name: mysqlItem.First_Name,
        Income: mysqlItem.Income,
        Hire_Date: mssqlItem ? mssqlItem.Hire_Date : null,
        Working_Days_Per_Month: mssqlItem ? mssqlItem.Working_Days_Per_Month : null,
        Vacation_Days_Per_Month: mssqlItem ? mssqlItem.Vacation_Days_Per_Month : null,
      };
    });

    // Send response
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


app.post("/api/v1/addPersonal", async function (req, res) {
  const personalData = req.body;

  const sql_query_mssql_personal = `
    INSERT INTO Personal (Current_First_Name, Current_Last_Name, Current_Middle_Name, Birth_Date, Social_Security_Number, Drivers_License, Current_Address_1, Current_Address_2, Current_City, Current_Country, Current_Zip, Current_Gender, Current_Phone_Number, Current_Personal_Email, Current_Marital_Status, Ethnicity, Shareholder_Status, Benefit_Plan_ID)
    VALUES ('${personalData.currentFirstName}', '${personalData.currentLastName}', '${personalData.currentMiddleName}', '${personalData.birthDate}', '${personalData.socialSecurityNumber}', '${personalData.driversLicense}', '${personalData.currentAddress1}', '${personalData.currentAddress2}', '${personalData.currentCity}', '${personalData.currentCountry}', '${personalData.currentZip}', '${personalData.currentGender}', '${personalData.currentPhoneNumber}', '${personalData.currentPersonalEmail}', '${personalData.currentMaritalStatus}', '${personalData.ethnicity}', '${personalData.shareholderStatus}', '${personalData.benefitPlanID}');
  `;


  try {
    // Perform MSSQL queries
    const mssqlPromisePersonal = new Promise((resolve, reject) => {
      new mssql.Request().query(sql_query_mssql_personal, (err, result_mssql) => {
        if (err) return reject(err);
        resolve(result_mssql.recordset);
      });
    });
    // Wait for all queries to complete
    await Promise.all([mssqlPromisePersonal]);

    // Send response
    res.status(200).json('Employee added successfully');
  } catch (err) {
    console.error(err);
    res.status(500).json('Internal Server Error');
  }
});

app.get("/api/v1/getPersonals", async function (req, res) {

  const sql_query_mssql = `
    SELECT p.Personal_ID, p.Current_First_Name, p.Current_Last_Name, p.Current_Middle_Name, p.Birth_Date, p.Current_Address_1, p.Current_Personal_Email, p.Current_Phone_Number, 
    p.Social_Security_Number
    FROM Personal p
  `;
  
  try {
    // Perform MSSQL query
    const mssqlPromise = new Promise((resolve, reject) => {
      new mssql.Request().query(sql_query_mssql, (err, result_mssql) => {
        if (err) return reject(err);
        resolve(result_mssql.recordset);
      });
    });

    // Wait for query to complete
    const result_mssql = await mssqlPromise;

    // Send response
    res.json(result_mssql);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
app.get("/api/v1/getEvents", async function (req, res) {
  const sql_query_mssql = `
        SELECT p.Personal_ID, p.Current_First_Name, p.Current_Middle_Name, p.Current_Last_Name, p.Birth_Date, e.Hire_Date_For_Working
        FROM Personal p
        LEFT JOIN Employment e ON p.Personal_Id = e.Personal_Id
        WHERE MONTH(p.Birth_Date) = MONTH(GETDATE()) OR (e.Hire_Date_For_Working IS NOT NULL AND MONTH(e.Hire_Date_For_Working) = MONTH(GETDATE()))
    `;

  try {
    const mssqlPromise = new Promise((resolve, reject) => {
      new mssql.Request().query(sql_query_mssql, (err, result_mssql) => {
        if (err) return reject(err);
        resolve(result_mssql.recordset);
      });
    });

    // Wait for query to complete
    const result_mssql = await mssqlPromise;

    // Send response
    res.json(result_mssql);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/api/v1/deletePersonal/:id', async function (req, res) {
  const personalId = req.params.id;

  try {
    // Kết nối đến SQL Server để lấy danh sách Employment_Id
    const sql_query_get_employment_ids = `
      SELECT Employment_Id FROM Employment WHERE Personal_ID = @Personal_ID;
    `;

    const request = new mssql.Request();
    request.input('Personal_ID', mssql.Int, personalId);

    const result = await request.query(sql_query_get_employment_ids);
    const employmentIds = result.recordset.map(record => record.Employment_Id);

    if (employmentIds.length === 0) {
      // Nếu danh sách trống, không có gì để xóa, trả về 200 OK
      res.status(200).send({ message: 'No related records found' });
      return;
    }

    // Kết nối đến SQL Server và xóa dữ liệu từ các bảng khác
    const sql_query_delete_job_history = `
      DELETE FROM Job_History WHERE Employment_ID IN (${employmentIds.join(',')});
    `;

    const sql_query_delete_employment = `
      DELETE FROM Employment WHERE Employment_Id IN (${employmentIds.join(',')});
    `;

    const sql_query_delete_personal = `
      DELETE FROM Personal WHERE Personal_ID = @Personal_ID;
    `;

    const requestDelete = new mssql.Request();
    requestDelete.input('Personal_ID', mssql.Int, personalId);
    await requestDelete.query(sql_query_delete_job_history);
    await requestDelete.query(sql_query_delete_employment);
    await requestDelete.query(sql_query_delete_personal);

    // Kết nối đến MySQL và xóa các bản ghi từ bảng employee
    const sql_query_delete_employee = `
      DELETE FROM employee WHERE idEmployee IN (${employmentIds.join(',')});
    `;

    await new Promise((resolve, reject) => {
      connection.query(sql_query_delete_employee, (err, result) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.status(200).send({ message: 'Employee and related records deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


app.post("/api/v1/addHR", async function (req, res) {
  const formData = req.body.formData;

  const sql_query_getEmploymentId = `
    SELECT Employment_Id FROM Employment e WHERE e.Personal_Id = ${formData.personalId}
  `;

  const sql_query_getPersonal = `
    SELECT Current_Last_Name, Current_First_Name, Current_Middle_Name, Social_Security_Number FROM Personal p WHERE p.Personal_Id = ${formData.personalId}
  `;

  const sql_query_getPayRate = `
    SELECT \`idPay Rates\` FROM \`pay rates\` p WHERE p.\`Pay Rate Name\` = '${formData.payRate}'
  `;

  const sql_query_mssql_job_history = `
    INSERT INTO Job_History (Employment_ID, Department, Division, From_Date, Job_Title, Supervisor, Location, Type_Of_Work)
    VALUES (@employmentId, @department, @division, @fromDate, @jobTitle, @supervisor, @location, @typeOfWork);
  `;

  const sql_query_mssql_employment = `
    INSERT INTO Employment (Employment_code, Employment_Status, Hire_Date_For_Working, Workers_Comp_Code, Number_Days_Requirement_Of_Working_Per_Month, Personal_Id)
    OUTPUT INSERTED.Employment_Id
    VALUES (@employmentCode, @employmentStatus, @hireDateForWorking, @workersCompCode, @numberDaysRequirementOfWorkingPerMonth, @personalId);
  `;

  const sql_query_mysql_employees = `
    INSERT INTO employee (idEmployee, \`Last Name\`, \`First Name\`, SSN, \`Pay Rate\`, \`Paid Last Year\`, \`Paid To Date\`, \`Vacation Days\`, \`Pay Rates_idPay Rates\`)
    VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?);
  `;

  try {
    let personalData;
    let payRateId;

    // Get personal data from MSSQL
    personalData = await new Promise((resolve, reject) => {
      new mssql.Request().query(sql_query_getPersonal, (err, result_mssql) => {
        if (err) return reject(err);
        if (result_mssql.recordset.length === 0) {
          return reject(new Error('No personal data found for given Personal_Id'));
        }
        resolve(result_mssql.recordset[0]);
      });
    });

    // Get pay rate ID from MySQL
    payRateId = await new Promise((resolve, reject) => {
      connection.query(sql_query_getPayRate, (err, result_mysql) => {
        if (err) return reject(err);
        if (result_mysql.length === 0) {
          return reject(new Error('No pay rate found for given Pay Rate Name'));
        }
        resolve(result_mysql[0]['idPay Rates']);
      });
    });

    // Insert into Employment table and get the Employment_Id
    employmentId = await new Promise((resolve, reject) => {
      new mssql.Request()
        .input('employmentCode', mssql.NVarChar, `EMP0${formData.personalId}`)
        .input('employmentStatus', mssql.NVarChar, 'Active')
        .input('hireDateForWorking', mssql.Date, formData.hireDateForWorking)
        .input('workersCompCode', mssql.NVarChar, `WC00${formData.personalId}`)
        .input('numberDaysRequirementOfWorkingPerMonth', mssql.Int, formData.numberDaysRequirementOfWorkingPerMonth)
        .input('personalId', mssql.Int, formData.personalId)
        .query(sql_query_mssql_employment, (err, result_mssql) => {
          if (err) return reject(err);
          resolve(result_mssql.recordset[0].Employment_Id);
        });
    });

    // Insert into Job_History table
    await new Promise((resolve, reject) => {
      new mssql.Request()
        .input('employmentId', mssql.Int, employmentId)
        .input('department', mssql.NVarChar, formData.department)
        .input('division', mssql.NVarChar, formData.division)
        .input('fromDate', mssql.Date, formData.hireDateForWorking)
        .input('jobTitle', mssql.NVarChar, formData.jobTitle)
        .input('supervisor', mssql.NVarChar, formData.supervisor)
        .input('location', mssql.NVarChar, formData.location)
        .input('typeOfWork', mssql.NVarChar, formData.typeOfWork)
        .query(sql_query_mssql_job_history, (err, result_mssql) => {
          if (err) return reject(err);
          resolve(result_mssql);
        });
    });

    // Insert into employee table in MySQL
    await new Promise((resolve, reject) => {
      connection.query(
        sql_query_mysql_employees,
        [
          employmentId, // Use employmentId as idEmployee
          personalData.Current_Last_Name,
          personalData.Current_First_Name,
          personalData.Social_Security_Number,
          formData.payRate,
          payRateId
        ],
        (err, result_mysql) => {
          if (err) return reject(err);
          resolve(result_mysql);
        }
      );
    });

    res.status(200).json('Job history, employment, and employment working time data added successfully');
  } catch (err) {
    console.error(err);
    res.status(500).json('Internal Server Error');
  }
});

app.get("/api/v1/leave", async function (req, res) {

  const sql_query_mssql = `
    SELECT e.Employment_ID, CONCAT(p.Current_First_Name, ' ', p.Current_Last_Name, ' ', p.Current_Middle_Name) AS Employee_Name, ewt.total_number_vacation_working_days_per_month AS Day_Off
    FROM Employment e
    JOIN Personal p ON e.Personal_Id = p.Personal_Id
    JOIN Employment_working_time ewt ON e.Employment_Id = ewt.Employment_id
  `;
  
  try {
    // Perform MSSQL query
    const mssqlPromise = new Promise((resolve, reject) => {
      new mssql.Request().query(sql_query_mssql, (err, result_mssql) => {
        if (err) return reject(err);
        resolve(result_mssql.recordset);
      });
    });

    // Wait for query to complete
    const result_mssql = await mssqlPromise;

    // Kiểm tra và thêm điều kiện nghỉ vượt quá mức cho phép
    const vacationLimit = 2; // Giả sử mức quy định là 14 ngày
    const employeesLeave = result_mssql.map((employee) => {
      const exceeded = employee.Day_Off > vacationLimit;
      return { ...employee, Exceeded: exceeded ? 'YES' : 'NO' };
    });


    // Send response
    res.json(employeesLeave);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/v1/benefitChanges', async (req, res) => {
  const benefitChanges = [];

  try {
    const result = await new mssql.Request().query(`
      SELECT
        CONCAT(Current_First_Name, ' ', Current_Last_Name) AS employeeName,
        bp_new.Plan_Name AS planName,
        NotificationContent,
        NotificationTimestamp
      FROM BenefitChangeNotifications
      INNER JOIN Benefit_Plans bp_new ON NewBenefitPlanID = bp_new.Benefit_Plans_ID
      ORDER BY NotificationTimestamp DESC
    `);

    result.recordset.forEach(row => {
      benefitChanges.push({
        title: `Employee ${row.employeeName} Changed Benefit Plan`,
        content: row.NotificationContent,
        timestamp: row.NotificationTimestamp
      });
    });

    res.json(benefitChanges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

