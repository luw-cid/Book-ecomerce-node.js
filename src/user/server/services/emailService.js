const axios = require('axios');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

const sendOrderConfirmation = async (recipientEmail, order) => {
    try {
        if (!RESEND_API_KEY) {
            console.warn('⚠️ Resend API key not configured - skipping email');
            return false;
        }

        const emailData = {
            from: `Book Store <${RESEND_FROM_EMAIL}>`,
            to: recipientEmail,
            subject: `Order Confirmation - ${order.orderNumber}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; border-radius: 8px; padding: 24px;">
            <h2 style="color: #1a4d2e; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px;">
                Order Confirmation <span style="color: #888; font-size: 16px;">#${order.orderNumber}</span>
            </h2>
            <p>Hi <b>${order.shippingAddress.fullName}</b>,</p>
            <p>Thank you for your order! Here is your invoice:</p>
            <table style="width:100%; border-collapse:collapse; margin: 24px 0;">
                <thead>
                <tr style="background:#e8f5e9;">
                    <th align="left" style="padding:8px; border-bottom:1px solid #ddd;">Product</th>
                    <th align="center" style="padding:8px; border-bottom:1px solid #ddd;">Quantity</th>
                    <th align="right" style="padding:8px; border-bottom:1px solid #ddd;">Unit Price</th>
                    <th align="right" style="padding:8px; border-bottom:1px solid #ddd;">Total</th>
                </tr>
                </thead>
                <tbody>
                ${order.items.map(item => {
                    const product = item.product || {};
                    const productName = product.name || 'Unknown Product';
                    const productAuthor = product.author || '';
                    
                    return `
                    <tr>
                    <td style="padding:8px; border-bottom:1px solid #eee;">
                        <div style="font-weight:bold; margin-bottom:4px;">${productName}</div>
                        ${productAuthor ? `<div style="font-size:12px; color:#666;">by ${productAuthor}</div>` : ''}
                    </td>
                    <td align="center" style="padding:8px; border-bottom:1px solid #eee;">${item.quantity}</td>
                    <td align="right" style="padding:8px; border-bottom:1px solid #eee;">${item.price.toLocaleString()} đ</td>
                    <td align="right" style="padding:8px; border-bottom:1px solid #eee;">${(item.price * item.quantity).toLocaleString()} đ</td>
                    </tr>
                    `;
                }).join('')}
                </tbody>
                <tfoot>
                <tr>
                    <td colspan="3" align="right" style="padding:8px; font-weight:bold;">Subtotal:</td>
                    <td align="right" style="padding:8px;">${order.subtotal?.toLocaleString() || order.total?.toLocaleString()} đ</td>
                </tr>
                <tr>
                    <td colspan="3" align="right" style="padding:8px; font-weight:bold;">Shipping:</td>
                    <td align="right" style="padding:8px;">${order.shipping ? order.shipping.toLocaleString() + ' đ' : 'Free'}</td>
                </tr>
                <tr>
                    <td colspan="3" align="right" style="padding:8px; font-weight:bold;">Tax:</td>
                    <td align="right" style="padding:8px;">${order.tax ? order.tax.toLocaleString() + ' đ' : '0 đ'}</td>
                </tr>
                <tr style="background:#e8f5e9;">
                    <td colspan="3" align="right" style="padding:12px; font-size:18px; font-weight:bold;">Total:</td>
                    <td align="right" style="padding:12px; font-size:18px; font-weight:bold; color:#1a4d2e;">${order.total.toLocaleString()} đ</td>
                </tr>
                </tfoot>
            </table>
            <h3 style="margin-top:32px; color:#1a4d2e;">Shipping Information</h3>
            <div style="background:#fff; border-radius:6px; padding:16px; margin-bottom:24px; border:1px solid #e0e0e0;">
                <p><b>Name:</b> ${order.shippingAddress.fullName}</p>
                <p><b>Phone:</b> ${order.shippingAddress.phone || ''}</p>
                <p><b>Address:</b> ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
            </div>
            <p style="margin-top:24px;">If you have any questions, just reply to this email. We're always happy to help!</p>
            <p style="margin-top:16px; color:#1a4d2e;"><b>Book Store Team</b></p>
            <hr style="margin:32px 0 8px 0; border:none; border-top:1px solid #eee;">
            <p style="font-size:12px; color:#888;">This is an automated email. Please do not reply directly.</p>
            </div>
            `
        };

        const response = await axios.post('https://api.resend.com/emails', emailData, {
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 seconds timeout
        });

        console.log('✅ Order confirmation email sent successfully:', response.data.id);
        return true;
    } catch (error) {
        console.error('Email sending error:', error.response?.data || error.message);
        // Không để lỗi email làm fail đơn hàng
        return false;
    }
};

module.exports = { sendOrderConfirmation };