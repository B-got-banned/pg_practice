import type { NextFunction, Request, Response } from "express";
import {query} from '../config/db'

interface Student {
  id: number
  first_name: string
  last_name: string
  email: string
  age: number
  department: string
  cgpa: number
  created_at: string
}

//Create a student
export async function createStudent(req: Request, res: Response, next: NextFunction) {
  try{
    const {first_name, last_name, email, age, department, cgpa} = req.body

    if(!first_name || !last_name || !email || !age || !department || !cgpa) return res.status(400).json({error: "first_name, last_name, email, age, department and cgpa are required"})

    const sql = 'INSERT INTO students(first_name, last_name, email, age, department, cgpa) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;'
    const student_data = await query<Student>(sql, [first_name, last_name, email, age, department, cgpa])
    res.status(201).json({message: "Student added successfully!", row: student_data.rows})
    console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`)
  }
  catch(error: any){
    if(error.code == 23505) return res.status(409).json({error: "email already exists"})
    if(error.code == 23514) return res.status(403).json({error: "age must be at least 16"})
    res.status(500).json({error: "Could not add student record :("})
    console.error('Failed to add student :(', error)
  }
  
}
//Get all students
export async function getStudents(req: Request, res: Response, next: NextFunction) {
  try{
    const sql = 'SELECT * FROM students ORDER BY id;'
    const student_data = await query<Student>(sql)
    res.status(200).json({message: "Students fetched successfully!", rows: student_data.rows})
    console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`)
  }
  catch(error){
    res.status(500).json({error: "Could not get all student records :("})
    console.error('Failed to get all students :(', error)
  }
}

//Get student by id
export async function getStudentById(req: Request, res: Response, next: NextFunction) {
  try{
    const id = req.params.id
    const sql = 'SELECT * FROM students WHERE $1 = id;'
    const student_data = await query<Student>(sql, [id])

    console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`)

    if(student_data.rows.length === 0) return res.status(404).json({error: `Student with id ${id} could not be found`})

    res.status(200).json({message: "Student fetched successfully!", row: student_data.rows[0]})
  }
  catch(error){
    res.status(500).json({error: "Could not add student record :("})
    console.error("Failed to fetch student :(", error)
  }
}

//Change a student record
export async function updateStudent(req: Request, res: Response, next: NextFunction) {
  try{
    const id = req.params.id
    const {first_name, last_name, email, age, department, cgpa} = req.body
    
    if(!first_name || !last_name || !email || !age || !department || !cgpa) return res.status(400).json({error: "first_name, last_name, email, age, department and cgpa are required"})

    const sql = 'UPDATE students SET first_name = $1, last_name = $2, email = $3, age = $4, department = $5, cgpa = $6 WHERE id = $7 RETURNING *'
    const student_data = await query<Student>(sql, [first_name, last_name, email, age, department, cgpa, id])

    if(student_data.rows.length === 0) return res.status(404).json({error: `Student with id ${id} could not be found`})
    
    res.status(200).json({message: "Student updated successfully!", row: student_data.rows})
    console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`)
  }
  catch(error: any){
    if(error.code == 23505) return res.status(409).json({error: "email already exists"})
    if(error.code == 23514) return res.status(403).json({error: "age must be at least 16"})
    res.status(500).json({error: "Could not update student record :("})
    console.error('Failed to update student :(', error)
  }
}

//Delete a student record
export async function deleteStudent(req: Request, res: Response, next: NextFunction) {
  try{
    const id = req.params.id
    const sql = 'DELETE FROM students WHERE $1 = id;'
    const student_data = await query<Student>(sql, [id])

    if(student_data.rowCount === 0) return res.status(404).json({error: `Student with id ${id} does not exist`})

    res.status(204).json({message: "Student deleted successfully!"})
    console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`)
  }
  catch(error){
    res.status(500).json({error: "Could not delete student record :("})
    console.error('Failed to delete student record :(', error)
  }
}