let activeTab = '0';
let taskToEdit = null;

window.onload = function() {
  fetch('http://localhost:3000/api/tasks')
    .then(response => response.json())
    .then(data => {
      console.log(data.tasks);
      data.tasks.forEach(task => {
        const newTask = document.createElement('div');
    newTask.classList.add('task-item');
    newTask.dataset.id = task.id;
    newTask.dataset.category = activeTab;
    newTask.dataset.title = task.name;
    newTask.dataset.dueDate = task.date;
    newTask.dataset.priority = task.priority;
    newTask.innerHTML = `
      <span class="check-circle"></span>
      <span class="task-title">${task.name}</span>
      <div class="task-meta">
        <small>Määräaika: ${task.date || 'Ei asetettu'}</small><br>
        <small>Prioriteetti: ${task.priority}</small>
      </div>
    `;

    const checkCircle = newTask.querySelector('.check-circle');
    checkCircle.addEventListener('click', function(event) {
      event.stopPropagation();
      checkCircle.classList.toggle('checked');
      newTask.classList.toggle('checked');
    });

    // Kun painaa tehtävää avautuu popup uudestaan
    newTask.addEventListener('click', function() {
      openEditPopup(newTask);
    });

    document.getElementById('taskList').appendChild(newTask);
      });
    })
    .catch(error => console.error('Error:', error));
};

//popup uuden tehtävän lisäämiseen
document.getElementById('plusButtonToAddToDo').addEventListener('click', function() {
document.getElementById('popupOverlay').classList.remove('hidden');

// Aseta päivämäärä
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;

  document.getElementById('dueDate').setAttribute('min', todayString);

  document.getElementById('taskTitle').value = '';
  document.getElementById('dueDate').value = '';
  document.getElementById('priority').value = '1';
  taskToEdit = null;
});

//Sulje popup kun klikataan "Peruuta"
document.getElementById('cancelBtn').addEventListener('click', function() {
  document.getElementById('popupOverlay').classList.add('hidden');
});

//Poista tehtävä kun klikataan "Poista"
document.getElementById('deleteBtn').addEventListener('click', function() {
  if (taskToEdit) {
    fetch('http://localhost:3000/api/tasks/' + taskToEdit.dataset.id, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
      })
      .catch(error => console.error('Error:', error));
    taskToEdit.remove();
    taskToEdit = null;
  }
  document.getElementById('popupOverlay').classList.add('hidden');
});

//Vaihda välilehteä (Työ / Arki)
const tabs = document.querySelectorAll('.tab');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    activeTab = tab.dataset.tab;

    showTasks();
  });
});

//Näytä tehtävät nykyisessä välilehdessä
function showTasks() {
  const taskElements = document.querySelectorAll('.task-item');
  taskElements.forEach(task => {
    if (task.dataset.category === activeTab) {
      task.style.display = 'block';
    } else {
      task.style.display = 'none';
    }
  });
}

//Tallenna uusi tehtävä tai muokata vanhaa
document.getElementById('saveBtn').addEventListener('click', function() {
  const taskId = document.getElementById('taskId');
  const taskTitleInput = document.getElementById('taskTitle');
  const dueDateInput = document.getElementById('dueDate');
  const priorityInput = document.getElementById('priority');

  const title = taskTitleInput.value.trim();
  const dueDate = dueDateInput.value;
  let priority = priorityInput.value.trim();
  
  if (title === "") {
    alert("Tehtävä * on pakollinen!");
    return;
  }

  //Default prioriteetti 1
  if (priority === "" || priority === "1") {
    const allTasks = document.querySelectorAll('.task-item');
    allTasks.forEach(task => {
      let oldPriority = parseInt(task.dataset.priority);
      task.dataset.priority = oldPriority + 1;
      task.querySelector('.task-meta').innerHTML = `
        <small>Määräaika: ${task.dataset.dueDate || 'Ei asetettu'}</small><br>
        <small>Prioriteetti: ${task.dataset.priority}</small>
      `;
    });
    priority = 1;
  }

  if (taskId.value) {
    fetch('http://localhost:3000/api/tasks/' + taskId.value, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: title,
        category: activeTab,
        priority: priority,
        date: dueDate
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
      })
      .catch(error => console.error('Error:', error));
  } else {
    fetch('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: title,
        category: activeTab,
        priority: priority,
        date: dueDate
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        window.location.reload();
      })
      .catch(error => console.error('Error:', error));
  }
  

  if (taskToEdit) {
    //Muokkaa olemassaolevaa tehtävää
    taskToEdit.dataset.title = title;
    taskToEdit.dataset.dueDate = dueDate;
    taskToEdit.dataset.priority = priority;
    taskToEdit.querySelector('.task-title').innerText = title;
    taskToEdit.querySelector('.task-meta').innerHTML = `
      <small>Määräaika: ${dueDate || 'Ei asetettu'}</small><br>
      <small>Prioriteetti: ${priority}</small>
    `;
  } else {
    //Luo uusi tehtävä
    const newTask = document.createElement('div');
    newTask.classList.add('task-item');
    newTask.dataset.category = activeTab;
    newTask.dataset.title = title;
    newTask.dataset.dueDate = dueDate;
    newTask.dataset.priority = priority;
    newTask.innerHTML = `
      <span class="check-circle"></span>
      <span class="task-title">${title}</span>
      <div class="task-meta">
        <small>Määräaika: ${dueDate || 'Ei asetettu'}</small><br>
        <small>Prioriteetti: ${priority}</small>
      </div>
    `;

    const checkCircle = newTask.querySelector('.check-circle');
    checkCircle.addEventListener('click', function(event) {
      event.stopPropagation();
      checkCircle.classList.toggle('checked');
      newTask.classList.toggle('checked');
    });

    // Kun painaa tehtävää avautuu popup uudestaan
    newTask.addEventListener('click', function() {
      openEditPopup(newTask);
    });

    document.getElementById('taskList').appendChild(newTask);
  }

  taskToEdit = null;
  document.getElementById('popupOverlay').classList.add('hidden');
  showTasks();
});

//Avaa tehtävän muokkaus popup
function openEditPopup(taskElement) {
  taskToEdit = taskElement;

  document.getElementById('taskId').value = taskElement.dataset.id;
  document.getElementById('taskTitle').value = taskElement.dataset.title;
  document.getElementById('dueDate').value = taskElement.dataset.dueDate;
  document.getElementById('priority').value = taskElement.dataset.priority;

  document.getElementById('popupOverlay').classList.remove('hidden');
}
