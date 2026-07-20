import { Pool, type QueryResultRow } from "pg";
import dotenv from 'dotenv'
dotenv.config()


export const pool = new Pool(process.env.DATABASE_URL ? {connectionString: process.env.DATABASE_URL} : undefined)

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

export function query<T extends QueryResultRow>(text: string, params?: unknown[]){
  return pool.query<T>(text, params)
}
