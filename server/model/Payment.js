const db = require('../config/db');

const createPayment = async (paymentData) => {
    const [rows] = await db.query(`
            insert into payments (loan_id, amount_paid, payment_date, collected_by_id, method, type)
            values (?, ?, ?, ?, ?, ?)
        `, [
            paymentData.loan_id,
            paymentData.amount_paid,
            paymentData.payment_date,
            paymentData.collected_by_id,
            paymentData.method,
            paymentData.type
        ]);

    return rows;
}


module.exports = {
    createPayment
};