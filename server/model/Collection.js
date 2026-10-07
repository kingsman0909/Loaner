const db = require('../config/db');

const getMemberByPaymentHistory = async (filter = 'all') => {
let query = `
            SELECT
                p.id,

                m.id AS member_id,
                m.firstname,
                m.lastname,

                l.id AS loan_id,

                p.amount_paid AS amount_received,
                p.payment_date AS collection_date,

                l.totalDue AS amount_due,

                CASE
                    WHEN p.amount_paid IS NULL OR p.amount_paid <= 0
                        THEN 'pending'

                    WHEN p.amount_paid < l.totalDue
                        THEN 'partial'

                    WHEN p.amount_paid >= l.totalDue
                        THEN 'received'

                    ELSE 'pending'
                END AS status

            FROM payments p

            INNER JOIN loans l
                ON l.id = p.loan_id

            INNER JOIN member m
                ON m.id = l.member_id
        `;

        const params = [];

        if (filter !== 'all') {
            query += `
                HAVING type = ?
            `;

            params.push(filter);
        }

        query += `
            ORDER BY p.payment_date DESC, p.id DESC
        `;

        const [rows] = await db.query(query, params);

        return rows;
}

module.exports = {
    getCollections: getMemberByPaymentHistory
}