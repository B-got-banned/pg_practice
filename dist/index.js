import express from 'express';
import reqLogger from './middleware/reqLogger';
import dotenv from 'dotenv';
import { pool } from './config/db';
import router from './routes/studentRoutes';
dotenv.config();
const app = express();
// Disabled Express's default header to avoid leaking framework version details
app.disable('x-powered-by');
const PORT = Number(process.env.PORT) || 3000;
// Parse JSON requests into req.body
app.use(express.json());
// Log requests :3
app.use(reqLogger);
app.get('/', (req, res) => res.status(200).json({ info: "Student Management API with SQL Database :D" }));
app.get('/health', (req, res) => res.status(200).json({ status: "We good :3" }));
// All /students routes live in routes/studentRoutes.ts
app.use('/students', router);
const server = app.listen(PORT, () => {
    console.log(`API is running on http://localhost:${PORT}`);
});
// Close the DB pool cleanly on shutdown (Ctrl+C).
process.on('SIGINT', async () => {
    console.log('\n...Bye Bye :D');
    await pool.end();
    server.close(() => process.exit(0));
});
//# sourceMappingURL=index.js.map