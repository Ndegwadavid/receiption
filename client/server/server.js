// server/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Track connected clients and active examinations
let doctorSockets = new Set();
let activeExaminations = new Map();

// Socket connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Doctor registration
    socket.on('register_as_doctor', () => {
        doctorSockets.add(socket.id);
        console.log('Doctor registered:', socket.id);
        socket.emit('updateExaminations', Array.from(activeExaminations.values()));
    });

    // New patient registration
    socket.on('newPatient', async (patientData) => {
        try {
            // Remove created_at and let MySQL handle it
            const { created_at, ...patientDataWithoutDate } = patientData;
            
            // Insert patient data
            const [result] = await db.promise().query(
                'INSERT INTO patients SET ?',
                {
                    ...patientDataWithoutDate,
                    status: 'pending_examination'
                }
            );
            
            const patientId = result.insertId;

            // Fetch the inserted record
            const [insertedPatient] = await db.promise().query(
                'SELECT * FROM patients WHERE id = ?',
                [patientId]
            );

            // Create notification
            await db.promise().query(
                'INSERT INTO notifications (patient_id, message, type) VALUES (?, ?, ?)',
                [patientId, `New patient: ${patientData.name}`, 'new_patient']
            );

            const examination = {
                id: patientId,
                ...insertedPatient[0]
            };
            
            activeExaminations.set(patientId, examination);

            // Notify doctors
            doctorSockets.forEach(doctorSocketId => {
                io.to(doctorSocketId).emit('newPatientNotification', {
                    patient: examination,
                    message: `New patient: ${patientData.name}`
                });
            });

            // Broadcast updated list
            io.emit('updateExaminations', Array.from(activeExaminations.values()));
            
        } catch (error) {
            console.error('Error processing new patient:', error);
            socket.emit('error', 'Failed to process new patient');
        }
    });

    // Examination completion
    socket.on('examinationComplete', async (data) => {
        try {
            const { patientId, examinationData } = data;

            // Update patient status
            await db.promise().query(
                'UPDATE patients SET status = "examination_complete" WHERE id = ?',
                [patientId]
            );

            // Insert examination data
            await db.promise().query(
                'INSERT INTO examinations SET ?',
                {
                    patient_id: patientId,
                    right_sph: examinationData.right_sph,
                    right_cyl: examinationData.right_cyl,
                    right_axis: examinationData.right_axis,
                    right_add: examinationData.right_add,
                    right_va: examinationData.right_va,
                    right_ipd: examinationData.right_ipd,
                    left_sph: examinationData.left_sph,
                    left_cyl: examinationData.left_cyl,
                    left_axis: examinationData.left_axis,
                    left_add: examinationData.left_add,
                    left_va: examinationData.left_va,
                    left_ipd: examinationData.left_ipd,
                    clinical_history: examinationData.clinical_history,
                    optometrist_name: examinationData.optometrist_name
                }
            );

            // Update active examinations
            if (activeExaminations.has(patientId)) {
                const updatedExam = {
                    ...activeExaminations.get(patientId),
                    status: 'examination_complete',
                    ...examinationData
                };
                activeExaminations.set(patientId, updatedExam);
            }

            io.emit('updateExaminations', Array.from(activeExaminations.values()));

        } catch (error) {
            console.error('Error completing examination:', error);
            socket.emit('error', 'Failed to complete examination');
        }
    });

    // Sales completion
    socket.on('salesComplete', async (data) => {
        try {
            const { patientId, salesData } = data;

            // Update patient status
            await db.promise().query(
                'UPDATE patients SET status = "completed" WHERE id = ?',
                [patientId]
            );

            // Insert sales data
            await db.promise().query(
                'INSERT INTO sales SET ?',
                { 
                    patient_id: patientId,
                    ...salesData
                }
            );

            // Remove from active examinations
            activeExaminations.delete(patientId);

            // Broadcast updates
            io.emit('updateExaminations', Array.from(activeExaminations.values()));

        } catch (error) {
            console.error('Error completing sale:', error);
            socket.emit('error', 'Failed to complete sale');
        }
    });

    // Client disconnection
    socket.on('disconnect', () => {
        doctorSockets.delete(socket.id);
        console.log('Client disconnected:', socket.id);
    });
});

// REST API endpoints
// Get all examinations
app.get('/api/examinations', async (req, res) => {
    try {
        const [rows] = await db.promise().query(`
            SELECT 
                p.*,
                e.right_sph, e.right_cyl, e.right_axis, e.right_add, e.right_va, e.right_ipd,
                e.left_sph, e.left_cyl, e.left_axis, e.left_add, e.left_va, e.left_ipd,
                e.clinical_history, e.optometrist_name,
                s.brand, s.model, s.color, s.amount, s.total, s.advance, s.balance,
                s.referenceNumber
            FROM patients p
            LEFT JOIN examinations e ON p.id = e.patient_id
            LEFT JOIN sales s ON p.id = s.patient_id
            ORDER BY p.created_at DESC
            LIMIT 50
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching examinations:', error);
        res.status(500).json({ error: 'Failed to fetch examinations' });
    }
});

// Get single examination
app.get('/api/examinations/:id', async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            'SELECT * FROM patients WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            res.status(404).json({ error: 'Record not found' });
            return;
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching examination:', error);
        res.status(500).json({ error: 'Failed to fetch examination' });
    }
});

// Delete examination record
app.delete('/api/examinations/:id', async (req, res) => {
    try {
        await db.promise().query('DELETE FROM patients WHERE id = ?', [req.params.id]);
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        console.error('Error deleting record:', error);
        res.status(500).json({ error: 'Failed to delete record' });
    }
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});