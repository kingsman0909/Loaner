const db = require('../config/db');


// =========================================================
// EXISTING FUNCTIONS — PRESERVED
// =========================================================

const findByUsername = async (username) => {

    console.log("model reach");

    const [rows] = await db.query(`
        SELECT *
        FROM Loaner
        WHERE username = ?
    `, [username]);

    return rows[0];
};


const createLoaner = async (Loaner) => {

    const {
        role,
        username,
        password,
        firstname,
        lastname,
        age,
        sourceOfIncome,
        contact,
        province,
        city,
        brgy,
        subd
    } = Loaner;


    const [rows] = await db.query(`
        INSERT INTO Loaner (
            username,
            password,
            firstname,
            lastname,
            age,
            source_of_income,
            province,
            city,
            brgy,
            subd,
            contact,
            role
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `, [
        username,
        password,
        firstname,
        lastname,
        age,
        sourceOfIncome,
        province,
        city,
        brgy,
        subd,
        contact,
        role
    ]);

    return rows;
};


const changePassword = async (username, newPass) => {

    const [rows] = await db.query(`
        UPDATE Loaner
        SET password = ?
        WHERE username = ?
    `, [newPass, username]);

    return rows;
};


// =========================================================
// LOANER PROFILE MANAGEMENT
// =========================================================

const findById = async (id) => {

    const [rows] = await db.query(`
        SELECT *
        FROM Loaner
        WHERE id = ?
        LIMIT 1
    `, [id]);

    return rows[0];
};


const updateProfile = async (id, data) => {

    const {
        firstname,
        lastname,
        age,
        sourceOfIncome,
        contact,
        province,
        city,
        brgy,
        subd
    } = data;

    const [rows] = await db.query(`
        UPDATE Loaner
        SET
            firstname = ?,
            lastname = ?,
            age = ?,
            source_of_income = ?,
            contact = ?,
            province = ?,
            city = ?,
            brgy = ?,
            subd = ?
        WHERE id = ?
    `, [
        firstname,
        lastname,
        age,
        sourceOfIncome,
        contact,
        province,
        city,
        brgy,
        subd,
        id
    ]);

    return rows;
};


// =========================================================
// MEMBERS MANAGED BY LOANER
// =========================================================

const getMembers = async (loanerId, options = {}) => {

    const {
        search = '',
        status = '',
        limit = 20,
        offset = 0
    } = options;

    let conditions = [
        `m.loaner_id = ?`
    ];

    let params = [loanerId];


    if (search) {

        conditions.push(`
            (
                m.firstname LIKE ?
                OR m.lastname LIKE ?
                OR m.contact LIKE ?
            )
        `);

        const keyword = `%${search}%`;

        params.push(
            keyword,
            keyword,
            keyword
        );
    }


    if (status) {

        conditions.push(`
            m.status = ?
        `);

        params.push(status);
    }


    const [rows] = await db.query(`
        SELECT

            m.*,

            CONCAT(
                m.firstname,
                ' ',
                m.lastname
            ) AS full_name,

            COUNT(DISTINCT l.id) AS total_loans,

            COUNT(
                DISTINCT CASE
                    WHEN l.status = 'active'
                    THEN l.id
                END
            ) AS active_loans,

            COUNT(
                DISTINCT CASE
                    WHEN l.status = 'overdue'
                    THEN l.id
                END
            ) AS overdue_loans

        FROM member m

        LEFT JOIN loans l
            ON l.member_id = m.id

        WHERE ${conditions.join(' AND ')}

        GROUP BY m.id

        ORDER BY m.id DESC

        LIMIT ? OFFSET ?
    `, [
        ...params,
        Number(limit),
        Number(offset)
    ]);

    return rows;
};


const countMembers = async (loanerId, status = '') => {

    let sql = `
        SELECT COUNT(*) AS total
        FROM member
        WHERE loaner_id = ?
    `;

    const params = [loanerId];


    if (status) {

        sql += `
            AND status = ?
        `;

        params.push(status);
    }


    const [rows] = await db.query(sql, params);

    return rows[0].total;
};


// =========================================================
// MEMBER DETAILS
// =========================================================

