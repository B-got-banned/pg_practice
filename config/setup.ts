import {pool, query} from './db.js'
import fs from 'node:fs'
import path from 'node:path'

const runSetup = async () => {
  try {
    const schemaPath = path.join(process.cwd(), 'sql', 'schema.sql')
    const sql = fs.readFileSync(schemaPath, 'utf8')
    await query(sql)
    console.log("Query run successful!")
  }
  catch(error){
    console.error('Setup unsuccessful: ', error)
  }
  finally{
    await pool.end()
  }
}

runSetup()
