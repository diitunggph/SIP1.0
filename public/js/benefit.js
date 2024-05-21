// Function to create a new notification element
function createNotification(title, content) {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = 'notification';
    const titleElement = document.createElement('h4');
    titleElement.textContent = title;
    const contentElement = document.createElement('p');
    contentElement.textContent = content;
    notificationDiv.appendChild(titleElement);
    notificationDiv.appendChild(contentElement);
    return notificationDiv;
}

function loadNotifications() {
    fetch('http://localhost:5001/api/v1/benefitChanges')
      .then(response => response.json())
      .then(data => {
        const notificationForm = document.getElementById('notification-container');
        notificationForm.innerHTML = ''; // Xóa các thông báo cũ
  
        data.forEach(notification => {
          const div = document.createElement('div');
          div.classList.add('notification');
          div.innerHTML = `
            <h4>${notification.title}</h4>
            <p>${notification.content}</p>
          `;
          notificationForm.appendChild(div);
        });
      })
      .catch(error => console.error('Error loading notifications:', error));
  }
  
  // Gọi hàm loadNotifications() khi trang được tải
  window.addEventListener('load', loadNotifications);
