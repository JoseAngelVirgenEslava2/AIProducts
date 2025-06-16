import nodemailer from "nodemailer";

export class EmailNotificador {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async enviarCorreo(dest: string, asunto: string, mensaje: string) {
    await this.transporter.sendMail({
      from: `PriceComparer <${process.env.SMTP_USER}>`,
      to: dest,
      subject: asunto,
      text: mensaje,
    });
  }
}