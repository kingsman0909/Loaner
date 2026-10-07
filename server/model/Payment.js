const db = require('../config/db');

const createPayment = async (paymentData) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Get the loan and lock it
        const [loans] = await connection.query(
            `
            SELECT id, totalDue, balance, status
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

        const amountPaid = Number(paymentData.amount_paid);
        const currentBalance = Number(loan.balance);

        if (amountPaid <= 0) {
            throw new Error('Payment amount must be greater than 0');
        }

        if (amountPaid > currentBalance) {
            throw new Error(
                `Payment exceeds the remaining balance of ${currentBalance}`
            );
        }

        // 2. Insert payment
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

        // 3. Calculate new balance
        const newBalance = currentBalance - amountPaid;

        // 4. Determine status
        const newStatus = newBalance === 0
            ? 'paid'
            : 'active';

        // 5. Update loan
        await connection.query(
            `
            UPDATE loans
            SET balance = ?,
                status = ?
            WHERE id = ?
            `,
            [
                newBalance,
                newStatus,
                paymentData.loan_id
            ]
        );

        // 6. Commit everything
        await connection.commit();

        return {
            paymentId: paymentResult.insertId,
            loanId: paymentData.loan_id,
            amountPaid,
            previousBalance: currentBalance,
            newBalance,
            status: newStatus
        };

    } catch (error) {
        // Undo payment INSERT and loan UPDATE
        await connection.rollback();

        throw error;

    } finally {
        // Return connection to pool
        connection.release();
    }
};

module.exports = {
    createPayment
};