import ToDoAdder from "./TodoAdder";

export default async function ToDo(){
    const res = await fetch("http:/localhost:3000/api/todos");
    const todos = await res.json();
    console.log(todos);
    return <>
        {todos.map((todo) => {
            return <>
                {todo.id.S}
                {todo.name.S}
                <br></br>
            </>
        })}
        <ToDoAdder></ToDoAdder>
    </>
}