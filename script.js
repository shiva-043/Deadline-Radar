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
let dueTodayCount;

let activeValue = 1;
let sortValue = 1;


function renderTodoList(value = activeValue){
    completedCount = 0;
    inCompleteCount = 0;
    overdueCount = 0;
    dueTodayCount = 0;

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

    const filteredList = taskFilter(value)

    let totalHtml = ``
    filteredList.forEach((todoObject) => {

    const html = `
        <article class="task-row">
            <input
                type="checkbox"
                class="complete-check-box js-complete-check-box"
                data-id="${todoObject.id}"
                ${todoObject.completed ? 'checked' : ''}
                aria-label="Mark ${todoObject.name} as complete"
            >

            <div class="task-main">
                <div class="task-name">${todoObject.name}</div>
                <div class="task-deadline">
                    ${deadlineStatus(todoObject.dueDate)}
                </div>
            </div>

            <div class="task-hours">
                ${todoObject.estimatedHours || '—'} <span>hours</span>
            </div>

            <span class="priority-badge priority-${todoObject.priority}">
                ${{1: 'General', 2: 'Important', 3: 'Urgent'}[todoObject.priority] || 'No priority'}
            </span>

            <div class="task-actions">
                <button class="edit-button js-edit-button"
                    data-id="${todoObject.id}">Edit</button>
                <button class="delete-todo-button js-delete-todo-button"
                    data-id="${todoObject.id}">Delete</button>
            </div>
        </article>
    `;

    totalHtml += html;
    });


    document.querySelector('.js-todo-list').innerHTML = totalHtml;

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

    document.querySelectorAll('.js-tasks-card').
    forEach(taskCard =>{
        taskCard.addEventListener('click',()=>{
            const value = Number(taskCard.dataset.value) || 1;
            activeValue = value
            renderTodoList(value)

            document.querySelector('.js-todo-list').scrollIntoView({
                behavior: 'smooth',
                block : 'start'
            })
        })
    })
    renderDeadlineRadar();
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
    
    //edge case for estimatedHours
    if (estimatedHoursElement.value < 0) estimatedHoursElement.value = '-';

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

    document.querySelector('.js-add-task').scrollIntoView({
        behavior: 'smooth',
        block : 'center'
    })
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
        const days = daysRemaining(todoElement.dueDate)
        inCompleteCount += 1
        if (days == 0)  dueTodayCount += 1
        if (days < 0) // nan will not run make this conditon run
            overdueCount += 1
    }
}
function writeStatistics(){
    const html = `
    <div class="tasks-count-card js-tasks-card" data-value="4">
        <div class="tasks-description">New tasks to complete </div>
        <div class="tasks-count">${inCompleteCount-overdueCount-dueTodayCount}</div> 
    </div>
    <div class="tasks-count-card js-tasks-card" data-value="1">
        <div class="tasks-description">Incomplete Tasks</div>
        <div class="tasks-count">${inCompleteCount} </div> 
    </div>
    <div class="tasks-count-card js-tasks-card" data-value="2">
        <div class="tasks-description">Overdue Tasks </div>
        <div class="tasks-count">${overdueCount} </div> 
    </div>
    <div class="tasks-count-card js-tasks-card" data-value="3">
        <div class="tasks-description">Completed Tasks </div>
        <div class="tasks-count"> ${completedCount} </div> 
    </div>`
    document.querySelector('.js-statistics').innerHTML = html;
}

