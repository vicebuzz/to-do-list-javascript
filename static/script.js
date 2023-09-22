// Get the task input field and the "Add Task" button
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");

// Get the three task lists
const urgentList = document.getElementById("urgentList");
const priorityList = document.getElementById("priorityList");
const toBeDoneList = document.getElementById("toBeDoneList");
const completedList = document.getElementById("completedList")

// initialise date object
const date = new Date();

// Add event listener to the "Add Task" button
addTaskBtn.addEventListener("click", addTask);

function getTaskNo() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
  (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

// function to load tasks
function loadTasks() {

  // get all tasks using XHR Get request
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      let tasks = JSON.parse(this.responseText);

      for (const key in tasks["tasks"]){
        if(tasks["tasks"].hasOwnProperty(key)){
          let task = tasks["tasks"][key]

          // check that task has not been deleted
          if (task['deleted'] == false){

            // create div with li for the task
            let newTask = document.createElement('div');
            newTask.classList.add('task');
            newTask.addEventListener('dblclick', moveTask);
            newTask.setAttribute('id', task["taskID"])

            // Create a new list item and add it to the appropriate task list
            const li = document.createElement("li");
            li.textContent = task["name"];
            newTask.appendChild(li);

            // create new trash button to delete the task
            deleteButton = document.createElement("button");
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>'
            deleteButton.classList.add('trash-btn');
            newTask.appendChild(deleteButton);
            deleteButton.addEventListener('click', deleteTask)

            // create new complete button to complete the task and turn it green
            completeButton = document.createElement('button')
            completeButton.innerHTML = '<i class="fas fa-check"></i>';
            completeButton.classList.add('complete-btn');
            newTask.appendChild(completeButton);
            completeButton.addEventListener('click', completeTask)

            // create new more info button to open up modal window for the task
            moreInfoButton = document.createElement('button');
            moreInfoButton.innerHTML = '<i class="fa fa-ellipsis-v"></i>';
            moreInfoButton.classList.add('more-btn');
            newTask.appendChild(moreInfoButton);
            moreInfoButton.addEventListener('click', openModal);

            // if task is not yet completed put it 
            // in one of the priority containers
            if (task['completed'] == false){
              if (task['taskPriority'] == 'To be done'){
                newTask.classList.add("yellow-green");
                toBeDoneList.appendChild(newTask);
              } else if (task['taskPriority'] == 'Prioritised'){
                // put the task in the middle container
                newTask.classList.add("yellow");
                priorityList.appendChild(newTask);
              } else if (task['taskPriority'] == 'Urgent'){
                // put the task in the first container
                newTask.classList.add("red");
                urgentList.appendChild(newTask);
              }
            } else {
              // if the task has been completed, 
              // put it into completed container
              newTask.classList.add('completed-task');
              newTask.style.background = "greenyellow";
              newTask.removeChild(newTask.querySelector('.complete-btn'))
              completedList.appendChild(newTask);
            }
          }
        }
      }
    }
    else {
      console.log("xhttp request problem occurred")
    }
  }
  xhttp.open("GET", "/get_tasks", true);
  xhttp.send();
}

