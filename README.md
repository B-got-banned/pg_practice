# 🎓 Student Management API

A RESTful Student Management API built with **Node.js**, **TypeScript**, **Express.js**, and **PostgreSQL**.

The API provides CRUD operations for student records together with filtering, searching, sorting, pagination, and several statistical endpoints.

---

## Highlights

- Built with TypeScript and Express 5
- PostgreSQL with parameterized queries to mitigate SQL injection
- Dynamic filtering, sorting, searching, and pagination
- Aggregate SQL statistics endpoints (COUNT, AVG, MAX, MIN, GROUP BY)
- Request logging middleware
- Database setup and seeding script
- Graceful shutdown with PostgreSQL connection cleanup

---

## Features

- Create, Read, Update and Delete students
- PostgreSQL database
- TypeScript
- Express 5
- Request logging middleware
- Environment variable support with dotenv
- Search students
- Filter by department and CGPA
- Sorting
- Pagination
- Student statistics endpoints
- SQL schema setup script
- Graceful database shutdown

---

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- pg
- dotenv

---

## Project Structure

```
Student-Management-API/ 
├── config/ 
│ ├── db.ts 
│ └── setup.ts 
├── controllers/ 
│ └── studentControllers.ts 
├── dist/ 
├── middleware/ 
│ └── reqLogger.ts 
├── routes/ 
│ └── studentRoutes.ts 
├── sql/ 
│ └──schema.sql 
├── .env.example 
├── .gitignore 
├── index.ts 
├── package.json 
└── tsconfig.json
```

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/B-got-banned/Student-Management-API.git

cd Student-Management-API
```

---

### Install dependencies

```bash
npm install
```

---

### Configure environment variables

Copy

```
.env.example
```

to

```
.env
```

Then replace the placeholders with your PostgreSQL credentials.

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/student_management

PORT=3000
```

---

### Create the database

Create a PostgreSQL database named

```
student_management
```

or update your `.env` to match your preferred database name.

---

### Create the table

Run

```bash
npm run db:setup
```

This will

- create the students table
- insert sample records if they don't already exist

---

### Start the development server

```bash
npm run dev
```

---

### Build the project

```bash
npm run build
```

---

### Run the production build

```bash
npm start
```

---

## API Base URL

```
http://localhost:3000
```

---

# Endpoints

## Health

| Method | Endpoint |
|---------|----------|
| GET | `/` |
| GET | `/health` |

---

## Student Routes

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/students` | Create student |
| GET | `/students` | Get all students |
| GET | `/students/:id` | Get student by ID |
| PUT | `/students/:id` | Update student |
| DELETE | `/students/:id` | Delete student |

---

## Statistics Routes

| Method | Endpoint |
|---------|----------|
| GET | `/students/stats/count` |
| GET | `/students/stats/average-cgpa` |
| GET | `/students/stats/highest-cgpa` |
| GET | `/students/stats/lowest-cgpa` |
| GET | `/students/stats/departments` |
| GET | `/students/stats/department-cgpa` |
| GET | `/students/stats/older-than/:age` |
| GET | `/students/stats/cgpa-range` |
| GET | `/students/stats/department-students/:depts` |
| GET | `/students/stats/count-level` |

---

# Query Parameters

The `GET /students` endpoint supports:

| Parameter | Example |
|-----------|---------|
| department | `?department=Marketing` |
| cgpa | `?cgpa=4.0` |
| search | `?search=andy` |
| sort | `?sort=-cgpa` |
| page | `?page=2` |
| limit | `?limit=5` |

These parameters can be combined in any order.

Example

```
GET /students?department=Marketing&cgpa=4.0&sort=-cgpa&page=1&limit=5
```

---

# Sample Request

```http
POST /students
```

```json
{
  "first_name": "Bethel",
  "last_name": "Onyealilachi",
  "email": "bethel@example.com",
  "age": 18,
  "department": "Software Engineering",
  "level": 300,
  "cgpa": 4.90
}
```

---

# Sample Response

```json
{
  "message": "Student added successfully!",
  "row": [
    {
      "id": 3,
      "first_name": "Bethel",
      "last_name": "Onyealilachi",
      "email": "bethel@example.com",
      "age": 18,
      "department": "Software Engineering",
      "level": 300,
      "cgpa": 4.90
    }
  ]
}
```

---

## Seed Data

Running

```bash
npm run db:setup
```

adds two sample student records for testing.

---

## See Documentation

**Postman Collection:** [Student Management API](https://documenter.getpostman.com/view/50145243/2sBY4QrKXn)

---

## License

ISC
