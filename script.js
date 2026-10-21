const todoList = JSON.parse(localStorage.getItem('todoList')) || [{
    id: crypto.randomUUID(),
    name: 'WashDish',
    dueDate: '2026-12-10',
    completed: false,
    priority : 1,
    estimatedHours: 3
},{
    id: crypto.randomUUID(),
    name: 'Complete it as much as you can',
    dueDate: '2026-11-16',
    completed: true,
    priority : 2,
    estimatedHours: 4
}]

renderTodoList();

function renderTodoList(){
    let completedTasks = []
    let inCompleteTasks = []
    todoList.forEach(todoElement=>{
        if (todoElement.completed == true)
            completedTasks.push(todoElement)
        else
            inCompleteTasks.push(todoElement)
    })
    inCompleteTasks.sort((a,b) => deadScore(b)-deadScore(a))
    // change this to show as ordered based on date of completion - by storing the its completed 
    completedTasks.sort((a,b) => deadScore(a)-deadScore(b))

    let todoListHtml =``
    let completedListHtml = ``
    inCompleteTasks.forEach((todoObject) => {
        const html = `
        <div >${todoObject.name}</div>
        <div >${deadlineStatus(todoObject.dueDate)}</div>
        <div >${todoObject.estimatedHours}</div>
        <div >${todoObject.priority}</div>
        <button class = 'edit-button js-edit-button' data-id = "${todoObject.id}">Edit </button>
        <button class = 'delete-todo-button js-delete-todo-button' data-id = "${todoObject.id}">DELETE</button>
        <label> Task Complete
            <input type="checkbox" class = 'complete-check-box js-complete-check-box' data-id = "${todoObject.id}" ${todoObject.completed ? 'checked' : ''}>
        </label>
        `;

        todoListHtml += html;
    });
    completedTasks.forEach((todoObject) => {
        const html = `
        <div >${todoObject.name}</div>
        <div >${deadlineStatus(todoObject.dueDate)}</div>
        <div >${todoObject.estimatedHours}</div>
        <div >${todoObject.priority}</div>
        <button class = 'edit-button js-edit-button' data-id = "${todoObject.id}">Edit </button>
        <button class = 'delete-todo-button js-delete-todo-button'  data-id = "${todoObject.id}">DELETE</button>
        <label> Task Complete
            <input type="checkbox" class = 'complete-check-box js-complete-check-box'  data-id = "${todoObject.id}" ${todoObject.completed ? 'checked' : ''}>
        </label>
        `;

        completedListHtml += html;
    });

    document.querySelector('.js-todo-list').innerHTML = todoListHtml;
    document.querySelector('.js-completed-list').innerHTML = completedListHtml;

    document.querySelectorAll('.js-delete-todo-button').
        forEach((deleteButton)=>{
            deleteButton.addEventListener('click',()=>{
                const id = deleteButton.dataset.id;
                const index = todoList.findIndex(todo => todo.id === id);
                if (index === -1){
                    console.log("Not found error")
                    return 
                }
                todoList.splice(index,1);
                saveList();
                renderTodoList();
            });
        });
    
    document.querySelectorAll('.js-complete-check-box').
        forEach((checkElement)=>{
            checkElement.addEventListener('change',()=>{
                const id = checkElement.dataset.id;
                const index = todoList.findIndex(todoElement => todoElement.id === id);
                if (index === -1){
                    console.log("Not found error")
                    return 
                }
                // todoList[index].completed = !todoList[index].completed;
                todoList[index].completed = !todoList[index].checked;
                saveList();
                renderTodoList();
            });
        })
    document.querySelectorAll('.js-edit-button').
        forEach((editElement) => {
            editElement.addEventListener('click',()=>{
                const id = editElement.dataset.id;
                editTodo(id);
            })
        });
}

document.querySelector('.js-add-todo-button').addEventListener('click', () => {
    addTodo();
});

let editId = null;
function addTodo(){
    const nameElement = document.querySelector('.js-name-input');
    const dueDateElement = document.querySelector('.js-due-date-input');
    const estimatedHoursElement = document.querySelector('.js-estimatedHours-input');
    const priorityElement = document.querySelector('.js-priority-input');

    if (editId === null){
        if (nameElement.value.trim() !== ''){
            todoList.push({
                id: crypto.randomUUID(),
                name: nameElement.value,
                dueDate: dueDateElement.value,
                completed: false,
                priority: priorityElement.value,
                estimatedHours: estimatedHoursElement.value
            });
        }
    }
    else{
        // no change for todoList[editIndex]id
        const editIndex = todoList.findIndex(todoElement => todoElement.id === editId);
        todoList[editIndex].name =  nameElement.value;
        todoList[editIndex].dueDate= dueDateElement.value;
        todoList[editIndex].completed= false;
        todoList[editIndex].priority= priorityElement.value;
        todoList[editIndex].estimatedHours= estimatedHoursElement.value;
        editId = null;
    }

    saveList();
    renderTodoList();

    nameElement.value = '';
    dueDateElement.value = '';
    estimatedHoursElement.value = '';
    priorityElement.value = '';
}
function editTodo(id){
    const index = todoList.findIndex(todoElement => todoElement.id === id);
    if (index === -1){
        console.log("Not found error")
        editId = null;
        return 
    }
    editId = id;
    document.querySelector('.js-name-input').value = todoList[index].name;
    document.querySelector('.js-due-date-input').value = todoList[index].dueDate;
    document.querySelector('.js-estimatedHours-input').value = todoList[index].estimatedHours;
    document.querySelector('.js-priority-input').value = todoList[index].priority;
}
function saveList(){
    localStorage.setItem('todoList',JSON.stringify(todoList));
}
function deadlineStatus(deadlineString){
    if (!deadlineString || deadlineString.trim() === ""){
        return "No Deadline";
    }
    const days = daysRemaining(deadlineString)
    if(Number.isNaN(days)){
        return "Invalid Date"
    }

    if (days <0){
        return `Overdue by ${Math.abs(days)} days`
    }else if (days === 0){
        return `Due Today!`
    }else if (days === 1){
        return `Due Tomorrow`
    }
    return `Due in ${days} days`
}
function daysRemaining(deadlineString){
    const today = new Date()
    const deadline = new Date(deadlineString)
    if (Number.isNaN(deadline.getTime())){
        return NaN;
    }
    
    today.setHours(0,0,0,0);
    deadline.setHours(0,0,0,0);

    const days = (deadline-today)/(1000*60*60*24)

    return days
}
function deadScore(todoElement){ 

    let priority= todoElement.priority
    //assign defaults
    let hours=0 
    let dueDays=9

    const temp = daysRemaining(todoElement.dueDate);
    if (!Number.isNaN(temp))
        dueDays = temp
    if (!Number.isNaN(todoElement.estimatedHours))
        hours = todoElement.estimatedHours

    let score = 0;
    if (dueDays < -8 && priority == 1)
        score = 9
    else if (dueDays < 0)
        score =  10 - dueDays + Math.round(hours/2)
    else if (dueDays == 0)
        score += 10-dueDays + Math.round(hours/0.8)
    else if (dueDays <= 8) 
        score += 10-dueDays + Math.round(hours/dueDays)
    else
        score = 1 + Math.round(hours/9)
    
    score *= priority
    return score
}

// const sortedIncompleteTasks = [...todoList].filter(todoElement => todoElement.completed === false).sort((a, b) => deadScore(b) - deadScore(a));

// console.log(sortedIncompleteTasks); // [1, 2, 5, 9]
// console.log(todoList);        // [5, 2, 9, 1] (unchanged)