// Function to add a task
function addTask() {
  // Get the task input value
  const taskValue = taskInput.value;

  // Check if task input is empty
  if (taskValue === "") {
    alert("Please enter a task!");
    return;
  }

  // create div to fit li and buttons to manage the task
  newTask = document.createElement('div');
  newTask.classList.add('task');
  newTask.classList.add("yellow-green");
  newTask.addEventListener('dblclick', moveTask);

  // create unique id
  taskId = 'task'+getTaskNo();
  newTask.setAttribute('id', taskId)

  // get today's date
  const dat = new Date();
  let newDate = dat.getDate() + "/" + dat.getMonth() + "/" + dat.getFullYear();

  // create a task object to upload
  let uploadObject = {};
  uploadObject.taskID = taskId;
  uploadObject.taskPriority = "To be done";
  uploadObject.name = taskValue;
  uploadObject.dateUploaded = newDate;
  uploadObject.completed = false;
  uploadObject.deleted = false;
  uploadObject.completedDate= '';
  uploadObject.dueDate = '';

  // create XHR Post request to add a task
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        console.log(xhr.responseText);
    }
  };

  xhr.open("POST", "/add_task", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  let sendData = JSON.stringify(uploadObject);
  xhr.send(sendData);

  // Create a new list item and add it to the appropriate task list
  const li = document.createElement("li");
  li.textContent = taskValue;
  newTask.appendChild(li);

  // create new trash button to delete the task
  deleteButton = document.createElement("button");
  deleteButton.innerHTML = '<i class="fas fa-trash"></i>'
  deleteButton.classList.add('trash-btn');
  newTask.appendChild(deleteButton);
  deleteButton.addEventListener('click', deleteTask)

  // create new complete button to complete the task and turn it green
  completeButton = document.createElement('button')
  completeButton.innerHTML = '<i class="fas fa-check"></i>';
  completeButton.classList.add('complete-btn');
  newTask.appendChild(completeButton);
  completeButton.addEventListener('click', completeTask)

  // create new more info button to open up modal window for the task
  moreInfoButton = document.createElement('button');
  moreInfoButton.innerHTML = '<i class="fa fa-ellipsis-v"></i>';
  moreInfoButton.classList.add('more-btn');
  newTask.appendChild(moreInfoButton);
  moreInfoButton.addEventListener('click', openModal);

  // append new task to low priority list
  toBeDoneList.appendChild(newTask);

  // Clear the task input field
  taskInput.value = "";
}

// Function to move a task to the next category
function moveTask() {

  // Get the task item and its current parent list
  const taskItem = this;
  const parentList = taskItem.parentNode;

  // Move the task item to the next category
  if (parentList === toBeDoneList) {
    taskItem.classList.remove("yellow-green");
    taskItem.classList.add("yellow");
    priorityList.appendChild(taskItem);
  } else if (parentList === priorityList) {
    taskItem.classList.remove("yellow");
    taskItem.classList.add("red");
    urgentList.appendChild(taskItem);
  } else if (parentList === urgentList) {
    taskItem.classList.add("yellow-green");
    taskItem.classList.remove("red");
    toBeDoneList.appendChild(taskItem);
  }
  let xhr = new XMLHttpRequest();

  // send XHR Post request to move the task
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        console.log(xhr.responseText);
    }
  };

  xhr.open("POST", "/change_task_priority/"+taskItem.id, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  let sendData = JSON.stringify(true);
  xhr.send(sendData);
}

// Function to delete a task
function deleteTask() {
  // Get the task item and its parent list
  const taskItem = this.parentNode;
  const parentList = taskItem.parentNode;

  // Animate the task item before removing it from the list
  taskItem.style.transition = "all 0.3s ease-in-out";
  taskItem.style.opacity = "0";
  taskItem.style.transform = "translateX(-50px)";

  setTimeout(() => {
    parentList.removeChild(taskItem);
  }, 300);

  // send XHR Post request to delete the task
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        console.log(xhr.responseText);
    }
  };

  xhr.open("POST", "/delete_task/"+taskItem.id, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  let sendData = JSON.stringify(true);
  xhr.send(sendData);
}

function completeTask () {
  const task = this.parentNode;
  const parentList = this.parentNode.parentNode;
  //parentList.removeChild(task);
  
  task.classList.add('completed-task');

  setTimeout(function() {
    task.classList.add('hidden');
    //parentList.removeChild(task);
  }, 1000);

  setTimeout(function() {
    task.style.top = '70%';
    task.style.left = '70%';
    task.style.backgroundColor = 'blue';
    task.style.background = "greenyellow";
    task.classList.remove('hidden');
  }, 300);

  task.removeChild(this);
  completedList.appendChild(task);

  // send XHR Post request to complete the task
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        console.log(xhr.responseText);
    }
  };

  xhr.open("POST", "/complete_task/"+task.id, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  let sendData = JSON.stringify(true);
  xhr.send(sendData);
}

