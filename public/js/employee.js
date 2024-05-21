document.getElementById('addPersonalForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var personalData = {
        personalId: document.getElementById('personalId').value,
        currentFirstName: document.getElementById('currentFirstName').value,
        currentLastName: document.getElementById('currentLastName').value,
        currentMiddleName: document.getElementById('currentMiddleName').value,
        birthDate: document.getElementById('birthDate').value,
        socialSecurityNumber: document.getElementById('socialSecurityNumber').value,
        driversLicense: document.getElementById('driversLicense').value,
        currentAddress1: document.getElementById('currentAddress1').value,
        currentAddress2: document.getElementById('currentAddress2').value,
        currentCity: document.getElementById('currentCity').value,
        currentCountry: document.getElementById('currentCountry').value,
        currentZip: document.getElementById('currentZip').value,
        currentGender: document.getElementById('currentGender').value,
        currentPhoneNumber: document.getElementById('currentPhoneNumber').value,
        currentPersonalEmail: document.getElementById('currentPersonalEmail').value,
        currentMaritalStatus: document.getElementById('currentMaritalStatus').value,
        ethnicity: document.getElementById('ethnicity').value,
        shareholderStatus: document.getElementById('shareholderStatus').value,
        benefitPlanID: document.getElementById('benefitPlanID').value
    };


    sessionStorage.setItem('personalData', JSON.stringify(personalData));

    fetch('http://localhost:5001/api/v1/addPersonal', {
        method: 'POST',
        headers: {
            'mode': 'no-cors',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(personalData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        alert('Employee added successfully');
        document.getElementById('addPersonalForm').reset(); // Reset the form
        updateTable();
    })
    .catch((error) => {
        alert('Error: ' + error.message);
    });
});


document.getElementById('addEmployeeForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var storedData = sessionStorage.getItem('employeeData');
    var personalData = JSON.parse(storedData);
    var personalId = personalData.Personal_ID;
  
    var department = document.getElementById('department').value;
    var division = document.getElementById('division').value;
    var jobTitle = document.getElementById('jobTitle').value;
    var supervisor = document.getElementById('supervisor').value;
    var location = document.getElementById('location').value;
    var typeOfWork = document.getElementById('typeOfWork').value;
    var hireDateForWorking = document.getElementById('hireDateForWorking').value;
    var payRate = document.getElementById('payRate').value;
    var numberDaysRequirementOfWorkingPerMonth = document.getElementById('numberDaysRequirementOfWorkingPerMonth').value;

    var formData = {
        personalId: personalId,
        hireDateForWorking: hireDateForWorking,
        numberDaysRequirementOfWorkingPerMonth: numberDaysRequirementOfWorkingPerMonth,
        department: department,
        division: division,
        jobTitle: jobTitle,
        supervisor: supervisor,
        location: location,
        typeOfWork: typeOfWork,
        payRate: payRate
    }

    fetch('http://localhost:5001/api/v1/addHR', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({formData}),
    })
    .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(data => {
        alert('Data added successfully');
        document.getElementById('addEmployeeForm').reset; // Reset the form
        updateTable();
      })
      .catch((error) => {
        alert('Error: ' + error.message);
      });
});

function updateTable() {
    fetch('http://localhost:5001/api/v1/getPersonals')
        .then(response => response.json())
        .then(data => {
            var tableBody = document.getElementById('employeeTableBody');
            tableBody.innerHTML = ''; // Xóa nội dung hiện tại của tbody

            data.forEach(employee => {
                var row = document.createElement('tr');
                row.setAttribute('data-id', employee.Personal_ID);

                var cellEmployeeId = document.createElement('td');
                cellEmployeeId.textContent = employee.Personal_ID;
                row.appendChild(cellEmployeeId);

                var cellName = document.createElement('td');
                let middleName = employee.Current_Middle_Name ? employee.Current_Middle_Name + ' ' : '';
                cellName.textContent = employee.Current_First_Name + ' ' + middleName + ' ' + employee.Current_Last_Name;
                row.appendChild(cellName);

                var cellBirthDate = document.createElement('td');
                cellBirthDate.textContent = employee.Birth_Date;
                if (cellBirthDate.textContent && typeof cellBirthDate.textContent === 'string' && cellBirthDate.textContent.includes('-') && cellBirthDate.textContent.includes('T')) {
                    const date = new Date(cellBirthDate.textContent);
                    cellBirthDate.textContent = date.toLocaleDateString('vi-VN'); // Convert to dd/mm/yyyy format
                  }
                row.appendChild(cellBirthDate);

                var cellSSN = document.createElement('td');
                cellSSN.textContent = employee.Social_Security_Number;
                row.appendChild(cellSSN);

                var cellAddress1 = document.createElement('td');
                cellAddress1.textContent = employee.Current_Address_1;
                row.appendChild(cellAddress1);

                var cellEmail = document.createElement('td');
                cellEmail.textContent = employee.Current_Personal_Email;
                row.appendChild(cellEmail);

                var cellPhone = document.createElement('td');
                cellPhone.textContent = employee.Current_Phone_Number;
                row.appendChild(cellPhone);

                var cellActions = document.createElement('td');

                var btnDelete = document.createElement('button');
                btnDelete.textContent = 'Delete';
                btnDelete.classList.add('btn', 'btn-danger');
                btnDelete.addEventListener('click', async function() {
                    await deleteEmployee(employee.Personal_ID);
                });
                cellActions.appendChild(btnDelete);

                var btnAdd = document.createElement('button');
                btnAdd.textContent = 'Add';
                btnAdd.classList.add('btn', 'btn-success');
                btnAdd.addEventListener('click', function() {
                    showAddForm();
                    sessionStorage.setItem('employeeData', JSON.stringify(employee));
                });
                cellActions.appendChild(btnAdd);

                row.appendChild(cellActions);

                tableBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function showAddForm() {
    $('#addEmployeeForm').modal('show');
}

async function deleteEmployee(personalId) {
    try {
        const response = await fetch(`http://localhost:5001/api/v1/deletePersonal/${personalId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data.message);

        // Xóa hàng tương ứng khỏi bảng
        const row = document.querySelector(`tr[data-id="${personalId}"]`);
        if (row) {
            row.remove();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Gọi hàm updateTable khi trang web tải xong
window.onload = updateTable;

  