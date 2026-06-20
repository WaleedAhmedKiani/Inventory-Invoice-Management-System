export const invoiceEmailTemplate = (invoice: any) => {
    return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #111;">Invoice Created</h2>

        <p><b>Customer:</b> ${invoice.customerName}</p>
        <p><b>Invoice ID:</b> ${invoice.id}</p>
        <p><b>Status:</b> ${invoice.status}</p>

        <hr/>

        <h3>Summary</h3>
        <p><b>Subtotal:</b> $${invoice.subtotal}</p>
        <p><b>Tax:</b> $${invoice.tax}</p>
        <p><b>Discount:</b> $${invoice.discount}</p>

        <h3 style="margin-top: 10px;">
            Total: $${invoice.total}
        </h3>

        <hr/>

        <p style="color: gray; font-size: 12px;">
            Thank you for using our system.
        </p>
    </div>
    `;
};