const openModal = function () {
  
  const taskId = this.parentNode.id;

  // get tasks describing task 
  const taskNameModal = document.querySelector('.task-name-modal');
  const taksCreationDateModal = document.querySelector('.task-creation-date-modal');
  const taskCompletionDateModal = document.querySelector('.task-complition-date-modal');
  const taskDueDateModal = document.querySelector(".task-due-date-modal");

  // get task complet and delete buttons on the modal
  const taskCompleteButtonModal = document.querySelector('.modal-complete-btn');
  const taskDeleteButtonModal = document.querySelector('.modal-delete-btn');
  const taskAddDueDateModal = document.querySelector(".modal-add-due-date-btn")

  // add event listeners to each of the buttons to either complete or delete task
  taskCompleteButtonModal.addEventListener('click', function () {

    closeModal();
    const task = document.querySelector('#'+taskId);
    const event = new Event('click');
    task.children[2].dispatchEvent(event);
  })

  taskDeleteButtonModal.addEventListener('click', function () {

    closeModal();
    const task = document.querySelector('#'+taskId);
    const event = new Event('click');
    task.children[1].dispatchEvent(event);
  })

  taskAddDueDateModal.addEventListener('click', function() {
    let newDueDate = prompt("Enter a new date this task should be completed by: ");
    taskDueDateModal.textContent = 'Due date: ' + newDueDate;

    // file XHR request to change task's due date
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        console.log(xhttp.responseText)
      }
    }

    sendObject = {};
    sendObject.newDueDate = newDueDate;

    xhttp.open("POST", "/change_task_due_date/"+taskId, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    let sendData = JSON.stringify(sendObject);
    xhttp.send(sendData);
  })

  // get task info using XHR Get request
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      let taskInfo = JSON.parse(this.responseText);
      taskNameModal.textContent = taskInfo["name"];
      taksCreationDateModal.textContent = 'Date added: ' + taskInfo["dateUploaded"];
      taskDueDateModal.textContent = 'Due date: ' + taskInfo['dueDate'];
      if (taskInfo.completed == true){
         taskCompletionDateModal.textContent = 'Date completed: ' + taskInfo.completedDate;
      } else {
         taskCompletionDateModal.textContent = 'Date completed: ' + "To be completed";
      }
    }
  }

  xhttp.open("GET", "/get_task/"+taskId, true);
  xhttp.send();

  // show modal elements
  modal.classList.remove('hidden-modal');
  overlay.classList.remove('hidden-modal');
};

const closeModal = function () {
  modal.classList.add('hidden-modal');
  overlay.classList.add('hidden-modal');
  
  // get task complete and delete buttons on the modal
  const taskCompleteButtonModal = document.querySelector('.modal-complete-btn');
  const taskDeleteButtonModal = document.querySelector('.modal-delete-btn');
  const taskAddDueDateModal = document.querySelector(".modal-add-due-date-btn")

  // clone buttons to remove event listners off them
  const myButtonClone = taskCompleteButtonModal.cloneNode(true);
  taskCompleteButtonModal.parentNode.replaceChild(myButtonClone, taskCompleteButtonModal);

  const myButtonClone2 = taskDeleteButtonModal.cloneNode(true);
  taskDeleteButtonModal.parentNode.replaceChild(myButtonClone2, taskDeleteButtonModal);

  const myButtonClone3 = taskAddDueDateModal.cloneNode(true);
  taskAddDueDateModal.parentNode.replaceChild(myButtonClone3, taskAddDueDateModal);
};

// modal elements
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.close-modal');
//const btnsOpenModal = document.querySelectorAll('.show-modal');

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

// add event listener to load tasks when DOM is loaded
document.addEventListener('DOMContentLoaded', loadTasks)

document.addEventListener('keydown', function (e) {
  // console.log(e.key);

  if (e.key === 'Escape' && !modal.classList.contains('hidden-modal')) {
    closeModal();
  }
});

