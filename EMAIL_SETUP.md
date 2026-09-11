# Email Confirmation System - Setup Guide

## Overview

This document provides complete instructions for setting up the automatic email confirmation system for the SMAE website's three forms:

1. **Student Corner Application**
2. **Membership Application**
3. **Contact Form**

## How It Works

### Email Flow

```
User submits form → Data saved to Google Sheets → Confirmation email sent to user → Success message displayed
```

### Architecture

- **Frontend:** HTML forms with JavaScript validation
- **Backend:** Node.js/Express server with Nodemailer integration
- **Email Service:** Gmail SMTP using App Password authentication
- **Database:** Google Sheets (primary storage)
- **Sender Email:** help.smae@gmail.com

### Key Features

✅ Automatic email confirmation after successful form submission  
✅ Professional HTML email templates with SMAE branding  
✅ Graceful degradation - form submission succeeds even if email fails  
✅ Secure credential management via environment variables  
✅ Gmail SMTP with App Password (no plain password storage)  
✅ Email verification on server startup  

---

## Setup Instructions

### Step 1: Create a Google App Password

Google App Passwords allow applications to send emails through Gmail without exposing your main Gmail password.

#### Instructions:

1. **Sign in to your Google Account:**
   - Go to https://myaccount.google.com/
   - Sign in with `help.smae@gmail.com`

2. **Enable 2-Step Verification (if not already enabled):**
   - Go to https://myaccount.google.com/security
   - Under "How you sign in to Google," click **2-Step Verification**
   - Follow the prompts to enable it

3. **Create an App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Or navigate: Google Account → Security → 2-Step Verification → App passwords
   - In the "Select app" dropdown, choose **Mail**
   - In the "Select device" dropdown, choose **Other (Custom name)**
   - Enter a name like: `SMAE Website Email Service`
   - Click **Generate**

4. **Copy the App Password:**
   - Google will display a 16-character password (e.g., `abcd efgh ijkl mnop`)
   - **Copy this password** - you'll need it in the next step
   - Note: Remove the spaces when entering it in the `.env` file

---

### Step 2: Configure Environment Variables

1. **Locate your `.env` file:**
   - File path: `c:\Users\avsss\Desktop\smae\.env`
   - If it doesn't exist, copy `.env.example` and rename it to `.env`

2. **Add the following email configuration:**

```env
# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=help.smae@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=help.smae@gmail.com
```

3. **Replace `abcdefghijklmnop` with your actual App Password** (remove spaces)

4. **Save the `.env` file**

⚠️ **IMPORTANT:** Never commit the `.env` file to Git. It should already be in `.gitignore`.

---

### Step 3: Verify the Configuration

1. **Install dependencies (if not already done):**

```bash
npm install
```

2. **Start the server:**

```bash
npm start
```

3. **Check the console output:**

You should see:

```
Server running on http://localhost:5000
Database: ./smae-contacts.db

📧 Verifying email configuration...
✅ Email service configured successfully
📧 Sender: help.smae@gmail.com
✅ Email server connection verified
```

If you see ✅ **Email server connection verified**, the setup is complete!

#### Troubleshooting Connection Issues

If you see an error like:

