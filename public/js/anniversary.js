const anniversaryData = [
    { id: 1, name: "John Doe", anniversary: "2024-05-19" },
    { id: 2, name: "Jane Smith", anniversary: "2024-06-15" },
    { id: 3, name: "Bob Johnson", anniversary: "2024-07-20" }
];

function populateAnniversaryTable() {
    const tableBody = document.getElementById('anniversaryTableBody');
    tableBody.innerHTML = '';
    anniversaryData.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.id}</td>
            <td>${employee.name}</td>
            <td>${employee.anniversary}</td>
        `;
        tableBody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', populateAnniversaryTable);