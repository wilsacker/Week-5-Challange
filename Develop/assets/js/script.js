const taskTitleInputEl = $("#task-title");
const taskDueDateInputEl = $("#task-due-date");
const taskDescInputEl = $("#task-desc");

// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  nextId = nextId || 1; // Default to 1 if nextId doesn't exist
  const taskId = nextId; // Assign current nextId to taskId
  nextId++; // Increment nextId for the next task
  localStorage.setItem("nextId", JSON.stringify(nextId)); // Save the new nextId to localStorage
  console.log("next id saved:", nextId);
  return taskId; // Return the unique taskId
}

// Accepts an array of projects, stringify's them, and saves them in localStorage.
function saveTasksToStorage(taskList) {
  localStorage.setItem("tasks", JSON.stringify(taskList)); // Save taskList
  console.log("Saved tasks list:", taskList); // Debugging check
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
    title: taskTitle,
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
  $("#formModal").modal("hide");
}

// Function to create a task card
function createTaskCard(task) {
  const taskCard = $("<div>")
    .addClass("card project-card draggable my-3")
    .attr("data-task-id", task.id);
  const cardHeader = $("<div>").addClass("card-header h4").text(task.title);
  const cardBody = $("<div>").addClass("card-body");
  const cardDescription = $("<p>").addClass("card-text").text(task.desc);
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

  // Re-initialize draggable after rendering task cards
  makeDraggable();
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(this).attr("data-task-id");
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
  // Read tasks from localStorage
  const taskList = JSON.parse(localStorage.getItem("tasks")) || [];

  // Get the project id from the event
  const taskId = ui.draggable[0].dataset.taskId;

  console.log("Dropped task ID:", taskId);

  // Get the id of the lane that the card was dropped into
  const newStatus = event.target.id;

  for (let task of taskList) {
    // Find the project card by the `id` and update the project status.
    if (task.id === taskId) {
      task.status = newStatus;
      break;
    }
  }

  // Save the updated tasks array to localStorage (overwriting the previous one) and render the new taskList data to the screen.
  localStorage.setItem("tasks", JSON.stringify(taskList));

  renderTaskList();
}

// Make task cards draggable
function makeDraggable() {
  $(".draggable").draggable({
    revert: "invalid", // If dropped outside a lane, the item goes back to its original position
    helper: "clone", // Creates a visual clone when dragging
    zIndex: 100, // Ensures the dragged item is above other elements
    opacity: 0.7, // Transparency while dragging
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
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  // Initialize datepicker
  $("#task-due-date").datepicker();

  // Attach the submit event handler
  $("#add-task-form").on("submit", handleAddTask);

  // Make lanes droppable
  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });
});