```
❌ Email server connection failed: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Common causes:**
- Incorrect App Password (make sure you removed spaces)
- 2-Step Verification not enabled on the Google account
- App Password not generated correctly
- Wrong email address in `EMAIL_USER`

**Solutions:**
1. Double-check the App Password (regenerate if needed)
2. Ensure 2-Step Verification is enabled
3. Confirm `EMAIL_USER` is exactly `help.smae@gmail.com`
4. Try regenerating the App Password

---

## Email Templates

### 1. Student Corner Confirmation Email

**Subject:** Application Submitted Successfully – Student Corner

**Recipients:** Applicants who submit the Student Corner form

**Template includes:**
- Applicant name, email, phone
- Designation (Student / Team Captain, etc.)
- Institute name and address
- Submission date
- SMAE contact information

---

### 2. Membership Confirmation Email

**Subject:** Membership Application Submitted Successfully

**Recipients:** Users who apply for membership

**Template includes:**
- Member name, email, phone
- Membership type (🎓 Student or 🏆 Life Membership)
- Submission date
- SMAE contact information

---

### 3. Contact Form Confirmation Email

**Subject:** We Received Your Message

**Recipients:** Users who submit the contact form

**Template includes:**
- Contact name, email, phone
- Subject and message content
- Submission date
- SMAE contact information

---

## Testing Checklist

### Test 1: Student Corner Form

1. Open http://localhost:5000/student-corner.html (or your deployed URL)
2. Fill out the form with a **real email address you can access**
3. Complete the CAPTCHA
4. Click "Apply Now"
5. **Expected Results:**
   - ✅ Success message: "Application submitted successfully! A confirmation email has been sent to your email address."
   - ✅ Data appears in Google Sheets "Student Applications" tab
   - ✅ Confirmation email received at the provided email address
   - ✅ Console shows: `✅ Confirmation email sent to: [email]`

### Test 2: Membership Form

1. Open http://localhost:5000/membership.html
2. Fill out the form with a real email address
3. Select membership type (Student or Life)
4. Complete the CAPTCHA
5. Click "Submit Application"
6. **Expected Results:**
   - ✅ Success message: "Membership application submitted successfully! A confirmation email has been sent to your email address."
   - ✅ Data appears in Google Sheets "Memberships" tab
   - ✅ Confirmation email received
   - ✅ Console shows: `✅ Confirmation email sent to: [email]`

### Test 3: Contact Form

1. Open http://localhost:5000/contact.html
2. Fill out all fields with real information
3. Complete the CAPTCHA
4. Click "Send Message"
5. **Expected Results:**
   - ✅ Success message: "Your message has been sent successfully! A confirmation email has been sent to your email address."
   - ✅ Data appears in Google Sheets "Contact Messages" tab
   - ✅ Confirmation email received
   - ✅ Console shows: `✅ Confirmation email sent to: [email]`

### Test 4: Error Handling

**Test invalid email address:**
1. Submit a form with an invalid email (e.g., `test@invalid`)
2. **Expected:** Validation error before submission

**Test email service failure:**
1. Stop the server
2. Temporarily set `EMAIL_PASSWORD` to an incorrect value in `.env`
3. Restart the server
4. Submit a form
5. **Expected Results:**
   - ⚠️ Console warning: `⚠️ Failed to send confirmation email`
   - ✅ Form submission still succeeds (data saved to Google Sheets)
   - ✅ User sees success message (but email won't be delivered)

**Test duplicate membership email:**
1. Submit the membership form with an email already in the system
2. **Expected:** Error message: "A membership with this email already exists"

---

## Deployment Considerations

### Environment Variables

When deploying to production (e.g., Heroku, Vercel, AWS, etc.), configure these environment variables:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=help.smae@gmail.com
EMAIL_PASSWORD=your-google-app-password
EMAIL_FROM=help.smae@gmail.com
```

### Security Best Practices

✅ **Never commit `.env` to version control**  
✅ **Use environment variables for all secrets**  
✅ **Keep App Password secure** (treat it like a password)  
✅ **Regenerate App Password if compromised**  
✅ **Enable 2-Step Verification on Gmail account**  
✅ **Use HTTPS in production** (email credentials transmitted securely)  

### Gmail Sending Limits

Gmail has sending limits for App Passwords:

- **Free Gmail account:** ~500 emails/day
- **Google Workspace:** ~2,000 emails/day

For higher volumes, consider:
- SendGrid (free tier: 100 emails/day)
- Amazon SES (pay-as-you-go)
- Mailgun (free tier: 5,000 emails/month)

---

## Monitoring and Logs

### Server Logs

The server logs email activity to the console:

**Successful email:**
```
✅ Email sent successfully to: user@example.com
📬 Message ID: <unique-message-id>
```

**Failed email:**
```
❌ Error sending email to: user@example.com
Error details: [error message]
```

