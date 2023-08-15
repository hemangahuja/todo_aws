import { revalidatePath } from "next/cache"

export default function ToDoAdder(){
    async function addTodo(formData){
        'use server'
         const res = await fetch("http:/localhost:3000/api/todos",{
            method : "POST",
            body : JSON.stringify({
                id : formData.get("id"),
                name : formData.get("name")
            })
         })
         if(res.ok){
            revalidatePath("/");
         }
    }
    return <form action={addTodo}>
        <input name="id"></input>
        <input name="name"></input>
        <input type="submit"></input>
    </form>
}