import { query } from '../config/db';
//Create a student
export async function createStudent(req, res, next) {
    try {
        const { first_name, last_name, email, age, department, level, cgpa } = req.body;
        if (!first_name || !last_name || !email || !age || !department || !level || !cgpa)
            return res.status(400).json({ error: "first_name, last_name, email, age, department, level and cgpa are required" });
        const sql = 'INSERT INTO students(first_name, last_name, email, age, department, level, cgpa) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *;';
        const student_data = await query(sql, [first_name, last_name, email, age, department, cgpa]);
        res.status(201).json({ message: "Student added successfully!", row: student_data.rows });
        console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`);
    }
    catch (error) {
        if (error.code == 23505)
            return res.status(409).json({ error: "email already exists" });
        if (error.code == 23514)
            return res.status(403).json({ error: "age must be at least 16" });
        res.status(500).json({ error: "Could not add student record :(" });
        console.error('Failed to add student :(', error);
    }
}
//Get all students + filtering by department, cgpa and search + pagination :D
export async function getStudents(req, res, next) {
    try {
        //Extracting query parameters with default values for page and limit
        const { department, cgpa, search } = req.query;
        const sortParam = req.query.sort;
        const pageParam = req.query.page;
        const limitParam = req.query.limit;
        let sort = typeof sortParam === "string" ? sortParam : "id";
        let page = typeof pageParam === "string" ? pageParam : 1;
        let limit = typeof limitParam === "string" ? limitParam : 10;
        //temporary sort variable
        let t_sort = sort;
        //Sort-value array for extra safety against SQL injection since template literals are used in sort query
        const valid_sort_values = ['id', '-id', 'first_name', '-first_name', 'last_name', '-last_name', 'email', '-email', 'age', '-age', 'department', '-department', 'level', '-level', 'cgpa', '-cgpa', 'created_at', '-created_at'];
        //Query parameter queries written with query placeholders
        let dept_sql = "department ~* $1";
        let cgpa_sql = "cgpa >= $2";
        let search_sql = "first_name ~* $3 OR last_name ~* $3 OR email ~* $3";
        //Remove - so we don't break PostgreSQL in sort query
        if (sort.startsWith("-"))
            sort = sort.slice(1);
        let sort_sql = ` ORDER BY ${sort}`;
        let page_sql = "";
        //Check for extra safety since template literals are used in pagination query
        if (!Number.isNaN(Number(page)) && !Number.isNaN(Number(limit))) {
            page_sql = ` LIMIT ${limit} OFFSET ${(Number(page) - 1) * Number(limit)}`;
        }
        else {
            return res.status(400).json({ error: "Both page and limit must be numbers" });
        }
        //Base query
        let sql = 'SELECT * FROM students';
        let params = [];
        // Include department, cgpa or search queries in arbitrary order to avoid SQL injection and match params positions
        if (department || cgpa || search) {
            sql += " WHERE ";
            if (department) {
                //Order 1: students in department
                sql += dept_sql;
                params.push(department);
                if (cgpa || search) {
                    sql += " AND ";
                    if (cgpa) {
                        //Order 2: students in department with cgpa >= cgpa parameter
                        sql += cgpa_sql;
                        params.push(cgpa);
                        if (search) {
                            //Order 3: students in department with cgpa >= cgpa parameter and search matching first_name, last_name or email
                            sql += " AND ";
                            sql += search_sql;
                            params.push(search);
                        }
                    }
                    else if (search) {
                        //Order 4: students in department and search matching first_name, last_name or email
                        search_sql = search_sql.replaceAll("3", "2");
                        sql += search_sql;
                        params.push(search);
                        if (cgpa) {
                            //Order 5: students in department and search matching first_name, last_name or email with cgpa >= cgpa parameter
                            sql += " AND ";
                            cgpa_sql = cgpa_sql.replaceAll("2", "3");
                            sql += cgpa_sql;
                            params.push(cgpa);
                        }
                    }
                }
            }
            else if (cgpa) {
                //Order 6: students with cgpa >= cgpa parameter
                cgpa_sql = cgpa_sql.replaceAll("2", "1");
                sql += cgpa_sql;
                params.push(cgpa);
                if (department || search) {
                    sql += " AND ";
                    if (department) {
                        //Order 7: students with cgpa >= cgpa parameter and in department
                        dept_sql = dept_sql.replaceAll("1", "2");
                        sql += dept_sql;
                        params.push(department);
                        if (search) {
                            //Order 8: students with cgpa >= cgpa parameter and in department and search matching first_name, last_name or email
                            sql += " AND ";
                            sql += search_sql;
                            params.push(search);
                        }
                    }
                    else if (search) {
                        //Order 9: students with cgpa >= cgpa parameter and search matching first_name, last_name or email
                        search_sql = search_sql.replaceAll("3", "2");
                        sql += search_sql;
                        params.push(search);
                        if (department) {
                            //Order 10: students with cgpa >= cgpa parameter and search matching first_name, last_name or email and in department
                            sql += " AND ";
                            dept_sql = dept_sql.replaceAll("1", "3");
                            sql += dept_sql;
                            params.push(department);
                        }
                    }
                }
            }
            else if (search) {
                //Order 11: students with search matching first_name, last_name or email
                search_sql = search_sql.replaceAll("3", "1");
                sql += search_sql;
                params.push(search);
                if (cgpa || department) {
                    sql += " AND ";
                    if (cgpa) {
                        //Order 12: students with search matching first_name, last_name or email and cgpa >= cgpa parameter
                        sql += cgpa_sql;
                        params.push(cgpa);
                        if (department) {
                            //Order 13: students with search matching first_name, last_name or email and cgpa >= cgpa parameter and in department
                            sql += " AND ";
                            dept_sql = dept_sql.replaceAll("1", "3");
                            sql += dept_sql;
                            params.push(department);
                        }
                    }
                    else if (department) {
                        //Order 14: students with search matching first_name, last_name or email and in department
                        dept_sql = dept_sql.replaceAll("1", "2");
                        sql += dept_sql;
                        params.push(department);
                        if (cgpa) {
                            //Order 15: students with search matching first_name, last_name or email and in department with cgpa >= cgpa parameter
                            sql += " AND ";
                            cgpa_sql = cgpa_sql.replaceAll("2", "3");
                            sql += cgpa_sql;
                            params.push(cgpa);
                        }
                    }
                }
            }
        }
        // Include sort query if provided
        if (sort) {
            if (valid_sort_values.includes(sort.toString())) {
                if (t_sort.startsWith("-"))
                    sort_sql += " DESC";
                sql += sort_sql;
            }
            else {
                return res.status(400).json({ error: "Invalid sort value" });
            }
        }
        //Finally add pagination query to base query to follow SQL order of execution
        sql += page_sql;
        const student_data = await query(sql, params);
        res.status(200).json({ message: "Students fetched successfully!", rows: student_data.rows });
        console.log(`Query Successful: ${sql}`, { query_params: params });
    }
    catch (error) {
        res.status(500).json({ error: "Could not get all student records :(" });
        console.error('Failed to get all students :(', error);
    }
}
//Get student by id
export async function getStudentById(req, res, next) {
    try {
        const id = req.params.id;
        const sql = 'SELECT * FROM students WHERE $1 = id;';
        const student_data = await query(sql, [id]);
        console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`);
        if (student_data.rows.length === 0)
            return res.status(404).json({ error: `Student with id ${id} could not be found` });
        res.status(200).json({ message: "Student fetched successfully!", row: student_data.rows[0] });
    }
    catch (error) {
        res.status(500).json({ error: "Could not add student record :(" });
        console.error("Failed to fetch student :(", error);
    }
}
//Change a student record
export async function updateStudent(req, res, next) {
    try {
        const id = req.params.id;
        const { first_name, last_name, email, age, department, level, cgpa } = req.body;
        if (!first_name || !last_name || !email || !age || !department || !level || !cgpa)
            return res.status(400).json({ error: "first_name, last_name, email, age, department and cgpa are required" });
        const sql = 'UPDATE students SET first_name = $1, last_name = $2, email = $3, age = $4, department = $5, level = $6, cgpa = $7 WHERE id = $8 RETURNING *';
        const student_data = await query(sql, [first_name, last_name, email, age, department, level, cgpa, id]);
        if (student_data.rows.length === 0)
            return res.status(404).json({ error: `Student with id ${id} could not be found` });
        res.status(200).json({ message: "Student updated successfully!", row: student_data.rows });
        console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`);
    }
    catch (error) {
        if (error.code == 23505)
            return res.status(409).json({ error: "email already exists" });
        if (error.code == 23514)
            return res.status(403).json({ error: "age must be at least 16" });
        res.status(500).json({ error: "Could not update student record :(" });
        console.error('Failed to update student :(', error);
    }
}
//Delete a student record
export async function deleteStudent(req, res, next) {
    try {
        const id = req.params.id;
        const sql = 'DELETE FROM students WHERE $1 = id;';
        const student_data = await query(sql, [id]);
        if (student_data.rowCount === 0)
            return res.status(404).json({ error: `Student with id ${id} does not exist` });
        res.status(204).json({ message: "Student deleted successfully!" });
        console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`);
    }
    catch (error) {
        res.status(500).json({ error: "Could not delete student record :(" });
        console.error('Failed to delete student record :(', error);
    }
}
//Stat Controllers
//Count student records
export async function getStudentCount(req, res, next) {
    try {
        const sql = 'SELECT COUNT(*) from students';
        const stat_data = await query(sql);
        res.status(200).json({ info: `There are ${stat_data.rows[0].count} student records` });
        console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`);
    }
    catch (error) {
        res.status(500).json({ error: "Could not get student count" });
        console.error("Failed to fetch student count", error);
    }
}
//Get average CGPA
export async function getAvgCgpa(req, res, next) {
    try {
        const sql = 'SELECT AVG(cgpa) from students';
        const stat_data = await query(sql);
        res.status(200).json({ info: `The average CGPA is ${stat_data.rows[0].avg}` });
        console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`);
    }
    catch (error) {
        res.status(500).json({ error: "Could not get average CGPA" });
        console.error("Failed to fetch average CGPA", error);
    }
}
//Get highest CGPA
export async function getHighestCgpa(req, res, next) {
    try {
        const sql = 'SELECT MAX(cgpa) from students';
        const stat_data = await query(sql);
        res.status(200).json({ info: `The highest CGPA is ${stat_data.rows[0].max}` });
        console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`);
    }
    catch (error) {
        res.status(500).json({ error: "Could not get highest CGPA" });
        console.error("Failed to fetch highest CGPA", error);
    }
}
//Get lowest CGPA
export async function getLowestCgpa(req, res, next) {
    try {
        const sql = 'SELECT MIN(cgpa) from students';
        const stat_data = await query(sql);
        res.status(200).json({ info: `The lowest CGPA is ${stat_data.rows[0].min}` });
        console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`);
    }
    catch (error) {
        res.status(500).json({ error: "Could not get lowest CGPA" });
        console.error("Failed to fetch lowest CGPA", error);
    }
}
//Get departments
export async function getDepartments(req, res, next) {
    try {
        const sql = 'SELECT department, COUNT(*) as student_count FROM students GROUP BY department ORDER BY department';
        const dept_data = await query(sql);
        res.status(200).json(dept_data.rows);
        console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`);
    }
    catch (error) {
        res.status(500).json({ error: "Could not get departments" });
        console.error("Failed to fetch departments", error);
    }
}
//Get average cgpa by department
export async function getDepartmentsAverage(req, res, next) {
    try {
        const sql = 'SELECT department, AVG(cgpa) as avg_dept_cgpa FROM students GROUP BY department ORDER BY avg_dept_cgpa DESC';
        const dept_data = await query(sql);
        res.status(200).json(dept_data.rows);
        console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`);
    }
    catch (error) {
        res.status(500).json({ error: "Could not get department averages" });
        console.error("Failed to fetch department averages", error);
    }
}
//Get students older than a particular age
export async function getStudentsOlderThan(req, res, next) {
    try {
        const age = req.params.age;
        const sql = 'SELECT * from students WHERE age > $1';
        const stat_data = await query(sql, [age]);
        res.status(200).json(stat_data.rows);
        console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`);
    }
    catch (error) {
        res.status(500).json({ error: `Could not get students older than ${req.params.age}` });
        console.error(`Failed to fetch students older than ${req.params.age}`, error);
    }
}
//Get students with cgpa between min/max
export async function getStudentsInCgpaRange(req, res, next) {
    try {
        const sql = 'SELECT * FROM students WHERE cgpa BETWEEN (SELECT MIN(cgpa) FROM students) AND (SELECT MAX(cgpa) FROM students) ORDER BY cgpa';
        const cgpa_data = await query(sql);
        res.status(200).json(cgpa_data.rows);
        console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`);
    }
    catch (error) {
        res.status(500).json({ error: "Could not get student records" });
        console.error("Failed to fetch student records", error);
    }
}
//Get students in a particular set of departments
export async function getDepartmentsStudents(req, res, next) {
    try {
        let depts = req.params.depts;
        let deptArray = depts.toString().split(",");
        let sql = "SELECT * FROM students WHERE department IN(";
        if (deptArray.length > 1) {
            for (let i = 1; i <= deptArray.length; i++) {
                sql += `$${i},`;
            }
            sql = sql.slice(0, -1);
            sql += ")";
        }
        else {
            sql += "$1)";
        }
        const data = await query(sql, [...deptArray]);
        res.status(200).json(data.rows);
        console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`);
    }
    catch (error) {
        res.status(500).json({ error: "Could not get student records" });
        console.error("Failed to fetch student records", error);
    }
}
//Count students by level
export async function getStudentCountByLevel(req, res, next) {
    try {
        const sql = 'SELECT level, COUNT(*) as student_count FROM students GROUP BY level ORDER BY level';
        const level_data = await query(sql);
        res.status(200).json(level_data.rows);
        console.log(`Query Successful: ${sql.split(" ")[0].toUpperCase()}`);
    }
    catch (error) {
        res.status(500).json({ error: "Could not get student count" });
        console.error("Failed to fetch student count", error);
    }
}
//# sourceMappingURL=studentControllers.js.map