import { getServerSession } from "next-auth";
import ToDoAdder from "./TodoAdder";
import options from "../lib/auth/options";

export default async function ToDo() {
    const session = await getServerSession(options);
    const res = await fetch(
        `http://localhost:3000/api/todos?email=${session.user.email}`
    );
    const todos = await res.json();
    console.log(todos);
    console.log(session);
    return (
        <ToDoAdder
            initialTodos={todos.map((todo) => {
                return {
                    todo_id: todo.todo_id,
                    title: todo.title,
                    content: todo.content,
                };
            })}
        ></ToDoAdder>
    );
}
