const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = process.env.DB_PATH || './smae-contacts.db';
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || 'YOUR_RECAPTCHA_SECRET_KEY';
const RECAPTCHA_ENABLED = RECAPTCHA_SECRET_KEY && !RECAPTCHA_SECRET_KEY.includes('YOUR_RECAPTCHA_SECRET_KEY');
const sheets = require('./lib/googleSheets');
const { requireAdmin, validate, contactSchema, studentSchema, membershipSchema } = require('./lib/middleware');
const { sendEmail, verifyEmailConfig } = require('./lib/emailService');
const { 
    getStudentCornerEmailTemplate, 
    getMembershipEmailTemplate, 
    getContactEmailTemplate 
} = require('./lib/emailTemplates');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// SQLite Database Connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('SQLite database connected successfully');
        initializeDatabase();
    }
});

// Initialize database table
function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating contacts table:', err);
        } else {
            console.log('Contacts table ready');
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS student_corner (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            applicantName TEXT NOT NULL,
            applicantEmail TEXT NOT NULL,
            applicantPhone TEXT NOT NULL,
            applicantDesignation TEXT NOT NULL,
            instituteName TEXT NOT NULL,
            instituteAddress TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating student_corner table:', err);
        } else {
            console.log('Student corner table ready');
        }
    });
}

// Helper function to run DB queries
function runQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

function getQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function allQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Routes

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'SMAE Database API running (SQLite)' });
});

// POST: Submit contact form
app.post('/api/contact', validate(contactSchema), async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.validatedBody;

        // Insert into Google Sheets
        const id = sheets.generateId();
        const now = new Date().toISOString();
        const rowObj = {
            id,
            name,
            email,
            phone,
            subject,
            message,
            status: 'new',
            created_at: now,
            updated_at: now,
        };

        await sheets.appendRow('Contact Messages', rowObj);

        // Send confirmation email to the user
        const emailHtml = getContactEmailTemplate({
            name,
            email,
            phone,
            subject,
            message,
            submittedDate: new Date().toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            })
        });

        const emailResult = await sendEmail({
            to: email,
            subject: 'We Received Your Message',
            html: emailHtml
        });

        // Log email status but don't fail the request if email fails
        if (emailResult.success) {
            console.log('✅ Confirmation email sent to:', email);
        } else if (!emailResult.skipped) {
            console.warn('⚠️  Failed to send confirmation email:', emailResult.message);
        }

        res.status(201).json({
            success: true,
            message: 'Thank you for contacting us! We will respond shortly. A confirmation email has been sent to your email address.',
            data: rowObj,
        });
    } catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).json({ error: 'Failed to save contact information' });
    }
});

// POST: Submit student corner form
app.post('/api/student-corner', validate(studentSchema), async (req, res) => {
    try {
        const {
            applicantName,
            applicantEmail,
            applicantPhone,
            applicantDesignation,
            instituteName,
            instituteAddress,
        } = req.validatedBody;

        // Insert into Google Sheets
        const id = sheets.generateId();
        const now = new Date().toISOString();
        const rowObj = {
            id,
            applicant_name: applicantName,
            email: applicantEmail,
            phone: applicantPhone,
            designation: applicantDesignation,
            institute_name: instituteName,
            institute_address: instituteAddress,
            city: '',
            state: '',
            pincode: '',
            application_status: 'new',
            created_at: now,
            updated_at: now,
        };

        await sheets.appendRow('Student Applications', rowObj);

        // Send confirmation email to the applicant
        const emailHtml = getStudentCornerEmailTemplate({
            applicantName,
            email: applicantEmail,
            phone: applicantPhone,
            designation: applicantDesignation,
            instituteName,
            instituteAddress,
            submittedDate: new Date().toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            })
        });

        const emailResult = await sendEmail({
            to: applicantEmail,
            subject: 'Application Submitted Successfully – Student Corner',
            html: emailHtml
        });

        // Log email status but don't fail the request if email fails
        if (emailResult.success) {
            console.log('✅ Confirmation email sent to:', applicantEmail);
        } else if (!emailResult.skipped) {
            console.warn('⚠️  Failed to send confirmation email:', emailResult.message);
        }

        res.status(201).json({ 
            success: true, 
            message: 'Application submitted successfully! A confirmation email has been sent to your email address.', 
            data: rowObj 
        });
    } catch (error) {
        console.error('Error saving student corner form:', error);
        res.status(500).json({ error: 'Failed to save student corner application' });
    }
});