const getMember = async (loanerId, memberId) => {

    const [rows] = await db.query(`
        SELECT

            m.*,

            CONCAT(
                m.firstname,
                ' ',
                m.lastname
            ) AS full_name,

            COUNT(DISTINCT l.id) AS total_loans,

            COUNT(
                DISTINCT CASE
                    WHEN l.status = 'active'
                    THEN l.id
                END
            ) AS active_loans,

            COUNT(
                DISTINCT CASE
                    WHEN l.status = 'overdue'
                    THEN l.id
                END
            ) AS overdue_loans,

            COALESCE(
                SUM(
                    CASE
                        WHEN l.status IN ('active', 'overdue')
                        THEN l.totalDue
                        ELSE 0
                    END
                ),
                0
            ) AS total_due

        FROM member m

        LEFT JOIN loans l
            ON l.member_id = m.id

        WHERE
            m.id = ?
            AND m.loaner_id = ?

        GROUP BY m.id

        LIMIT 1
    `, [
        memberId,
        loanerId
    ]);

    return rows[0];
};


// =========================================================
// MEMBER LOAN HISTORY
// =========================================================

const getMemberLoans = async (loanerId, memberId) => {

    const [rows] = await db.query(`
        SELECT

            l.*,

            lt.type AS loan_type,

            COALESCE(
                SUM(p.amount_paid),
                0
            ) AS total_paid,

            GREATEST(
                l.totalDue -
                COALESCE(
                    SUM(p.amount_paid),
                    0
                ),
                0
            ) AS remaining_balance

        FROM loans l

        LEFT JOIN loan_type lt
            ON lt.id = l.loan_type_id

        LEFT JOIN payments p
            ON p.loan_id = l.id

        WHERE
            l.member_id = ?
            AND l.loaner_id = ?

        GROUP BY l.id

        ORDER BY l.id DESC
    `, [
        memberId,
        loanerId
    ]);

    return rows;
};

const getLoanTypes = async () => {
    const [rows] = await db.query(`select * from loan_type`);

    return rows;
}


// =========================================================
// ALL LOANS OF LOANER
// =========================================================
const getLoans = async (loanerId, options = {}) => {
    const {
        status = '',
        search = '',
        limit = 20,
        offset = 0
    } = options;

    let conditions = [
        `l.loaner_id = ?`
    ];

    let params = [loanerId];

    // =========================
    // STATUS FILTER
    // =========================
    if (status) {
        conditions.push(`l.status = ?`);
        params.push(status);
    }

    // =========================
    // SEARCH
    // =========================
    if (search && search.trim()) {

        const keyword = `%${search.trim()}%`;

        conditions.push(`
            (
                m.firstname LIKE ?
                OR m.lastname LIKE ?
                OR CONCAT(m.firstname, ' ', m.lastname) LIKE ?
                OR m.contact LIKE ?
                OR CAST(l.id AS CHAR) LIKE ?
            )
        `);

        params.push(
            keyword,
            keyword,
            keyword,
            keyword,
            keyword
        );
    }

    const whereClause = conditions.join(' AND ');

    // =========================
    // TOTAL COUNT
    // =========================
    const [countRows] = await db.query(`
        SELECT COUNT(DISTINCT l.id) AS total
        FROM loans l

        INNER JOIN member m
            ON m.id = l.member_id

        LEFT JOIN loan_type lt
            ON lt.id = l.loan_type_id

        WHERE ${whereClause}
    `, params);

    const total = Number(countRows[0]?.total || 0);

    // =========================
    // LOANS
    // =========================
    const [rows] = await db.query(`
        SELECT

            l.*,

            CONCAT(
                m.firstname,
                ' ',
                m.lastname
            ) AS member_name,

            m.contact AS member_contact,

            -- =========================
            -- LOAN TYPE
            -- =========================
            lt.type AS loan_type,

            lt.interest AS interest_rate,

            -- =========================
            -- PAYMENTS
            -- =========================
            COALESCE(
                SUM(p.amount_paid),
                0
            ) AS total_paid,

            GREATEST(
                l.totalDue -
                COALESCE(
                    SUM(p.amount_paid),
                    0
                ),
                0
            ) AS remaining_balance

        FROM loans l

        INNER JOIN member m
            ON m.id = l.member_id

        LEFT JOIN loan_type lt
            ON lt.id = l.loan_type_id

        LEFT JOIN payments p
            ON p.loan_id = l.id

        WHERE ${whereClause}

        GROUP BY l.id

        ORDER BY l.id DESC

        LIMIT ? OFFSET ?

    `, [
        ...params,
        Number(limit),
        Number(offset)
    ]);

    return {
        data: rows,
        pagination: {
            total,
            limit: Number(limit),
            offset: Number(offset),
            hasMore: Number(offset) + rows.length < total,
            nextOffset: Number(offset) + rows.length
        }
    };
};
const getLoanPerStatus = async (status, page = 1, limit = 10) => {
    try {
        page = Math.max(1, parseInt(page, 10) || 1);
        limit = Math.max(1, parseInt(limit, 10) || 10);

        const offset = (page - 1) * limit;

        const [countRows] = await db.query(`
            SELECT COUNT(*) AS total
            FROM loans
            WHERE status = ?
        `, [status]);

        const total = Number(countRows[0]?.total || 0);

        const [rows] = await db.query(`
            SELECT *
            FROM loans
            WHERE status = ?
            ORDER BY id DESC
            LIMIT ${limit} OFFSET ${offset}
        `, [status]);

        return {
            loans: rows,
            total,
            totalPage: Math.ceil(total / limit),
            page,
            limit
        };

    } catch (error) {
        console.error("GET LOANS PER STATUS ERROR:", error);
        throw error;
    }
};
// =========================================================
// FIND ONE LOAN
// =========================================================

