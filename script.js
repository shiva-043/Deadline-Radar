const todoList = JSON.parse(localStorage.getItem('todoList')) || [{
    name: 'WashDish',
    dueDate: '12-12-2027'
},{
    name: 'Complete it as much as you can',
    dueDate: '12-12-2026'
}]

renderTodoList();

function renderTodoList(){
    let todoListHtml =``
    todoList.forEach((todoObject,index) => {
        const html = `
        <div >${todoObject.name}</div>
        <div  >${todoObject.dueDate}</div>
        <button class = 'delete-todo-button js-delete-todo-button' >Delete</button>
        `;
        todoListHtml += html;
    });
    document.querySelector('.js-todo-list').innerHTML = todoListHtml;

    document.querySelectorAll('.js-delete-todo-button').
        forEach((deleteButton,index)=>{
            deleteButton.addEventListener('click',()=>{
                todoList.splice(index,1);
                saveList();
                renderTodoList();
            });
        });
}

document.querySelector('.js-add-todo-button').addEventListener('click', () => {
    addTodo();
});

function addTodo(){
    const name = document.querySelector('.js-name-input').value;
    const dueDate = document.querySelector('.js-due-date-input').value;

    todoList.push({
        name: name,
        dueDate: dueDate
    });

    saveList();
    renderTodoList();

    document.querySelector('.js-name-input').value = '';
    document.querySelector('.js-due-date-input').value = '';
}

function saveList(){
    localStorage.setItem('todoList',JSON.stringify(todoList));
}
