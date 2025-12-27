import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { executeQuery, getDatabaseSchema, testConnection } from '../config/database.js';

// Create MCP server
const server = new Server(
    {
        name: 'hospital-database-server',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'get_patient_info',
                description: 'Retrieves patient information from the hospital database. Use this when asked about a specific patient by ID or name. Returns patient details including name, age, gender, contact, and admission date.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        patient_id: {
                            type: 'number',
                            description: 'The patient ID to search for',
                        },
                        patient_name: {
                            type: 'string',
                            description: 'The patient name to search for (partial match supported)',
                        },
                    },
                },
            },
            {
                name: 'get_appointments',
                description: 'Retrieves appointment information from the hospital database. Use this when asked about appointments for a specific patient, doctor, or date. Returns appointment details including date, time, doctor, and status.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        patient_id: {
                            type: 'number',
                            description: 'The patient ID to search appointments for',
                        },
                        doctor_id: {
                            type: 'number',
                            description: 'The doctor ID to search appointments for',
                        },
                        appointment_date: {
                            type: 'string',
                            description: 'The appointment date to search for (YYYY-MM-DD format)',
                        },
                    },
                },
            },
            {
                name: 'get_doctor_info',
                description: 'Retrieves doctor information from the hospital database. Use this when asked about doctors, their specializations, or availability. Returns doctor details including name, specialization, and contact.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        doctor_id: {
                            type: 'number',
                            description: 'The doctor ID to search for',
                        },
                        specialization: {
                            type: 'string',
                            description: 'The specialization to filter doctors by',
                        },
                    },
                },
            },
            {
                name: 'get_medical_records',
                description: 'Retrieves medical records for a patient from the hospital database. Use this when asked about a patient\'s medical history, diagnoses, or treatments. Returns diagnosis, treatment, and prescription information.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        patient_id: {
                            type: 'number',
                            description: 'The patient ID to retrieve medical records for',
                            required: true,
                        },
                    },
                    required: ['patient_id'],
                },
            },
            {
                name: 'get_database_schema',
                description: 'Retrieves the database schema information. Use this to understand the structure of the database tables and their columns. Helpful when you need to know what data is available.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'test_database_connection',
                description: 'Tests the database connection to ensure it is working properly.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
        ],
    };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            case 'get_patient_info': {
                let query = 'SELECT * FROM patients WHERE 1=1';
                const params = [];

                if (args.patient_id) {
                    params.push(args.patient_id);
                    query += ` AND patient_id = $${params.length}`;
                }

                if (args.patient_name) {
                    params.push(`%${args.patient_name}%`);
                    query += ` AND LOWER(name) LIKE LOWER($${params.length})`;
                }

                const results = await executeQuery(query, params);

                if (results.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'No patient found with the given criteria.',
                            },
                        ],
                    };
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(results, null, 2),
                        },
                    ],
                };
            }

            case 'get_appointments': {
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

                if (args.patient_id) {
                    params.push(args.patient_id);
                    query += ` AND a.patient_id = $${params.length}`;
                }

                if (args.doctor_id) {
                    params.push(args.doctor_id);
                    query += ` AND a.doctor_id = $${params.length}`;
                }

                if (args.appointment_date) {
                    params.push(args.appointment_date);
                    query += ` AND DATE(a.appointment_date) = $${params.length}`;
                }

                query += ' ORDER BY a.appointment_date DESC';

                const results = await executeQuery(query, params);

                if (results.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'No appointments found with the given criteria.',
                            },
                        ],
                    };
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(results, null, 2),
                        },
                    ],
                };
            }

            case 'get_doctor_info': {
                let query = 'SELECT * FROM doctors WHERE 1=1';
                const params = [];

                if (args.doctor_id) {
                    params.push(args.doctor_id);
                    query += ` AND doctor_id = $${params.length}`;
                }

                if (args.specialization) {
                    params.push(`%${args.specialization}%`);
                    query += ` AND LOWER(specialization) LIKE LOWER($${params.length})`;
                }

                const results = await executeQuery(query, params);

                if (results.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'No doctors found with the given criteria.',
                            },
                        ],
                    };
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(results, null, 2),
                        },
                    ],
                };
            }

            case 'get_medical_records': {
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

                const results = await executeQuery(query, [args.patient_id]);

                if (results.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `No medical records found for patient ID ${args.patient_id}.`,
                            },
                        ],
                    };
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(results, null, 2),
                        },
                    ],
                };
            }

            case 'get_database_schema': {
                const schema = await getDatabaseSchema();
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(schema, null, 2),
                        },
                    ],
                };
            }

            case 'test_database_connection': {
                const connected = await testConnection();
                return {
                    content: [
                        {
                            type: 'text',
                            text: connected
                                ? 'Database connection successful!'
                                : 'Database connection failed.',
                        },
                    ],
                };
            }

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error executing tool ${name}: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});

// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Hospital Database MCP Server running on stdio');
}

main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
