const db = require("../config/db");

const getMemberData = async (memberId) => {
    // =========================================================
    // MEMBER + LOANER
    // =========================================================

    const [memberRows] = await db.execute(`
        SELECT
            m.id,
            m.username,
            m.firstname,
            m.lastname,
            CONCAT(m.firstname, ' ', m.lastname) AS full_name,
            m.age,
            m.source_of_income,
            m.province,
            m.city,
            m.brgy,
            m.subd,
            m.contact,
            m.status,

            l.id AS loaner_id,
            l.username AS loaner_username,
            l.firstname AS loaner_firstname,
            l.lastname AS loaner_lastname

        FROM member m

        LEFT JOIN loaner l
            ON l.id = m.loaner_id

        WHERE m.id = ?

        LIMIT 1
    `, [memberId]);

    if (!memberRows.length) {
        return null;
    }

    const member = memberRows[0];


    // =========================================================
    // LOAN STATISTICS
    // =========================================================

    const [statisticsRows] = await db.execute(`
        SELECT

            COUNT(*) AS total_loans,

            SUM(
                CASE
                    WHEN status = 'active'
                    THEN 1
                    ELSE 0
                END
            ) AS active_loans,

            SUM(
                CASE
                    WHEN status = 'overdue'
                    THEN 1
                    ELSE 0
                END
            ) AS overdue_loans,

            SUM(
                CASE
                    WHEN status = 'paid'
                    THEN 1
                    ELSE 0
                END
            ) AS paid_loans,

            SUM(
                CASE
                    WHEN status = 'closed'
                    THEN 1
                    ELSE 0
                END
            ) AS closed_loans,

            COALESCE(
                SUM(principalAmount),
                0
            ) AS total_borrowed,

            COALESCE(
                SUM(totalDue),
                0
            ) AS total_due

        FROM loans

        WHERE member_id = ?
    `, [memberId]);

    const statistics = statisticsRows[0];


    // =========================================================
    // BALANCE
    // =========================================================

    const [balanceRows] = await db.execute(`
        SELECT

            COALESCE(
                SUM(lo.totalDue),
                0
            ) AS total_due,

            COALESCE(
                (
                    SELECT SUM(p.amount_paid)

                    FROM payments p

                    INNER JOIN loans lp
                        ON lp.id = p.loan_id

                    WHERE lp.member_id = ?
                ),
                0
            ) AS total_paid,

            GREATEST(
                COALESCE(
                    SUM(lo.totalDue),
                    0
                )
                -
                COALESCE(
                    (
                        SELECT SUM(p.amount_paid)

                        FROM payments p

                        INNER JOIN loans lp
                            ON lp.id = p.loan_id

                        WHERE lp.member_id = ?
                    ),
                    0
                ),
                0
            ) AS remaining_balance

        FROM loans lo

        WHERE lo.member_id = ?

        AND lo.status IN (
            'active',
            'overdue'
        )
    `, [
        memberId,
        memberId,
        memberId
    ]);

    const balance = balanceRows[0];


    // =========================================================
    // LOANS
    // =========================================================

    const [loanRows] = await db.execute(`
        SELECT

            lo.id,
            lo.loaner_id,
            lo.member_id,
            lo.loan_type_id,

            lo.principalAmount,
            lo.totalDue,
            lo.status,
            lo.due_date,

            lo.created_at,

            lt.type AS loan_type,
            lt.interest AS interest_rate,

            COALESCE(
                (
                    SELECT SUM(p.amount_paid)

                    FROM payments p

                    WHERE p.loan_id = lo.id
                ),
                0
            ) AS total_paid,

            GREATEST(
                lo.totalDue
                -
                COALESCE(
                    (
                        SELECT SUM(p.amount_paid)

                        FROM payments p

                        WHERE p.loan_id = lo.id
                    ),
                    0
                ),
                0
            ) AS remaining_balance

        FROM loans lo

        LEFT JOIN loan_type lt
            ON lt.id = lo.loan_type_id

        WHERE lo.member_id = ?

        ORDER BY lo.id DESC
    `, [memberId]);


    // =========================================================
    // PAYMENTS
    // =========================================================

    const [paymentRows] = await db.execute(`
        SELECT

            p.id,
            p.loan_id,
            p.amount_paid,
            p.payment_date,

            CONCAT(
                l.firstname,
                ' ',
                l.lastname
            ) AS collected_by

        FROM payments p

        INNER JOIN loans lo
            ON lo.id = p.loan_id

        LEFT JOIN loaner l
            ON l.id = p.collected_by_id

        WHERE lo.member_id = ?

        ORDER BY
            p.payment_date DESC,
            p.id DESC
    `, [memberId]);


    // =========================================================
    // ATTACH PAYMENTS TO LOANS
    // =========================================================

    const loans = loanRows.map(loan => {

        const payments = paymentRows.filter(
            payment =>
                Number(payment.loan_id) === Number(loan.id)
        );

        return {
            ...loan,
            payments
        };
    });


    // =========================================================
    // FINAL RESPONSE
    // =========================================================

    return {
        member: {
            id: member.id,
            username: member.username,
            firstname: member.firstname,
            lastname: member.lastname,
            full_name: member.full_name,
            age: member.age,
            source_of_income: member.source_of_income,
            province: member.province,
            city: member.city,
            brgy: member.brgy,
            subd: member.subd,
            contact: member.contact,
            status: member.status
        },

        loaner: {
            id: member.loaner_id,
            username: member.loaner_username,
            firstname: member.loaner_firstname,
            lastname: member.loaner_lastname,
            full_name:
                `${member.loaner_firstname || ""} ${member.loaner_lastname || ""}`.trim()
        },

        balance: {
            total_due: Number(balance.total_due || 0),
            total_paid: Number(balance.total_paid || 0),
            remaining_balance: Number(
                balance.remaining_balance || 0
            )
        },

        statistics: {
            total_loans: Number(statistics.total_loans || 0),
            active_loans: Number(statistics.active_loans || 0),
            overdue_loans: Number(statistics.overdue_loans || 0),
            paid_loans: Number(statistics.paid_loans || 0),
            closed_loans: Number(statistics.closed_loans || 0),
            total_borrowed: Number(
                statistics.total_borrowed || 0
            ),
            total_due: Number(
                statistics.total_due || 0
            )
        },

        loans
    };
};


module.exports = {
    getMemberData
};