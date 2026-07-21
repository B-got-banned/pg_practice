import { Router } from "express";
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent } from "../controllers/studentControllers";

const router = Router()

router.post('/', createStudent)
router.get('/', getStudents)
router.get('/:id', getStudentById)
router.put('/:id', updateStudent)
router.delete('/:id', deleteStudent)

export default router