const dayjs = require("dayjs");
//import dayjs from 'dayjs' // ES 2015

// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
  let taskId = nextId || 1; // Default to 1 if nextID doesn't exist
  nextId++; // Increment the next ID for the following task
  localStorage.setItem("nextId", JSON.stringify(nextId)); // Save the new nextId to localStorage
  return taskId; // Return the generated taskId
}

// Todo: create a function to create a task card
function createTaskCard(task) {
  const taskCard = $("<div>")
    .addClass("card project-card draggable my-3")
    .attr("data-project-id", project.id);
  const cardHeader = $("<div>").addClass("card-header h4").text(project.name);
  const cardBody = $("<div>").addClass("card-body");
  const cardDescription = $("<p>").addClass("card-text").text(project.type);
  const cardDueDate = $("<p>").addClass("card-text").text(project.dueDate);
  const cardDeleteBtn = $("<button>")
    .addClass("btn btn-danger delete")
    .text("Delete")
    .attr("data-project-id", project.id);
  cardDeleteBtn.on("click", handleDeleteProject);

  // ? Sets the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
  if (project.dueDate && project.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(project.dueDate, "DD/MM/YYYY");

    // ? If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskDueDate, "day")) {
      taskCard.addClass("bg-warning text-white");
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass("bg-danger text-white");
      cardDeleteBtn.addClass("border-light");
    }
  }

  // ? Gather all the elements created above and append them to the correct elements.
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  // ? Return the card so it can be appended to the correct lane.
  return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    const tasks = readTasksFromStorage();

    // Empty existing task cards out of the lanes
    const todoList = $('#todo-cards');
    todoList.empty();
  
    const inProgressList = $('#in-progress-cards');
    inProgressList.empty();
  
    const doneList = $('#done-cards');
    doneList.empty();
  
    // Loop through tasks and create task cards for each status
    for (let task of tasks) {
      if (project.status === 'to-do') {
        todoList.append(createTaskCard(task));
      } else if (project.status === 'in-progress') {
        inProgressList.append(createTaskCard(task));
      } else if (project.status === 'done') {
        doneList.append(createProjectCard(task));
      }
    }
  
    // Use JQuery UI to make task cards draggable
    $('.draggable').draggable({
      opacity: 0.7,
      zIndex: 100,
      // This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
      helper: function (e) {
        // Check if the target of the drag event is the card itself or a child element. 
        // If it is the card itself, clone it, otherwise find the parent card that is draggable and clone that.
        const original = $(e.target).hasClass('ui-draggable')
          ? $(e.target)
          : $(e.target).closest('.ui-draggable');
        // Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
        return original.clone().css({
          width: original.outerWidth(),
        });
      },
    });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {

}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {

}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
     // ? Read projects from localStorage
  const projects = readProjectsFromStorage();

  // ? Get the project id from the event
  const taskId = ui.draggable[0].dataset.projectId;

  // ? Get the id of the lane that the card was dropped into
  const newStatus = event.target.id;

  for (let project of projects) {
    // ? Find the project card by the `id` and update the project status.
    if (project.id === taskId) {
      project.status = newStatus;
    }
  }
  // ? Save the updated projects array to localStorage (overwritting the previous one) and render the new project data to the screen.
  localStorage.setItem('projects', JSON.stringify(projects));
  printProjectData();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList()
  $("#task-due-date").datepicker(); // Initialize datepicker
});

dayjs().format();
