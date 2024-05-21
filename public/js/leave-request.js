function populateLeaveTable() {
    // Fetch data from the API endpoint
    fetch('http://localhost:5001/api/v1/leave')
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                const tableBody = document.getElementById('leaveTableBody');
                tableBody.innerHTML = '';
                data.forEach(employee => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${employee.Employment_ID}</td>
                        <td>${employee.Employee_Name}</td>
                        <td>${employee.Day_Off}</td>
                        <td class="${employee.Exceeded === 'yes' ? 'highlight' : ''}">${employee.Exceeded}</td>
                    `;
                    tableBody.appendChild(row);

                    if (employee.Exceeded === 'yes') {
                        showNotification(`Employee ${employee.Employee_Name} has exceeded their leave request.`);
                    }
                });
            } else {
                console.error('Error fetching data: Data is not an array');
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function showNotification(message) {
    const notificationContainer = document.getElementById('notificationContainer');
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-warning alert-dismissible fade show';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        <strong>Notice!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    notificationContainer.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.classList.remove('show');
        alertDiv.addEventListener('transitionend', () => alertDiv.remove());
    }, 3000);
}

document.addEventListener('DOMContentLoaded', populateLeaveTable);