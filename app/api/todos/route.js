
import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
const client = new DynamoDBClient({})
const todoTableName = "todos";
const userTodoTableName = "users";

// Insert a new todo
async function insert(email, title, content) {
    const todoId = uuidv4();

    // Insert into TodoTable
    const todoParams = {
        TableName: todoTableName,
        Item: marshall({
            todo_id: todoId,
            title: title,
            content: content
        })
    };
    await client.send(new PutItemCommand(todoParams));

    // Update UserTodoTable
    const userTodoParams = {
        TableName: userTodoTableName,
        Key: marshall({
            id: email
        }),
        UpdateExpression: "ADD todo_ids :todoId",
        ExpressionAttributeValues: marshall({
            ":todoId": new Set([todoId])
        })
    };
    await client.send(new UpdateItemCommand(userTodoParams));

    return todoId;
}

// Get all todos for a user
async function get(email) {
    const params = {
        TableName: userTodoTableName,
        Key: marshall({
            id: email
        })
    };
    console.log(params);
    const result = await client.send(new GetItemCommand(params));
    console.log(result.Item.todo_ids);
    if (result.Item && result.Item.todo_ids) {
        const todoIds = result.Item.todo_ids.SS;
        const todos = await Promise.all(todoIds.map(async (todoId) => {
            const todoDetails = await getTodoDetails(todoId);
            return {
                todo_id: todoId,
                title: todoDetails.title,
                content: todoDetails.content
            };
        }));
        return todos;
    }
    return [];
}

// Delete a todo for a user
async function deleteTodo(email, todoId) {
    // Remove todo_id from todo_ids list in UserTodoTable
    const userTodoParams = {
        TableName: userTodoTableName,
        Key: marshall({
            id: email
        }),
        UpdateExpression: "DELETE todo_ids :todoId",
        ExpressionAttributeValues: marshall({
            ":todoId": new Set([todoId])
        })
    };
    await client.send(new UpdateItemCommand(userTodoParams));

    // Delete from TodoTable
    const todoParams = {
        TableName: todoTableName,
        Key: marshall({
            todo_id: todoId
        })
    };
    await client.send(new DeleteItemCommand(todoParams));
}

// Get todo details by ID
async function getTodoDetails(todoId) {
    const params = {
        TableName: todoTableName,
        Key: marshall({
            todo_id: todoId
        })
    };

    const result = await client.send(new GetItemCommand(params));
    return unmarshall(result.Item);
}


export async function GET(request) {

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    try {
        const data = await get(email);
        return NextResponse.json(data, {
            status: 200
        })
    } catch (err) {
        console.error(err);
        return NextResponse.json([], {
            status: 500
        });
    }
}

export async function POST(request) {
    const res = await request.json();
    const { email, title, content } = res;
    try {
        const id = await insert(email, title, content);
        return NextResponse.json({ id }, { status: 200 })
    } catch (err) {
        console.log(err);
        return NextResponse.json({}, { status: 500 });
    }
}

export async function DELETE(request) {
    const res = await request.json();
    const { email, toDoId } = res;
    try {
        await deleteTodo(email, toDoId);
        return NextResponse.json({}, { status: 200 });
    } catch (err) {
        console.log(err);
        return NextResponse.json({}, { status: 500 })
    }
}