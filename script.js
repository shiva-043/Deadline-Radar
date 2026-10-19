const todoList = JSON.parse(localStorage.getItem('todoList')) || [{
    name: 'WashDish',
    dueDate: '2026-12-10',
    completed: false,
    priority : 1,
    estimatedHours: 3
},{
    name: 'Complete it as much as you can',
    dueDate: '2026-11-16',
    completed: true,
    priority : 2,
    estimatedHours: 4
}]

renderTodoList();

function renderTodoList(){
    let todoListHtml =``
    let completedListHtml = ``
    todoList.forEach((todoObject,index) => {
        const html = `
        <div >${todoObject.name}</div>
        <div >${todoObject.dueDate}</div>
        <div >${todoObject.estimatedHours}</div>
        <div >${todoObject.priority}</div>
        <button class = 'edit-button js-edit-button' data-index = "${index}">Edit </button>
        <button class = 'delete-todo-button js-delete-todo-button' data-index = "${index}">DELETE</button>
        <label> Task Complete
            <input type="checkbox" class = 'complete-check-box js-complete-check-box' data-index = "${index}" ${todoObject.completed ? 'checked' : ''}>
        </label>
        `;

        if (todoObject.completed == false)
            todoListHtml += html;
        else
            completedListHtml += html;
    });
    document.querySelector('.js-todo-list').innerHTML = todoListHtml;
    
    document.querySelector('.js-completed-list').innerHTML = completedListHtml;

    document.querySelectorAll('.js-delete-todo-button').
        forEach((deleteButton)=>{
            deleteButton.addEventListener('click',()=>{
                const index = Number(deleteButton.dataset.index);
                todoList.splice(index,1);
                saveList();
                renderTodoList();
            });
        });
    
    document.querySelectorAll('.js-complete-check-box').
        forEach((checkElement)=>{
            checkElement.addEventListener('change',()=>{
                const index = Number(checkElement.dataset.index);
                todoList[index].completed = !todoList[index].completed;
                saveList();
                renderTodoList();
            });
        })
    document.querySelectorAll('.js-edit-button').
        forEach((editElement) => {
            editElement.addEventListener('click',()=>{
                const index = Number(editElement.dataset.index);
                editTodo(index);
            })
        });
}

document.querySelector('.js-add-todo-button').addEventListener('click', () => {
    addTodo(null);
});

let editIndex = null;
function addTodo(){
    const nameElement = document.querySelector('.js-name-input');
    const dueDateElement = document.querySelector('.js-due-date-input');
    const estimatedHoursElement = document.querySelector('.js-estimatedHours-input');
    const priorityElement = document.querySelector('.js-priority-input');

    if (editIndex === null){
        if (nameElement.value.trim() !== ''){
            todoList.push({
                name: nameElement.value,
                dueDate: dueDateElement.value,
                completed: false,
                priority: priorityElement.value,
                estimatedHours: estimatedHoursElement.value
            });
        }
    }
    else{
        todoList[editIndex].name =  nameElement.value;
        todoList[editIndex].dueDate= dueDateElement.value;
        todoList[editIndex].completed= false;
        todoList[editIndex].priority= priorityElement.value;
        todoList[editIndex].estimatedHours= estimatedHoursElement.value;
        editIndex = null;
    }

    saveList();
    renderTodoList();

    nameElement.value = '';
    dueDateElement.value = '';
    estimatedHoursElement.value = '';
    priorityElement.value = '';
}
function editTodo(index){
    document.querySelector('.js-name-input').value = todoList[index].name;
    document.querySelector('.js-due-date-input').value = todoList[index].dueDate;
    document.querySelector('.js-estimatedHours-input').value = todoList[index].estimatedHours;
    document.querySelector('.js-priority-input').value = todoList[index].priority;
    
    editIndex = index;
}

function saveList(){
    localStorage.setItem('todoList',JSON.stringify(todoList));
}
