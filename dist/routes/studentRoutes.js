import { Router } from "express";
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent, getStudentCount, getAvgCgpa, getHighestCgpa, getLowestCgpa, getDepartments, getDepartmentsAverage, getStudentsOlderThan, getStudentCountByLevel, getStudentsInCgpaRange, getDepartmentsStudents } from "../controllers/studentControllers";
const router = Router();
//Stat routes
router.get('/stats/count', getStudentCount);
router.get('/stats/average-cgpa', getAvgCgpa);
router.get('/stats/highest-cgpa', getHighestCgpa);
router.get('/stats/lowest-cgpa', getLowestCgpa);
router.get('/stats/departments', getDepartments);
router.get('/stats/department-cgpa', getDepartmentsAverage);
router.get('/stats/older-than/:age', getStudentsOlderThan);
router.get('/stats/cgpa-range', getStudentsInCgpaRange);
router.get('/stats/department-students/:depts', getDepartmentsStudents);
router.get('/stats/count-level', getStudentCountByLevel);
router.post('/', createStudent);
router.get('/', getStudents);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);
export default router;
//# sourceMappingURL=studentRoutes.js.map