"use client";
import { useSession } from "next-auth/react";
import {
    experimental_useOptimistic as useOptimistic,
    useRef,
    useState,
} from "react";

const addTodo = async (email, title, content) => {
    const res = await fetch("/api/todos", {
        method: "POST",
        body: JSON.stringify({
            email,
            title,
            content,
        }),
    });
    const data = await res.json();
    return data.id;
};

const deleteTodo = async (email, id) => {
    await fetch("/api/todos", {
        method: "DELETE",
        body: JSON.stringify({ email, toDoId: id }),
    });
};

export default function Todo({ initialTodos }) {
    const [todos, setTodos] = useState(initialTodos);
    const [optimisticTodos, setOptimisticTodos] = useOptimistic(todos);
    const formRef = useRef();
    const session = useSession();
    console.log(optimisticTodos);
    return (
        <div className="flex flex-col gap-5 justify-center items-center mt-10">
            {optimisticTodos.map((t) => (
                <div key={t.todo_id} className="flex gap-5">
                    <span>{t.title}</span>
                    <span>{t.content}</span>
                    <button
                        onClick={async () => {
                            setOptimisticTodos((prev) =>
                                prev.filter(
                                    (todo) => todo.todo_id !== t.todo_id
                                )
                            );
                            await deleteTodo(
                                session.data.user.email,
                                t.todo_id
                            );
                            setTodos((prev) =>
                                prev.filter(
                                    (todo) => todo.todo_id !== t.todo_id
                                )
                            );
                        }}
                    >
                        X
                    </button>
                </div>
            ))}
            <form
                onSubmit={async (event) => {
                    event.preventDefault();
                    const formData = new FormData(event.target);
                    const title = formData.get("title");
                    const content = formData.get("content");
                    formRef.current.reset();

                    setOptimisticTodos((prev) => [
                        ...prev,
                        { todo_id: crypto.randomUUID(), title, content },
                    ]);

                    const todoId = await addTodo(
                        session.data.user.email,
                        title,
                        content
                    );
                    setTodos((prev) => [
                        ...prev,
                        { todo_id: todoId, title, content },
                    ]);
                }}
                ref={formRef}
                className="flex flex-col gap-5"
            >
                <input
                    className="border-2 border-gray-500"
                    name="title"
                    placeholder="title"
                ></input>
                <textarea
                    className="border-2 border-gray-500"
                    name="content"
                    placeholder="content"
                ></textarea>
                <input
                    className="border-2 rounded-lg border-gray-500"
                    type="submit"
                ></input>
            </form>
        </div>
    );
}
