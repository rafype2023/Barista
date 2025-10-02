import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import sgMail from '@sendgrid/mail';

// The API key is set when the server starts.
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// FIX: Renamed Request and Response to avoid type conflicts.
export const sendCodeHandler = async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const msg = {
      to: email,
      // IMPORTANT: Replace this with your own verified sender email address in SendGrid.
      from: 'rafyperez@hotmail.com', 
      subject: 'Tu código de verificación de Barista Coffee',
      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 20px;">
          <h2>Hola ${name},</h2>
          <p>Gracias por usar Barista Coffee Pre-order.</p>
          <p>Tu código de verificación es:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; background-color: #f0f0f0; padding: 10px 20px; border-radius: 8px; display: inline-block;">
            ${code}
          </p>
          <p>Este código expirará en 10 minutos.</p>
          <hr/>
          <p style="font-size: 12px; color: #888;">Si no solicitaste este código, puedes ignorar este correo.</p>
        </div>
      `,
    };

    await sgMail.send(msg);

    // We send the code back to the client for verification.
    return res.status(200).json({ success: true, code: code });

  } catch (error: any) {
    console.error('SendGrid Error:', error.response?.body || error.message);
    return res.status(500).json({ success: false, error: 'Failed to send verification code.' });
  }
};