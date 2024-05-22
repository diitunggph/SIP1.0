// Function to fetch benefit changes data from API endpoint and display notifications
function loadNotifications() {
    fetch('http://localhost:5001/api/v1/benefitChanges')
      .then(response => response.json())
      .then(data => {
        const notificationContainer = document.querySelector('.container .notification-container');
        notificationContainer.innerHTML = ''; // Xóa các thông báo cũ
  
        data.forEach(notification => {
          const div = document.createElement('div');
          div.classList.add('notification');
          div.innerHTML = `
            <h4>${notification.title}</h4>
            <p>${notification.content}</p>
            <small>${new Date(notification.timestamp).toLocaleString()}</small>
          `;
          notificationContainer.appendChild(div);
        });
      })
      .catch(error => console.error('Error loading notifications:', error));
  }
  
  document.addEventListener('DOMContentLoaded', loadNotifications);

