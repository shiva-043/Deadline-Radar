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

let completedCount;
let inCompleteCount;
let overdueCount;

function renderTodoList(){
    completedCount = 0;
    inCompleteCount = 0;
    overdueCount = 0;

    let completedTasks = []
    let inCompleteTasks = []
    todoList.forEach(todoElement=>{
        if (todoElement.completed == true)
            completedTasks.push(todoElement)
        else
            inCompleteTasks.push(todoElement)

        countStatistics(todoElement)
    })
    writeStatistics();
    inCompleteTasks.sort((a,b) => deadScore(b)-deadScore(a))
    completedTasks.sort((a,b) => deadScore(a)-deadScore(b)) // CHANGE this to show as ordered based on date of completion - by storing the its completed 

    const filteredList = taskFilter()

    let totalHtml = ``
    filteredList.forEach((todoObject) => {
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
        `
        totalHtml += html;
    });

    let completedListHtml = ``
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

    document.querySelector('.js-todo-list').innerHTML = totalHtml;
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
                todoList[index].completed = !todoList[index].completed;
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
function countStatistics(todoElement){
    if (todoElement.completed === true)
        completedCount += 1
    else{
        inCompleteCount += 1
        if (daysRemaining(todoElement.dueDate) < 0) // nan will not run make this conditon run
            overdueCount += 1
    }
}
function writeStatistics(){
    html = `
    <div>New tasks to complete---->${inCompleteCount-overdueCount}</div>
    <div>Tasks to Complete---->${inCompleteCount} </div>
    <div>Overdue Tasks---->${overdueCount} </div>
    <div>Completed taks---->${completedCount} </div>`
    document.querySelector('.js-statistics').innerHTML = html;
}

document.querySelector('.js-filter-tasks').addEventListener('change',()=>{
    renderTodoList()
})
function taskFilter(){
    // <option value="1">Incomplete Tasks</option>
    // <option value="2">OverDue Tasks</option>
    // <option value="3">Completed Tasks</option>
    // <option value="4">Future Tasks</option>
    // <option value="5">Today's Tasks</option>
    value = Number(document.querySelector('.js-filter-tasks').value) || 1
    let ans = []
    todoList.forEach(todoElement =>{
        if (todoElement.completed === true){
            if (value === 3) ans.push(todoElement)
        }
        else{
            days = daysRemaining(todoElement.dueDate)
            if(value === 1)  ans.push(todoElement)
            
            if (days < 0){ if(value === 2)  ans.push(todoElement) }
            if (days > 0){ if(value === 4)  ans.push(todoElement) }
            if (days === 0){ if(value === 5)  ans.push(todoElement) }
        }
    })
    ans.sort((a,b) => deadScore(b)-deadScore(a))
    return ans
}
renderTodoList();