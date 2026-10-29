import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (this.isConfigured()) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT ?? 587) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      this.logger.warn(
        'SMTP no configurado (SMTP_HOST ausente): los códigos OTP no se enviarán por correo.',
      );
    }
  }

  isConfigured(): boolean {
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  }

  async sendOtpEmail(to: string, code: string): Promise<void> {
    if (!this.transporter) throw new Error('SMTP no configurado');
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'Importify <no-reply@importify.com>';
    await this.transporter.sendMail({
      from,
      to,
      subject: 'Código de acceso al panel de administración',
      text: `Tu código de acceso es: ${code}\nVálido por 10 minutos. Si no solicitaste este código, ignora este mensaje.`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #111827; margin: 0 0 8px;">Panel de administración</h2>
          <p style="color: #6b7280; margin: 0 0 24px;">Ingresa este código para acceder:</p>
          <p style="font-size: 32px; letter-spacing: 12px; font-weight: 700; color: #5B5BEF; text-align: center; background: #f3f4f6; border-radius: 12px; padding: 16px; margin: 0;">${code}</p>
          <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0;">Válido por 10 minutos. Si no solicitaste este código, ignora este mensaje.</p>
        </div>`,
    });
  }
}