// GET: Retrieve all contacts (admin only - can add authentication later)
app.get('/api/contacts', requireAdmin, async (req, res) => {
    try {
        const rows = await sheets.readRows('Contact Messages');
        // sort by created_at desc
        rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error retrieving contacts from sheets:', error);
        res.status(500).json({ error: 'Failed to retrieve contacts' });
    }
});

// GET: Retrieve single contact by ID
app.get('/api/contacts/:id', requireAdmin, async (req, res) => {
    try {
        const row = await sheets.findRowById('Contact Messages', req.params.id);
        if (!row) return res.status(404).json({ error: 'Contact not found' });
        res.json({ success: true, data: row });
    } catch (error) {
        console.error('Error retrieving contact from sheets:', error);
        res.status(500).json({ error: 'Failed to retrieve contact' });
    }
});

// DELETE: Remove contact by ID
app.delete('/api/contacts/:id', requireAdmin, async (req, res) => {
    try {
        const deleted = await sheets.deleteRow('Contact Messages', req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Contact not found' });
        res.json({ success: true, message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact from sheets:', error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});

// Memberships endpoints
// POST: Create membership
app.post('/api/memberships', validate(membershipSchema), async (req, res) => {
    try {
        const { name, email, phone, type } = req.validatedBody;

        // Prevent duplicate email
        const existing = await sheets.readRows('Memberships');
        if (existing.some(m => String(m.email || '').toLowerCase() === String(email).toLowerCase())) {
            return res.status(409).json({ error: 'A membership with this email already exists' });
        }

        const id = sheets.generateId();
        const now = new Date().toISOString();
        const rowObj = {
            id,
            name,
            email,
            phone: phone || '',
            membership_type: type,
            membership_status: 'pending',
            joined_at: '',
            created_at: now,
            updated_at: now,
        };

        await sheets.appendRow('Memberships', rowObj);

        // Send confirmation email to the applicant
        const emailHtml = getMembershipEmailTemplate({
            name,
            email,
            phone: phone || '',
            membershipType: type,
            submittedDate: new Date().toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            })
        });

        const emailResult = await sendEmail({
            to: email,
            subject: 'Membership Application Submitted Successfully',
            html: emailHtml
        });

        // Log email status but don't fail the request if email fails
        if (emailResult.success) {
            console.log('✅ Confirmation email sent to:', email);
        } else if (!emailResult.skipped) {
            console.warn('⚠️  Failed to send confirmation email:', emailResult.message);
        }

        res.status(201).json({ 
            success: true, 
            data: rowObj, 
            message: 'Membership application submitted successfully! A confirmation email has been sent to your email address.' 
        });
    } catch (error) {
        console.error('Error creating membership:', error);
        res.status(500).json({ error: 'Failed to create membership' });
    }
});

// GET: list memberships (admin only – protect later)
app.get('/api/memberships', requireAdmin, async (req, res) => {
    try {
        const rows = await sheets.readRows('Memberships');
        rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error retrieving memberships:', error);
        res.status(500).json({ error: 'Failed to retrieve memberships' });
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) console.error('Error closing database:', err);
        else console.log('Database connection closed');
        process.exit(0);
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database: ${DB_PATH}`);
    
    // Verify email configuration on startup
    console.log('\n📧 Verifying email configuration...');
    await verifyEmailConfig();
    console.log('');
});