const getLoan = async (loanerId, loanId) => {

    const [rows] = await db.query(`
        SELECT

            l.*,

            CONCAT(
                m.firstname,
                ' ',
                m.lastname
            ) AS member_name,

            m.contact AS member_contact,

            lt.type AS loan_type,

            COALESCE(
                SUM(p.amount_paid),
                0
            ) AS total_paid,

            GREATEST(
                l.totalDue -
                COALESCE(
                    SUM(p.amount_paid),
                    0
                ),
                0
            ) AS remaining_balance

        FROM loans l

        INNER JOIN member m
            ON m.id = l.member_id

        LEFT JOIN loan_type lt
            ON lt.id = l.loan_type_id

        LEFT JOIN payments p
            ON p.loan_id = l.id

        WHERE
            l.id = ?
            AND l.loaner_id = ?

        GROUP BY l.id

        LIMIT 1
    `, [
        loanId,
        loanerId
    ]);

    return rows[0];
};


// =========================================================
// LOAN PAYMENT HISTORY
// =========================================================

const getLoanPayments = async (loanerId, loanId) => {

    const [rows] = await db.query(`
        SELECT

            p.*,

            CONCAT(
                l.firstname,
                ' ',
                l.lastname
            ) AS collected_by

        FROM payments p

        INNER JOIN loaner l
            ON l.id = p.collected_by_id

        INNER JOIN loans lo
            ON lo.id = p.loan_id

        WHERE
            p.loan_id = ?
            AND lo.loaner_id = ?

        ORDER BY
            p.payment_date DESC,
            p.id DESC
    `, [
        loanId,
        loanerId
    ]);

    return rows;
};


// =========================================================
// DASHBOARD STATISTICS
// =========================================================

const getDashboardStats = async (loanerId) => {

    const [loanStats] = await db.query(`
        SELECT

            COUNT(*) AS total_loans,

            COUNT(
                CASE
                    WHEN status = 'active'
                    THEN 1
                END
            ) AS active_loans,

            COUNT(
                CASE
                    WHEN status = 'overdue'
                    THEN 1
                END
            ) AS overdue_loans,

            COUNT(
                CASE
                    WHEN status = 'paid'
                    THEN 1
                END
            ) AS paid_loans,

            COUNT(
                CASE
                    WHEN status = 'closed'
                    THEN 1
                END
            ) AS closed_loans,

            COALESCE(
                SUM(principalAmount),
                0
            ) AS total_released,

            COALESCE(
                SUM(totalDue),
                0
            ) AS total_due

        FROM loans

        WHERE loaner_id = ?
    `, [loanerId]);


    const [paymentStats] = await db.query(`
        SELECT

            COALESCE(
                SUM(p.amount_paid),
                0
            ) AS total_collected,

            COUNT(p.id) AS total_payments

        FROM payments p

        INNER JOIN loans l
            ON l.id = p.loan_id

        WHERE l.loaner_id = ?
    `, [loanerId]);


    const [memberStats] = await db.query(`
        SELECT

            COUNT(*) AS total_members,

            COUNT(
                CASE
                    WHEN status = 'approved'
                    THEN 1
                END
            ) AS approved_members,

            COUNT(
                CASE
                    WHEN status = 'pending'
                    THEN 1
                END
            ) AS pending_members

        FROM member

        WHERE loaner_id = ?
    `, [loanerId]);


    return {
        loans: loanStats[0],
        payments: paymentStats[0],
        members: memberStats[0]
    };
};


