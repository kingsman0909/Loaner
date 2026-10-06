const db = require("../config/db");

class Member {

    // =========================================================
    // CREATE
    // =========================================================

    static async create(data) {


        const {
            loaner_id,
            firstname,
            lastname,
            age,
            source_of_income,
            province,
            city,
            brgy,
            subd,
            contact,
            status = "pending"
        } = data;

        const sql = `
            INSERT INTO member (
                loaner_id,
                firstname,
                lastname,
                age,
                source_of_income,
                province,
                city,
                brgy,
                subd,
                contact,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(sql, [
            loaner_id,
            firstname,
            lastname,
            age,
            source_of_income,
            province,
            city,
            brgy,
            subd,
            contact,
            status
        ]);

        return {
            id: result.insertId,
            ...data
        };
    }


    // =========================================================
    // FIND BY ID
    // =========================================================

    static async findById(id) {

        const [rows] = await db.execute(`
            SELECT
                m.*,
                CONCAT(m.firstname, ' ', m.lastname) AS full_name,
                l.username AS loaner_username,
                l.firstname AS loaner_firstname,
                l.lastname AS loaner_lastname
            FROM member m
            LEFT JOIN loaner l
                ON l.id = m.loaner_id
            WHERE m.id = ?
            LIMIT 1
        `, [id]);

        return rows[0] || null;
    }


    // =========================================================
    // GET ALL MEMBERS
    // =========================================================

    static async getAll(options = {}) {
    try {
        const {
            search = '',
            status = '',
            loaner_id = null
        } = options;

        // IMPORTANT:
        // req.query values are strings, so convert them to numbers
        const page = Math.max(1, parseInt(options.page, 10) || 1);
        const limit = Math.max(1, parseInt(options.limit, 10) || 10);
        const offset = (page - 1) * limit;

        let conditions = [];
        let params = [];

        // SEARCH
        if (search && search.trim() !== '') {
            conditions.push(`
                (
                    m.firstname LIKE ?
                    OR m.lastname LIKE ?
                    OR CONCAT(m.firstname, ' ', m.lastname) LIKE ?
                    OR m.contact LIKE ?
                )
            `);

            const searchValue = `%${search.trim()}%`;

            params.push(
                searchValue,
                searchValue,
                searchValue,
                searchValue
            );
        }

        // STATUS
        if (status && status !== 'all') {
            conditions.push(`m.status = ?`);
            params.push(status);
        }

        // LOANER
        if (loaner_id) {
            conditions.push(`m.loaner_id = ?`);
            params.push(Number(loaner_id));
        }

        const whereClause =
            conditions.length > 0
                ? `WHERE ${conditions.join(' AND ')}`
                : '';

        

        const sql = `
            SELECT
                m.*,

                CONCAT(
                    m.firstname,
                    ' ',
                    m.lastname
                ) AS full_name,

                l.username AS loaner_username,

                COUNT(DISTINCT lo.id) AS total_loans,

                COUNT(
                    DISTINCT CASE
                        WHEN lo.status = 'active'
                        THEN lo.id
                    END
                ) AS active_loans,

                COUNT(
                    DISTINCT CASE
                        WHEN lo.status = 'overdue'
                        THEN lo.id
                    END
                ) AS overdue_loans

            FROM member m

            LEFT JOIN loaner l
                ON l.id = m.loaner_id

            LEFT JOIN loans lo
                ON lo.member_id = m.id

            ${whereClause}

            GROUP BY m.id

            ORDER BY m.id DESC

            LIMIT ${limit} OFFSET ${offset}
        `;

        const [rows] = await db.execute(sql, params);

        return rows;
    } catch (error) {
        console.error("GET MEMBERS ERROR:", error);
        throw error;
    }
}

    // =========================================================
    // COUNT MEMBERS
    // =========================================================

    static async count(options = {}) {

        const {
            search = "",
            status = "",
            loaner_id = null
        } = options;

        let where = [];
        let params = [];

        if (search) {

            where.push(`
                (
                    firstname LIKE ?
                    OR lastname LIKE ?
                    OR contact LIKE ?
                    OR CONCAT(firstname, ' ', lastname) LIKE ?
                )
            `);

            const keyword = `%${search}%`;

            params.push(
                keyword,
                keyword,
                keyword,
                keyword
            );
        }

        if (status) {
            where.push(`status = ?`);
            params.push(status);
        }

        if (loaner_id) {
            where.push(`loaner_id = ?`);
            params.push(loaner_id);
        }

        const whereSQL = where.length
            ? `WHERE ${where.join(" AND ")}`
            : "";

        const [rows] = await db.execute(`
            SELECT COUNT(*) AS total
            FROM member
            ${whereSQL}
        `, params);

        return rows[0].total;
    }


    // =========================================================
    // UPDATE
    // =========================================================

    static async update(id, data) {

        const allowedFields = [
            "loaner_id",
            "firstname",
            "lastname",
            "age",
            "source_of_income",
            "province",
            "city",
            "brgy",
            "subd",
            "contact",
            "status"
        ];

        const fields = [];
        const values = [];

        for (const field of allowedFields) {

            if (data[field] !== undefined) {

                fields.push(`${field} = ?`);
                values.push(data[field]);

            }
        }

        if (!fields.length) {
            throw new Error("No fields to update");
        }

        values.push(id);

        const [result] = await db.execute(`
            UPDATE member
            SET ${fields.join(", ")}
            WHERE id = ?
        `, values);

        return result.affectedRows > 0;
    }


    // =========================================================
    // APPROVE MEMBER
    // =========================================================

    static async approve(id) {

        const [result] = await db.execute(`
            UPDATE member
            SET status = 'approved'
            WHERE id = ?
        `, [id]);

        return result.affectedRows > 0;
    }


    // =========================================================
    // DELETE
    // =========================================================

    static async delete(id) {

        const [result] = await db.execute(`
            DELETE FROM member
            WHERE id = ?
        `, [id]);

        return result.affectedRows > 0;
    }


    // =========================================================
    // MEMBER LOAN HISTORY
    // =========================================================

    static async getLoanHistory(memberId) {

        const [rows] = await db.execute(`
            SELECT
                lo.*,

                lt.type AS loan_type,
                lt.interest AS default_interest,

                COALESCE(
                    (
                        SELECT SUM(p.amount_paid)
                        FROM payments p
                        WHERE p.loan_id = lo.id
                    ),
                    0
                ) AS total_paid,

                GREATEST(
                    lo.totalDue -
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

        return rows;
    }


    // =========================================================
    // MEMBER BALANCE
    // =========================================================

    static async getBalance(memberId) {

        const [rows] = await db.execute(`
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

        return rows[0];
    }


    // =========================================================
    // MEMBER STATISTICS
    // =========================================================

    static async getStatistics(memberId) {

        const [rows] = await db.execute(`
            SELECT

                COUNT(*) AS total_loans,

                SUM(
                    CASE
                        WHEN status = 'active'
                        THEN 1 ELSE 0
                    END
                ) AS active_loans,

                SUM(
                    CASE
                        WHEN status = 'overdue'
                        THEN 1 ELSE 0
                    END
                ) AS overdue_loans,

                SUM(
                    CASE
                        WHEN status = 'paid'
                        THEN 1 ELSE 0
                    END
                ) AS paid_loans,

                SUM(
                    CASE
                        WHEN status = 'closed'
                        THEN 1 ELSE 0
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

        return rows[0];
    }


    // =========================================================
    // CHECK BLACKLIST
    // =========================================================

    static async isBlacklisted(memberId) {

        const [rows] = await db.execute(`
            SELECT
                b.*,
                m.firstname,
                m.lastname
            FROM blacklist b
            INNER JOIN member m
                ON m.id = b.member_id
            WHERE b.member_id = ?
            LIMIT 1
        `, [memberId]);

        return rows[0] || null;
    }
}

module.exports = Member;