// function to filter tasks in their contianer
function filterTasks (container, option) {

  let list = '';

  // identify list to sort
  if (container == 'Urgent'){
    list = document.querySelector('#urgentList');
  } else if (container == 'Prioritised'){
    list = document.querySelector('#priorityList');
  } else if (container == 'To be done'){
    list = document.querySelector('#toBeDoneList');
  } else if (container == 'Completed'){
    list = document.querySelector('#completedList');
  }

  // empty the list to sort
  list.innerHTML = '';

  // file http request tp get all tasks of selected category
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

      // parse returned json and filter according to the 
      // selected filtering option
      let tasks = JSON.parse(this.responseText);

      // create temporary 2D-array to hold arrays of taskID and sorting parameter
      let tasksToFilter = [];

      // fill temporary 2D array
      for (const key in tasks["tasks"]){
        if(tasks["tasks"].hasOwnProperty(key)){
          task = tasks["tasks"][key];
          if(option == 'a-z'|| option == 'z-a'){
            tasksToFilter.push([task["taskID"], task["name"]])
          } else if (option == 'upload-date'){
            tasksToFilter.push([task["taskID"], task["dateUploaded"]])
          } else if (option == 'due-date'){
            tasksToFilter.push([task["taskID"], task["dueDate"]])
          } else if (option == 'completed-date'){
            tasksToFilter.push([task["taskID"], task["completedDate"]])
          }
        }
      }

      // sort 2D-array using sorting parameter
      if (option == 'a-z'){
        tasksToFilter.sort(function (a,b){return a[1] - b[1]})
      } else if (option == 'z-a'){
        tasksToFilter.sort(function (a,b){return a[1] - b[1]})
        tasksToFilter.reverse()
      } else if (option == 'dateUploaded'||option == 'due-date'||option == 'completed-date'){
        tasksToFilter.sort(function (a,b){return a[1] - b[1]})
      }

      // create task elements and add to the list one by one
      for (let i = 0; i < tasksToFilter.length; i++){
        if(tasks["tasks"].hasOwnProperty(tasksToFilter[i][0])){
          let task = tasks["tasks"][tasksToFilter[i][0]]

          // create div with li for the task
          let newTask = document.createElement('div');
          newTask.classList.add('task');
          newTask.addEventListener('dblclick', moveTask);
          newTask.setAttribute('id', task["taskID"])

          // Create a new list item and add it to the appropriate task list
          const li = document.createElement("li");
          li.textContent = task["name"];
          newTask.appendChild(li);

          // create new trash button to delete the task
          deleteButton = document.createElement("button");
          deleteButton.innerHTML = '<i class="fas fa-trash"></i>'
          deleteButton.classList.add('trash-btn');
          newTask.appendChild(deleteButton);
          deleteButton.addEventListener('click', deleteTask)

          // create new complete button to complete the task and turn it green
          completeButton = document.createElement('button')
          completeButton.innerHTML = '<i class="fas fa-check"></i>';
          completeButton.classList.add('complete-btn');
          newTask.appendChild(completeButton);
          completeButton.addEventListener('click', completeTask)

          // create new more info button to open up modal window for the task
          moreInfoButton = document.createElement('button');
          moreInfoButton.innerHTML = '<i class="fa fa-ellipsis-v"></i>';
          moreInfoButton.classList.add('more-btn');
          newTask.appendChild(moreInfoButton);
          moreInfoButton.addEventListener('click', openModal);

          list.appendChild(newTask);

          // identify what colour to add to the task
          if (container == 'Urgent'){
            newTask.classList.add("red");
          } else if (container == 'Prioritised'){
            newTask.classList.add("yellow");
          } else if (container == 'To be done'){
            newTask.classList.add("yellow-green");
          } else if (container == 'Completed'){
            newTask.classList.add('completed-task');
            newTask.style.background = "greenyellow";
            newTask.removeChild(newTask.querySelector('.complete-btn'))
          }
        }
      }
    }
  }

  xhttp.open("GET", "/get_tasks_category/"+container, true);
  xhttp.send();
}