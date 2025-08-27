import nodemailer from 'nodemailer';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { env } from './env.js';
import type { ContactRequest } from './schemas.js';

export class Mailer {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransporter({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
  }

  async sendContactEmail(contact: ContactRequest, sourceIp: string, userAgent: string): Promise<void> {
    const subject = `New Contact Form Submission - ${contact.clinic}`;
    const text = this.formatContactEmail(contact, sourceIp, userAgent);

    if (this.transporter) {
      await this.transporter.sendMail({
        from: env.SMTP_USER,
        to: env.CONTACT_EMAIL,
        subject,
        text,
      });
    } else {
      // Development mode: write to file
      await this.writeToOutbox(subject, text);
    }
  }

  private formatContactEmail(contact: ContactRequest, sourceIp: string, userAgent: string): string {
    return `
New contact form submission from DentClinicAI website:

Name: ${contact.name}
Role: ${contact.role}
Clinic: ${contact.clinic}
Location: ${contact.cityCountry}
Preferred Contact: ${contact.contactMethod}
Email: ${contact.email}
${contact.phone ? `Phone: ${contact.phone}` : ''}
${contact.message ? `Message: ${contact.message}` : ''}

Source IP: ${sourceIp}
User Agent: ${userAgent}
Timestamp: ${new Date().toISOString()}
    `.trim();
  }

  private async writeToOutbox(subject: string, text: string): Promise<void> {
    const outboxDir = './var';
    await mkdir(outboxDir, { recursive: true });
    
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.eml`;
    const filepath = join(outboxDir, 'maildev.outbox', filename);
    
    await mkdir(join(outboxDir, 'maildev.outbox'), { recursive: true });
    
    const emlContent = `Subject: ${subject}
From: ${env.SMTP_USER || 'noreply@dentclinicai.com'}
To: ${env.CONTACT_EMAIL}
Date: ${new Date().toUTCString()}

${text}`;

    await writeFile(filepath, emlContent);
  }
}