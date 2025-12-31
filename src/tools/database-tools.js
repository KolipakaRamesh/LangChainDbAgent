import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { executeQuery, getDatabaseSchema } from '../config/database.js';

// Tool to query patient information
export const getPatientInfoTool = new DynamicStructuredTool({
    name: 'get_patient_info',
    description: 'Retrieves patient information from the hospital database. Use this when asked about a specific patient by ID or name. Returns patient details including name, age, gender, contact, and admission date.',
    schema: z.object({
        patient_id: z.number().optional().describe('The patient ID to search for'),
        patient_name: z.string().optional().describe('The patient name to search for (partial match supported)'),
    }),
    func: async ({ patient_id, patient_name }) => {
        try {
            let query = 'SELECT * FROM patients WHERE 1=1';
            const params = [];

            if (patient_id) {
                params.push(patient_id);
                query += ` AND patient_id = $${params.length}`;
            }

            if (patient_name) {
                params.push(`%${patient_name}%`);
                query += ` AND LOWER(name) LIKE LOWER($${params.length})`;
            }

            const results = await executeQuery(query, params);

            if (results.length === 0) {
                return 'No patient found with the given criteria.';
            }

            return JSON.stringify(results, null, 2);
        } catch (error) {
            return `Error retrieving patient information: ${error.message}`;
        }
    },
});

// Tool to query appointments
export const getAppointmentsTool = new DynamicStructuredTool({
    name: 'get_appointments',
    description: 'Retrieves appointment information from the hospital database. Use this when asked about appointments for a specific patient, doctor, or date. Returns appointment details including date, time, doctor, and status.',
    schema: z.object({
        patient_id: z.number().optional().describe('The patient ID to search appointments for'),
        doctor_id: z.number().optional().describe('The doctor ID to search appointments for'),
        appointment_date: z.string().optional().describe('The appointment date to search for (YYYY-MM-DD format)'),
    }),
    func: async ({ patient_id, doctor_id, appointment_date }) => {
        try {
            let query = `
        SELECT 
          a.*,
          p.name as patient_name,
          d.name as doctor_name,
          d.specialization
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.patient_id
        LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
        WHERE 1=1
      `;
            const params = [];

            if (patient_id) {
                params.push(patient_id);
                query += ` AND a.patient_id = $${params.length}`;
            }

            if (doctor_id) {
                params.push(doctor_id);
                query += ` AND a.doctor_id = $${params.length}`;
            }

            if (appointment_date) {
                params.push(appointment_date);
                query += ` AND DATE(a.appointment_date) = $${params.length}`;
            }

            query += ' ORDER BY a.appointment_date DESC';

            const results = await executeQuery(query, params);

            if (results.length === 0) {
                return 'No appointments found with the given criteria.';
            }

            return JSON.stringify(results, null, 2);
        } catch (error) {
            return `Error retrieving appointments: ${error.message}`;
        }
    },
});

// Tool to query doctor information
export const getDoctorInfoTool = new DynamicStructuredTool({
    name: 'get_doctor_info',
    description: 'Retrieves doctor information from the hospital database. Use this when asked about doctors, their specializations, or availability. Returns doctor details including name, specialization, and contact.',
    schema: z.object({
        doctor_id: z.number().optional().describe('The doctor ID to search for'),
        specialization: z.string().optional().describe('The specialization to filter doctors by'),
    }),
    func: async ({ doctor_id, specialization }) => {
        try {
            let query = 'SELECT * FROM doctors WHERE 1=1';
            const params = [];

            if (doctor_id) {
                params.push(doctor_id);
                query += ` AND doctor_id = $${params.length}`;
            }

            if (specialization) {
                params.push(`%${specialization}%`);
                query += ` AND LOWER(specialization) LIKE LOWER($${params.length})`;
            }

            const results = await executeQuery(query, params);

            if (results.length === 0) {
                return 'No doctors found with the given criteria.';
            }

            return JSON.stringify(results, null, 2);
        } catch (error) {
            return `Error retrieving doctor information: ${error.message}`;
        }
    },
});

// Tool to query medical records
export const getMedicalRecordsTool = new DynamicStructuredTool({
    name: 'get_medical_records',
    description: 'Retrieves medical records for a patient from the hospital database. Use this when asked about a patient\'s medical history, diagnoses, or treatments. Returns diagnosis, treatment, and prescription information.',
    schema: z.object({
        patient_id: z.number().describe('The patient ID to retrieve medical records for'),
    }),
    func: async ({ patient_id }) => {
        try {
            const query = `
        SELECT 
          mr.*,
          p.name as patient_name,
          d.name as doctor_name
        FROM medical_records mr
        LEFT JOIN patients p ON mr.patient_id = p.patient_id
        LEFT JOIN doctors d ON mr.doctor_id = d.doctor_id
        WHERE mr.patient_id = $1
        ORDER BY mr.record_date DESC
      `;

            const results = await executeQuery(query, [patient_id]);

            if (results.length === 0) {
                return `No medical records found for patient ID ${patient_id}.`;
            }

            return JSON.stringify(results, null, 2);
        } catch (error) {
            return `Error retrieving medical records: ${error.message}`;
        }
    },
});

// Tool to get database schema
export const getSchemaTool = new DynamicStructuredTool({
    name: 'get_database_schema',
    description: 'Retrieves the database schema information. Use this to understand the structure of the database tables and their columns. Helpful when you need to know what data is available.',
    schema: z.object({}),
    func: async () => {
        try {
            const schema = await getDatabaseSchema();
            return JSON.stringify(schema, null, 2);
        } catch (error) {
            return `Error retrieving database schema: ${error.message}`;
        }
    },
});

// Export all tools
export const databaseTools = [
    getPatientInfoTool,
    getAppointmentsTool,
    getDoctorInfoTool,
    getMedicalRecordsTool,
    getSchemaTool,
];
