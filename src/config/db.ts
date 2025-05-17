import { MongoClient, type Db } from "mongodb"
import * as dotenv from "dotenv"

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.DB_NAME

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

if (!DB_NAME) {
  throw new Error("Please define the DB_NAME environment variable")
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // If we have cached values, use them
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  // Connect to MongoDB
  const client = new MongoClient(MONGODB_URI)
  await client.connect()

  const db = client.db(DB_NAME)

  // Cache the client and db connections
  cachedClient = client
  cachedDb = db

  console.log("Connected to MongoDB")

  return { client, db }
}

export function getDb(): Db {
  if (!cachedDb) {
    throw new Error("Database not connected. Call connectToDatabase() first.")
  }
  return cachedDb
}
