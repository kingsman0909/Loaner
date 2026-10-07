const db = require('../config/db');

const createPayment = async (paymentData) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Get loan and lock it
        const [loans] = await connection.query(
            `
            SELECT id, totalDue, status
            FROM loans
            WHERE id = ?
            FOR UPDATE
            `,
            [paymentData.loan_id]
        );

        if (loans.length === 0) {
            throw new Error('Loan not found');
        }

        const loan = loans[0];

        if (loan.status === 'paid' || loan.status === 'closed') {
            throw new Error('This loan is already paid or closed');
        }

        // 2. Get total payments made for this loan
        const [paymentTotals] = await connection.query(
            `
            SELECT COALESCE(SUM(amount_paid), 0) AS totalPaid
            FROM payments
            WHERE loan_id = ?
            `,
            [paymentData.loan_id]
        );

        const totalPaid = Number(paymentTotals[0].totalPaid);
        const totalDue = Number(loan.totalDue);

        // Current remaining balance
        const currentBalance = totalDue - totalPaid;

        const amountPaid = Number(paymentData.amount_paid);

        if (amountPaid <= 0) {
            throw new Error('Payment amount must be greater than 0');
        }

        if (amountPaid > currentBalance) {
            throw new Error(
                `Payment exceeds the remaining balance of ${currentBalance}`
            );
        }

        // 3. Insert payment
        const [paymentResult] = await connection.query(
            `
            INSERT INTO payments
            (loan_id, amount_paid, payment_date, collected_by_id, method, type)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                paymentData.loan_id,
                amountPaid,
                paymentData.payment_date,
                paymentData.collected_by_id,
                paymentData.method,
                paymentData.type
            ]
        );

        // 4. Calculate new balance
        const newBalance = currentBalance - amountPaid;

        // 5. Update loan status
        const newStatus = newBalance === 0
            ? 'paid'
            : 'active';

        await connection.query(
            `
            UPDATE loans
            SET status = ?
            WHERE id = ?
            `,
            [
                newStatus,
                paymentData.loan_id
            ]
        );

        // 6. Commit transaction
        await connection.commit();

        return {
            paymentId: paymentResult.insertId,
            loanId: paymentData.loan_id,
            amountPaid,
            remainingBalance: newBalance,
            status: newStatus
        };

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
};

module.exports = {
    createPayment
};