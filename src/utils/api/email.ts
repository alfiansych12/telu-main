/**
 * Simple Email Utility
 * In a real production environment, integrate with Resend, Nodemailer, or SendGrid
 */

export async function sendEmailNotification(to: string, subject: string, message: string) {
    console.log(`[EMAIL] Sending to: ${to}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Message: ${message}`);

    // Example for Resend (if you have the API key)
    /*
    if (!process.env.RESEND_API_KEY) return;
    
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
            from: 'PUTI Management <notifications@yourdomain.com>',
            to: [to],
            subject: subject,
            html: `<div>${message}</div>`
        })
    });
    */

    return { success: true };
}