// =========================================================
// CAPITAL BALANCE
// =========================================================

const getCapitalBalance = async (loanerId) => {

    const [rows] = await db.query(`
        SELECT

            COALESCE(
                SUM(
                    CASE
                        WHEN source = 'capitalAdd'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS capital_added,

            COALESCE(
                SUM(
                    CASE
                        WHEN source = 'loanRelease'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_released,

            COALESCE(
                SUM(
                    CASE
                        WHEN source = 'PaymentCollection'
                        THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_collected

        FROM capital

        WHERE loaner_id = ?
    `, [loanerId]);


    const result = rows[0];

    result.current_capital =
        Number(result.capital_added) -
        Number(result.total_released) +
        Number(result.total_collected);


    return result;
};


// =========================================================
// CAPITAL HISTORY
// =========================================================

const getCapitalHistory = async (loanerId, limit = 50) => {

    const [rows] = await db.query(`
        SELECT *
        FROM capital
        WHERE loaner_id = ?
        ORDER BY id DESC
        LIMIT ?
    `, [
        loanerId,
        Number(limit)
    ]);

    return rows;
};


// =========================================================
// OVERDUE LOANS
// =========================================================

const getOverdueLoans = async (loanerId) => {

    const [rows] = await db.query(`
        SELECT

            l.*,

            CONCAT(
                m.firstname,
                ' ',
                m.lastname
            ) AS member_name,

            m.contact,

            GREATEST(
                l.totalDue -
                COALESCE(
                    (
                        SELECT SUM(p.amount_paid)
                        FROM payments p
                        WHERE p.loan_id = l.id
                    ),
                    0
                ),
                0
            ) AS remaining_balance,

            DATEDIFF(
                CURDATE(),
                l.due_date
            ) AS days_overdue

        FROM loans l

        INNER JOIN member m
            ON m.id = l.member_id

        WHERE
            l.loaner_id = ?

            AND (
                l.status = 'overdue'

                OR (
                    l.status = 'active'
                    AND l.due_date < CURDATE()
                )
            )

        ORDER BY
            l.due_date ASC
    `, [loanerId]);

    return rows;
};


// =========================================================
// UPDATE OVERDUE LOANS
// =========================================================

const updateOverdueLoans = async (loanerId) => {

    const [rows] = await db.query(`
        UPDATE loans
        SET status = 'overdue'
        WHERE
            loaner_id = ?
            AND status = 'active'
            AND due_date IS NOT NULL
            AND due_date < CURDATE()
    `, [loanerId]);

    return rows;
};


// =========================================================
// BLACKLISTED MEMBERS
// =========================================================

const getBlacklistedMembers = async (loanerId) => {

    const [rows] = await db.query(`
        SELECT

            b.*,

            m.firstname,
            m.lastname,
            m.contact,
            m.status

        FROM blacklist b

        INNER JOIN member m
            ON m.id = b.member_id

        WHERE m.loaner_id = ?

        ORDER BY b.id DESC
    `, [loanerId]);

    return rows;
};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    // Existing
    findByUsername,
    createLoaner,
    changePassword,

    // Profile
    findById,
    updateProfile,

    // Members
    getMembers,
    countMembers,
    getMember,
    getMemberLoans,

    // Loans
    getLoans,
    getLoan,
    getLoanTypes,
    getLoanPayments,
    getLoanPerStatus,

    // Dashboard
    getDashboardStats,

    // Capital
    getCapitalBalance,
    getCapitalHistory,

    // Collections
    getOverdueLoans,
    updateOverdueLoans,

    // Blacklist
    getBlacklistedMembers
};
