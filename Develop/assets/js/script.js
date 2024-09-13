const taskTitleInputEl = $("#task-title");
const taskDueDateInputEl = $("#task-due-date");
const taskDescInputEl = $("#task-desc");

// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Function to generate a unique task id
function generateTaskId() {
  let taskId = nextId || 1; // Default to 1 if nextID doesn't exist
  nextId++; // Increment the next ID for the following task
  localStorage.setItem("nextId", JSON.stringify(nextId)); // Save the new nextId to localStorage
  console.log("nextId Saved");
  return taskId; // Return the generated taskId
}

// Accepts an array of projects, stringifys them, and saves them in localStorage.
function saveTasksToStorage(taskList) {
  localStorage.setItem("tasks", JSON.stringify(taskList)); // Save taskList
  console.log("Saved tasks list:", taskList); // Debugging check
}

// Function to read tasks from local storage
function readTasksFromStorage() {
  // Retrieve projects from localStorage and parse the JSON to an array.
  // We use `let` here because there is a chance that there are no projects in localStorage (which means the projects variable will be equal to `null`) and we will need it to be initialized to an empty array.
  let tasks = JSON.parse(localStorage.getItem("tasks"));

  // If no projects were retrieved from localStorage, assign projects to a new empty array to push to later.
  if (!tasks) {
    tasks = [];
  }

  // Return the projects array either empty or with data in it whichever it was determined to be by the logic right above.
  return tasks;
}

// Function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();
  
    console.log("handle add task function called");
  
    // Read user input from the form
    const taskTitle = taskTitleInputEl.val().trim();
    const taskDueDate = taskDueDateInputEl.val(); // yyyy-mm-dd format
    const taskDesc = taskDescInputEl.val(); // don't need to trim select input
  
    if (!taskTitle || !taskDueDate) {
      console.error("All fields must be filled out");
      return; // Prevent adding task if title or date fields are empty
    }
  
    const newTask = {
      name: taskTitle,
      dueDate: taskDueDate,
      desc: taskDesc,
      status: "to-do",
      id: generateTaskId(),
    };
  
    // Retrieve task list from localStorage (or initialize it as an empty array)
    let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
  
    // Add the new task to the list
    taskList.push(newTask);
  
    // Save the updated task list back to localStorage using saveTasksToStorage
    saveTasksToStorage(taskList); // Use the helper function
  
    // Re-render the task list to update the UI
    renderTaskList();
  
    // Close the modal after submission
    $("#formModal").modal('hide');
  }

// Function to create a task card
function createTaskCard(task) {
  const taskCard = $("<div>")
    .addClass("card project-card draggable my-3")
    .attr("data-task-id", task.id);
  const cardHeader = $("<div>").addClass("card-header h4").text(task.name);
  const cardBody = $("<div>").addClass("card-body");
  const cardDescription = $("<p>").addClass("card-text").text(task.type);
  const cardDueDate = $("<p>").addClass("card-text").text(task.dueDate);
  const cardDeleteBtn = $("<button>")
    .addClass("btn btn-danger delete")
    .text("Delete")
    .attr("data-task-id", task.id);
  cardDeleteBtn.on("click", handleDeleteTask);

  // Sets the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
  if (task.dueDate && task.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");

    // If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskDueDate, "day")) {
      taskCard.addClass("bg-warning text-white");
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass("bg-danger text-white");
      cardDeleteBtn.addClass("border-light");
    }
  }

  // Gather all the elements created above and append them to the correct elements.
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  // Return the card so it can be appended to the correct lane.
  return taskCard;
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(this).attr("data-project-id");
  const taskList = JSON.parse(localStorage.getItem("tasks")) || [];

  // Remove project from the array. There is a method called `filter()` for this that is better suited which we will go over in a later activity. For now, we will use a `forEach()` loop to remove the project.
  taskList.forEach((task) => {
    if (task.id === taskId) {
      task.splice(tasks.indexOf(task), 1);
    }
  });

  // We will use our helper function to save the tasks to localStorage
  saveTasksToStorage(tasks);

  // Here we use our other function to render tasks back to the screen
  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  // Read projects from localStorage
  const projects = readProjectsFromStorage();

  // Get the project id from the event
  const taskId = ui.draggable[0].dataset.projectId;

  // Get the id of the lane that the card was dropped into
  const newStatus = event.target.id;

  for (let task of tasks) {
    // Find the project card by the `id` and update the project status.
    if (task.id === taskId) {
      task.status = newStatus;
    }
  }
  // Save the updated tasks array to localStorage (overwritting the previous one) and render the new project data to the screen.
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  const taskList = JSON.parse(localStorage.getItem("tasks")) || [];

  const todoList = document.getElementById("todo-cards");
  const inProgressList = document.getElementById("in-progress-cards");
  const doneList = document.getElementById("done-cards");

  // Clear existing task cards in all lanes
  todoList.innerHTML = "";
  inProgressList.innerHTML = "";
  doneList.innerHTML = "";

  // Loop through tasks and place them in the correct lane
  taskList.forEach((task) => {
    const taskCard = createTaskCard(task); // Create task card

    if (task.status === "to-do") {
      todoList.appendChild(taskCard[0]);
    } else if (task.status === "in-progress") {
      inProgressList.appendChild(taskCard[0]);
    } else if (task.status === "done") {
      doneList.appendChild(taskCard[0]);
    }
  });
}

// Use JQuery UI to make task cards draggable
$(".draggable").draggable({
  opacity: 0.7,
  zIndex: 100,
  // This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
  helper: function (e) {
    // Check if the target of the drag event is the card itself or a child element.
    // If it is the card itself, clone it, otherwise find the parent card that is draggable and clone that.
    const original = $(e.target).hasClass("ui-draggable")
      ? $(e.target)
      : $(e.target).closest(".ui-draggable");
    // Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
    return original.clone().css({
      width: original.outerWidth(),
    });
  },
});

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();
  $("#task-due-date").datepicker(); // Initialize datepicker
  $("#add-task-form").on("submit", handleAddTask); // Attach the submit event handler
});

dayjs().format();
