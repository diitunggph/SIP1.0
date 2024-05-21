document.addEventListener('DOMContentLoaded', () => {
    // Helper function to format date (YYYY-MM-DD to DD/MM/YYYY)
    function formatDate(dateString) {
        var date = new Date(dateString);
        var day = String(date.getUTCDate()).padStart(2, '0');
        var month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero indexed
        var year = date.getUTCFullYear();

        return day + '/' + month + '/' + year;
    }

    // Function to populate the event table
    function populateEventTable(data) {
        const tableBody = document.getElementById('eventTableBody');
        tableBody.innerHTML = '';
    
        data.forEach((employee, index) => {
            const birthDate = new Date(employee.Birth_Date);
            const hireDate = employee.Hire_Date_For_Working ? new Date(employee.Hire_Date_For_Working) : null;
            const currentMonth = new Date().getMonth();
    
            const isCurrentMonthBirthday = birthDate.getMonth() === currentMonth;
            const isCurrentMonthWorkAnniversary = hireDate.getMonth() === currentMonth;
    
            if (isCurrentMonthBirthday) {
                const row = document.createElement('tr');
    
                const cellEventId = document.createElement('td');
                cellEventId.textContent = index + 1;
                row.appendChild(cellEventId);
    
                const cellEventName = document.createElement('td');
                const middleName = employee.Current_Middle_Name ? employee.Current_Middle_Name + ' ' : '';
                cellEventName.textContent = `${employee.Current_First_Name} ${middleName} ${employee.Current_Last_Name}`;
                row.appendChild(cellEventName);
    
                const cellDate = document.createElement('td');
                cellDate.textContent = formatDate(employee.Birth_Date);
                row.appendChild(cellDate);
    
                const cellDescription = document.createElement('td');
                cellDescription.textContent = `Birthday party for ${employee.Current_First_Name} ${middleName} ${employee.Current_Last_Name}`;
                row.appendChild(cellDescription);
    
                row.addEventListener('click', () => showEventDetails(employee, !isCurrentMonthBirthday));
    
                tableBody.appendChild(row);
            }
            index += 1;
            if (isCurrentMonthWorkAnniversary) {
                const row = document.createElement('tr');
    
                const cellEventId = document.createElement('td');
                cellEventId.textContent = index + 1;
                row.appendChild(cellEventId);
    
                const cellEventName = document.createElement('td');
                const middleName = employee.Current_Middle_Name ? employee.Current_Middle_Name + ' ' : '';
                cellEventName.textContent = `${employee.Current_First_Name} ${middleName} ${employee.Current_Last_Name}`;
                row.appendChild(cellEventName);
    
                const cellDate = document.createElement('td');
                cellDate.textContent = formatDate(employee.Hire_Date_For_Working);
                row.appendChild(cellDate);
    
                const cellDescription = document.createElement('td');
                cellDescription.textContent = `Work anniversary for ${employee.Current_First_Name} ${middleName} ${employee.Current_Last_Name}`;
                row.appendChild(cellDescription);
    
                row.addEventListener('click', () => showEventWorkAnni(employee, !isCurrentMonthWorkAnniversary));
    
                tableBody.appendChild(row);
            }
        });
        
    }
    
    function showEventDetails(employee, isWorkAnniversary) {
        const eventDetailsModal = new bootstrap.Modal(document.getElementById('eventDetailsModal'), {
            keyboard: false
        });
        const eventDetailsBody = document.getElementById('eventDetailsBody');
        const middleName = employee.Current_Middle_Name ? employee.Current_Middle_Name + ' ' : '';
        const eventName = `${employee.Current_First_Name} ${middleName} ${employee.Current_Last_Name}`;
        const eventDate = isWorkAnniversary ? formatDate(employee.Hire_Date_For_Working) : formatDate(employee.Birth_Date);
        const eventDescription = isWorkAnniversary
            ? `Work anniversary for ${eventName}`
            : `Birthday party for ${eventName}`;
    
        eventDetailsBody.innerHTML = `
            <p><strong>Event Name:</strong> ${eventName}</p>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Description:</strong> ${eventDescription}</p>
        `;
        eventDetailsModal.show();
    }

    function showEventWorkAnni(employee, isWorkAnniversary) {
        const eventDetailsModal = new bootstrap.Modal(document.getElementById('eventDetailsModal'), {
            keyboard: false
        });
        const eventDetailsBody = document.getElementById('eventDetailsBody');
        const middleName = employee.Current_Middle_Name ? employee.Current_Middle_Name + ' ' : '';
        const eventName = `${employee.Current_First_Name} ${middleName} ${employee.Current_Last_Name}`;
        const eventDate = formatDate(employee.Hire_Date_For_Working);
        const eventDescription = `Work anniversary for ${eventName}`;
            
    
        eventDetailsBody.innerHTML = `
            <p><strong>Event Name:</strong> ${eventName}</p>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Description:</strong> ${eventDescription}</p>
        `;
        eventDetailsModal.show();
    }

    fetch('http://localhost:5001/api/v1/getEvents')
    .then(response => response.json())
    .then(data => populateEventTable(data))
    .catch(error => console.error(error));
});