document.querySelector('.js-filter-tasks').addEventListener('change',()=>{
    const value = Number(document.querySelector('.js-filter-tasks').value) || 1
    activeValue = value
    renderTodoList(value)
    document.querySelector('.js-todo-list').scrollIntoView({
        behavior: 'smooth',
        block : 'start'
    })
})
document.querySelector('.js-sort').addEventListener('change',()=>{
    sortValue = Number(document.querySelector('.js-sort').value) || 1 
    renderTodoList()
    document.querySelector('.js-todo-list').scrollIntoView({
        behavior: 'smooth',
        block : 'start'
    })
})
function taskFilter(value,sort=sortValue){
    // <option value="1">Incomplete Tasks</option>
    // <option value="2">OverDue Tasks</option>
    // <option value="3">Completed Tasks</option>
    // <option value="4">Future Tasks</option>
    // <option value="5">Today's Tasks</option>
    let ans = []
    todoList.forEach(todoElement =>{
        if (todoElement.completed === true){
            if (value === 3) ans.push(todoElement)
        }
        else{
            const days = daysRemaining(todoElement.dueDate)
            if(value === 1)  ans.push(todoElement)
            
            if (days < 0){ if(value === 2)  ans.push(todoElement) }
            if (days > 0){ if(value === 4)  ans.push(todoElement) }
            if (days === 0){ if(value === 5)  ans.push(todoElement) }
        }
    })
    if (sort == 2)  ans.sort((a,b) => deadScore(b)-deadScore(a))
    else if (sort == 1)    ans.sort((a,b) => daysRemaining(a.dueDate)-daysRemaining(b.dueDate))
    else {console.log("No sorting")}
    return ans
}

function renderDeadlineRadar() {
    const board = document.querySelector('.js-radar-board');
    const overdueBox = document.querySelector('.js-radar-overdue');

    if (!board || !overdueBox) return;

    // Remove the previous render's dots and empty message.
    board.querySelectorAll('.radar-dot, .radar-empty')
        .forEach(element => element.remove());

    overdueBox.innerHTML = '';

    const upcomingTasks = [];
    const overdueTasks = [];

    todoList.forEach(task => {
        // Completed tasks don't appear on the radar.
        if (task.completed) return;

        const days = daysRemaining(task.dueDate);

        // Ignore empty or invalid dates.
        if (Number.isNaN(days)) return;

        if (days < 0) {
            overdueTasks.push(task);
        } else {
            upcomingTasks.push({
                ...task,
                daysToDue: days
            });
        }
    });

    // Show nearer deadlines first in the rendering order.
    upcomingTasks.sort((a, b) => a.daysToDue - b.daysToDue);

    upcomingTasks.forEach((task, index) => {
        // Spread dots around the circle.
        const angle = index * 137.5 * (Math.PI / 180);

        // Near deadlines stay near the centre.
        // 0 days = 17%; 14 days = 45%.
        let radius;
        if (task.daysToDue <=14)
            radius = 17 + (task.daysToDue / 14) * 28;
        else
            radius = 48

        const x = 50 + Math.cos(angle) * radius;
        const y = 50 + Math.sin(angle) * radius;

        const dot = document.createElement('button');
        dot.type = 'button';

        const priority = Number(task.priority) || 1;

        dot.className = `radar-dot radar-priority-${priority}`;
        dot.style.left = `${x}%`;
        dot.style.top = `${y}%`;


        dot.title = `${task.name} — ${deadlineStatus(task.dueDate)}`;
        dot.setAttribute('aria-label', dot.title);
        dot.dataset.taskId = task.id;

        dot.addEventListener('click', () => {
            const selectedTask = todoList.find(
                item => item.id === dot.dataset.taskId
            );

            if (!selectedTask) return;

            document.querySelector('.js-radar-task-name').textContent =
                selectedTask.name;

            document.querySelector('.js-radar-task-deadline').textContent =
                deadlineStatus(selectedTask.dueDate);

            const priorityNames = {
                1: 'General',
                2: 'Important',
                3: 'Urgent'
            };

            const priority = priorityNames[Number(selectedTask.priority)] || 'No priority';

            document.querySelector('.js-radar-task-meta').textContent =
                `${priority} · ${selectedTask.estimatedHours || '—'} hours`;
        });
        board.appendChild(dot);
    });


    // Show overdue tasks separately, rather than placing
    // negative-day tasks on the circular radar.
    overdueTasks.sort(
        (a, b) => daysRemaining(a.dueDate) - daysRemaining(b.dueDate)
    );

    if (overdueTasks.length === 0) {
        overdueBox.textContent = 'No overdue tasks. Niceee!!';
    } else {
        const list = document.createElement('ul');

        overdueTasks.forEach(task => {
            const item = document.createElement('li');

            item.textContent =
                `${task.name} — ${deadlineStatus(task.dueDate)}`;

            list.appendChild(item);
        });

        overdueBox.appendChild(list);
    }
}


renderTodoList();
