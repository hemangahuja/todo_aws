
import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient, ScanCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({})
export async function GET() {
    try {
        const response = await client.send(new ScanCommand({
            TableName: 'users',
        }));
        return NextResponse.json(response.Items);
    } catch (err) {
        console.error(err);
        return NextResponse.json([]);
    }
}

export async function POST(request) {
    const res = await request.json();
    console.log(res);
    const { id, name } = res;
    try {
        const response = await client.send(new PutItemCommand({
            TableName: 'users',
            Item: {
                id: { S: id },
                name: { S: name }
            }
        }));
        console.log(response);
        return NextResponse.json({}, { status: 200 })
    } catch (err) {
        return NextResponse.json({}, { status: 500 });
    }
}