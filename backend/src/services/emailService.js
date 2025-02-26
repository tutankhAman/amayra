import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

const createOrderItemsHTML = (items) => {
    console.log('Creating HTML for items:', JSON.stringify(items, null, 2));
    
    return items.map(item => {
        // Ensure we have valid data
        const productId = item.productId || 'N/A';
        const quantity = item.quantity || 0;
        const size = item.size || 'N/A';
        const price = item.price || 0;
        
        return `
            <tr>
                <td>${productId}</td>
                <td>${quantity}</td>
                <td>${size}</td>
                <td>${formatCurrency(price)}</td>
                <td>${formatCurrency(price * quantity)}</td>
            </tr>
        `;
    }).join('');
};

export const sendOrderNotification = async ({ orderId, customerName, totalAmount, items }) => {
    console.log('Received order data:', {
        orderId,
        customerName,
        totalAmount,
        itemsCount: items?.length,
        firstItem: items?.[0]
    });

    // Validate items data
    const validatedItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        price: item.price
    }));

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'mraza2m@gmail.com',
        subject: `New Order #${orderId} Received`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color:rgb(243, 171, 198);">New Order Received</h1>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                    <p><strong>Order ID:</strong> ${orderId}</p>
                    <p><strong>Customer Name:</strong> ${customerName}</p>
                    <p><strong>Total Amount:</strong> ${formatCurrency(totalAmount)}</p>
                </div>
                
                <h2 style="margin-top: 20px;">Order Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="background-color: #1a73e8; color: white;">
                        <tr>
                            <th style="padding: 10px; text-align: left;">Product ID</th>
                            <th style="padding: 10px;">Quantity</th>
                            <th style="padding: 10px;">Size</th>
                            <th style="padding: 10px;">Price</th>
                            <th style="padding: 10px;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${createOrderItemsHTML(validatedItems)}
                    </tbody>
                </table>
                
                <div style="margin-top: 20px; text-align: right;">
                    <p><strong>Total Amount: ${formatCurrency(totalAmount)}</strong></p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error.message);
        throw error;
    }
};
