import { executeQuery, testConnection } from './config/database.js';

// SQL to create tables
const createTablesSQL = `
-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  patient_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(10) NOT NULL,
  contact VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  admission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  doctor_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  contact VARCHAR(20),
  email VARCHAR(100),
  years_of_experience INTEGER
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  appointment_id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(patient_id),
  doctor_id INTEGER REFERENCES doctors(doctor_id),
  appointment_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled',
  notes TEXT
);

-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
  record_id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(patient_id),
  doctor_id INTEGER REFERENCES doctors(doctor_id),
  diagnosis TEXT NOT NULL,
  treatment TEXT,
  prescription TEXT,
  record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// SQL to insert sample data
const insertSampleDataSQL = `
-- Insert sample patients
INSERT INTO patients (name, age, gender, contact, email, address) VALUES
  ('John Smith', 45, 'Male', '555-0101', 'john.smith@email.com', '123 Main St, City'),
  ('Sarah Johnson', 32, 'Female', '555-0102', 'sarah.j@email.com', '456 Oak Ave, Town'),
  ('Michael Brown', 58, 'Male', '555-0103', 'mbrown@email.com', '789 Pine Rd, Village'),
  ('Emily Davis', 28, 'Female', '555-0104', 'emily.d@email.com', '321 Elm St, City'),
  ('Robert Wilson', 67, 'Male', '555-0105', 'rwilson@email.com', '654 Maple Dr, Town')
ON CONFLICT DO NOTHING;

-- Insert sample doctors
INSERT INTO doctors (name, specialization, contact, email, years_of_experience) VALUES
  ('Dr. Amanda Chen', 'Cardiology', '555-0201', 'dr.chen@hospital.com', 15),
  ('Dr. James Martinez', 'Neurology', '555-0202', 'dr.martinez@hospital.com', 12),
  ('Dr. Lisa Anderson', 'Pediatrics', '555-0203', 'dr.anderson@hospital.com', 8),
  ('Dr. David Thompson', 'Orthopedics', '555-0204', 'dr.thompson@hospital.com', 20),
  ('Dr. Maria Garcia', 'General Medicine', '555-0205', 'dr.garcia@hospital.com', 10)
ON CONFLICT DO NOTHING;

-- Insert sample appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, notes) VALUES
  (1, 1, '2025-12-28 10:00:00', 'scheduled', 'Regular checkup'),
  (2, 3, '2025-12-28 14:00:00', 'scheduled', 'Child vaccination'),
  (3, 2, '2025-12-29 09:00:00', 'scheduled', 'Follow-up consultation'),
  (4, 5, '2025-12-29 11:00:00', 'scheduled', 'General consultation'),
  (5, 4, '2025-12-30 15:00:00', 'scheduled', 'Joint pain assessment')
ON CONFLICT DO NOTHING;

-- Insert sample medical records
INSERT INTO medical_records (patient_id, doctor_id, diagnosis, treatment, prescription) VALUES
  (1, 1, 'Hypertension', 'Lifestyle modifications and medication', 'Lisinopril 10mg daily'),
  (2, 3, 'Common cold', 'Rest and hydration', 'Acetaminophen as needed'),
  (3, 2, 'Migraine', 'Pain management and trigger avoidance', 'Sumatriptan 50mg as needed'),
  (4, 5, 'Seasonal allergies', 'Antihistamine therapy', 'Cetirizine 10mg daily'),
  (5, 4, 'Osteoarthritis', 'Physical therapy and pain management', 'Ibuprofen 400mg twice daily')
ON CONFLICT DO NOTHING;
`;

// Main setup function
async function setupDatabase() {
    console.log('🏥 Hospital Database Setup\n');

    // Test connection
    console.log('1️⃣ Testing database connection...');
    const connected = await testConnection();

    if (!connected) {
        console.error('\n❌ Failed to connect to database. Please check your .env configuration.');
        console.log('\nMake sure you have:');
        console.log('  - PostgreSQL installed and running');
        console.log('  - Created a database named "hospital_db" (or update DB_NAME in .env)');
        console.log('  - Correct credentials in .env file');
        process.exit(1);
    }

    // Create tables
    console.log('\n2️⃣ Creating database tables...');
    try {
        await executeQuery(createTablesSQL);
        console.log('✅ Tables created successfully');
    } catch (error) {
        console.error('❌ Error creating tables:', error.message);
        process.exit(1);
    }

    // Insert sample data
    console.log('\n3️⃣ Inserting sample data...');
    try {
        await executeQuery(insertSampleDataSQL);
        console.log('✅ Sample data inserted successfully');
    } catch (error) {
        console.error('❌ Error inserting sample data:', error.message);
        process.exit(1);
    }

    // Verify data
    console.log('\n4️⃣ Verifying data...');
    try {
        const patients = await executeQuery('SELECT COUNT(*) FROM patients');
        const doctors = await executeQuery('SELECT COUNT(*) FROM doctors');
        const appointments = await executeQuery('SELECT COUNT(*) FROM appointments');
        const records = await executeQuery('SELECT COUNT(*) FROM medical_records');

        console.log(`✅ Patients: ${patients[0].count}`);
        console.log(`✅ Doctors: ${doctors[0].count}`);
        console.log(`✅ Appointments: ${appointments[0].count}`);
        console.log(`✅ Medical Records: ${records[0].count}`);
    } catch (error) {
        console.error('❌ Error verifying data:', error.message);
    }

    console.log('\n🎉 Database setup completed successfully!\n');
    process.exit(0);
}

// Run setup
setupDatabase();