**Email not configured:**
```
⚠️ Email service not configured. Skipping email to: user@example.com
⚠️ Please configure EMAIL_USER and EMAIL_PASSWORD in .env file
```

---

## Troubleshooting

### Issue: Emails not being sent

**Check:**
1. `.env` file exists and contains correct credentials
2. Server console shows: `✅ Email server connection verified`
3. Google App Password is correct (16 characters, no spaces)
4. 2-Step Verification is enabled on `help.smae@gmail.com`

### Issue: Emails going to spam

**Solutions:**
1. Ask recipients to mark as "Not Spam"
2. Add `help.smae@gmail.com` to their contacts
3. Ensure the sender email domain matches (already configured)
4. Consider using a custom domain email with SPF/DKIM records

### Issue: "Invalid login" error

**Cause:** Incorrect App Password or 2-Step Verification not enabled

**Solution:**
1. Verify 2-Step Verification is enabled
2. Regenerate the App Password
3. Copy the new App Password (remove spaces)
4. Update `.env` file
5. Restart the server

### Issue: Form submits but no email received

**Check:**
1. Server console for email status logs
2. Email spam/junk folder
3. Correct email address was entered in the form
4. Server logs show `✅ Confirmation email sent to: [email]`

---

## File Structure

```
smae/
├── .env                         # Environment variables (DO NOT COMMIT)
├── .env.example                 # Template for environment variables
├── server.js                    # Main server file (email integration)
├── package.json                 # Dependencies (includes nodemailer)
├── lib/
│   ├── emailService.js          # Email sending utility
│   ├── emailTemplates.js        # HTML email templates
│   ├── googleSheets.js          # Google Sheets integration
│   └── middleware.js            # Validation middleware
├── contact.html                 # Contact form
├── student-corner.html          # Student Corner form
├── membership.html              # Membership form
├── script.js                    # Frontend form handlers
└── EMAIL_SETUP.md              # This documentation
```

---

## Support and Maintenance

### Changing the Sender Email

To use a different sender email:

1. Update `.env`:
   ```env
   EMAIL_USER=new-email@gmail.com
   EMAIL_FROM=new-email@gmail.com
   ```

2. Generate a new App Password for the new Gmail account

3. Restart the server

### Updating Email Templates

Email templates are in `lib/emailTemplates.js`:

- `getStudentCornerEmailTemplate()` - Student Corner emails
- `getMembershipEmailTemplate()` - Membership emails
- `getContactEmailTemplate()` - Contact form emails

Edit these functions to customize email content, styling, or branding.

### Switching Email Providers

To use SendGrid, Mailgun, or another service:

1. Install the appropriate package (e.g., `@sendgrid/mail`)
2. Update `lib/emailService.js` with the new provider's API
3. Update `.env` with the new credentials

---

## Summary

### What Was Implemented

✅ **Backend email service** using Nodemailer with Gmail SMTP  
✅ **Professional HTML email templates** for all three forms  
✅ **Automatic confirmation emails** sent after successful form submission  
✅ **Graceful error handling** (form succeeds even if email fails)  
✅ **Environment variable configuration** for secure credential storage  
✅ **Email verification on server startup**  
✅ **Updated success messages** to inform users about confirmation emails  

### What You Need to Do

1. ✅ **Create Google App Password** for help.smae@gmail.com
2. ✅ **Add credentials to `.env` file**
3. ✅ **Start the server** and verify email connection
4. ✅ **Test all three forms** with real email addresses
5. ✅ **Deploy to production** with environment variables configured

---

## Quick Reference

### Environment Variables Required

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=help.smae@gmail.com
EMAIL_PASSWORD=your-google-app-password
EMAIL_FROM=help.smae@gmail.com
```

### Start Server

```bash
npm start
```

### Test Forms

- Student Corner: http://localhost:5000/student-corner.html
- Membership: http://localhost:5000/membership.html
- Contact: http://localhost:5000/contact.html

---

**Need Help?**

Contact the development team or refer to:
- Nodemailer documentation: https://nodemailer.com/
- Google App Passwords guide: https://support.google.com/accounts/answer/185833
