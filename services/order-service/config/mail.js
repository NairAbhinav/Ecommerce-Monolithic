import nodemailer from 'nodemailer';

export const sendOrderEmail = async (order, user) => {
  const { totalAmount, paymentMethod, _id } = order;

  const emailBody = `
    <h1>Order Confirmation</h1>
    <p>Hi ${user.name},</p>
    <p>Thank you for shopping with us! Your order <strong>#${_id}</strong> has been successfully placed.</p>
    <h3>Order Summary</h3>
    <ul>
      ${order.products.map(p => `<li>${p.name} (Qty: ${p.quantity}) - ₹${p.price}</li>`).join('')}
    </ul>
    <p><strong>Total Paid:</strong> ₹${totalAmount}</p>
    <p><strong>Payment Method:</strong> ${paymentMethod}</p>
    <p>We are processing your order and will notify you when it ships.</p>
  `;

  // Fallback if SMTP parameters are missing
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log('====== MOCK EMAIL SENT ======');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Order Confirmation #${_id}`);
    console.log(`Body:\n${emailBody.replace(/<[^>]*>/g, '')}`);
    console.log('==============================');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: '"Mobile & Accessories Market" <no-reply@mobilecom.com>',
      to: user.email,
      subject: `Order Confirmation #${_id}`,
      html: emailBody
    });
    console.log(`Order confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error('Email Delivery Failed:', error);
  }
};
