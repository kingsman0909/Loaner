const db = require("../config/db");
const Loaner = require("../model/Loaner");
const Member = require("../model/Member");
const jwt = require("jsonwebtoken");
const Collection = require('../model/Collection');


const getCollections = async(filter, loaner_id) => {
    const result = await Collection.getCollections(filter, loaner_id);

    return result;
}
// ============================================================
// HELPER
// ============================================================

const getLoanerId = (user) => {

    if (!user) {
        throw new Error(
            "Authentication required"
        );
    }

    const id =
        user.id ||
        user.loaner_id ||
        user.result?.id ||
        user.result?.loaner_id;

    if (!id) {
        throw new Error(
            "Loaner ID not found in token"
        );
    }

    return Number(id);
};


const cleanNumber = (
    value,
    fallback = 0
) => {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
};


const cleanInteger = (
    value,
    fallback = 0
) => {

    const number =
        parseInt(value, 10);

    return Number.isFinite(number)
        ? number
        : fallback;
};


// ============================================================
// AUTH
// ============================================================

const loginLoaner = async ({
    username,
    password
}) => {

    console.log(
        "LOGIN SERVICE:",
        username
    );


    const result =
        await Loaner.findByUsername(
            username
        );


    if (!result) {
        throw new Error(
            "User not found"
        );
    }


    if (
        password !==
        result.password
    ) {

        throw new Error(
            "Wrong password"
        );
    }


    const {
        password: pass,
        ...userData
    } = result;


    const token =
        jwt.sign(
            {
                id: result.id,

                username:
                    result.username,

                role:
                    result.role,

                result: userData
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1d"
            }
        );


    return {

        token,

        userData

    };
};


const signupLoaner = async (
    loaner
) => {

    if(loaner.password.length < 8){
        throw new Error('Password must be 8 or more characters');
    }

    const existing =
        await Loaner.findByUsername(
            loaner.username
        );


    if (existing) {

        throw new Error(
            "User already exists"
        );
    }


    return await Loaner.createLoaner(
        loaner
    );
};


const changePass = async ({
    username,
    newPassword,
    current
}) => {

    if(newPassword.length < 8){
        throw new Error('Password must be 8 or more characters');
    }
    const user =
        await Loaner.findByUsername(
            username
        );


    if (!user) {

        throw new Error(
            "User not found"
        );
    }


    if (
        current !==
        user.password
    ) {

        throw new Error(
            "Current password is incorrect"
        );
    }


    return await Loaner.changePassword(
        username,
        newPassword
    );
};


// ============================================================
// LOANS
// ============================================================


// GET ALL LOANS
//
// Supports:
//
// search
// status
// limit
// offset
//
const getLoans = async ({
    id,
    search = "",
    status = "",
    limit = 20,
    offset = 0
}) => {

    try {

        const loanerId =
            Number(id);


        if (!loanerId) {

            throw new Error(
                "Loaner ID is required"
            );
        }


        const safeLimit =
            Math.min(
                Math.max(
                    cleanInteger(
                        limit,
                        20
                    ),
                    1
                ),
                100
            );


        const safeOffset =
            Math.max(
                cleanInteger(
                    offset,
                    0
                ),
                0
            );


        const result =
            await Loaner.getLoans(
                loanerId,
                {

                    search:
                        String(search || ""),

                    status:
                        String(status || ""),

                    limit:
                        safeLimit,

                    offset:
                        safeOffset

                }
            );


        return result;

    } catch (error) {

        console.error(
            "GET LOANS SERVICE ERROR:",
            error
        );

        throw error;
    }
};


// GET LOANS BY STATUS
//
// Used for Active / Overdue / Paid / Closed.
//
const getLoanPerStatus = async (
    loanerId,
    status,
    page = 1,
    limit = 20
) => {

    const safePage =
        Math.max(
            cleanInteger(
                page,
                1
            ),
            1
        );


    const safeLimit =
        Math.min(
            Math.max(
                cleanInteger(
                    limit,
                    20
                ),
                1
            ),
            100
        );


    const offset =
        (
            safePage - 1
        ) *
        safeLimit;


    return await Loaner.getLoans(
        Number(loanerId),
        {

            status:
                String(status || ""),

            limit:
                safeLimit,

            offset

        }
    );
};


// ============================================================
// GET SINGLE LOAN
// ============================================================

const getLoan = async (
    loanerId,
    loanId
) => {

    const id =
        cleanInteger(
            loanId
        );


    if (!id) {

        throw new Error(
            "Loan ID is required"
        );
    }


    const result =
        await Loaner.getLoan(
            Number(loanerId),
            id
        );


    if (!result) {

        throw new Error(
            "Loan not found"
        );
    }


    return result;
};


// ============================================================
// CREATE LOAN
// ============================================================

const createLoan = async (
    loanerId,
    data
) => {

    const memberId =
        cleanInteger(
            data.member_id
        );


    const loanTypeId =
        cleanInteger(
            data.loan_type_id
        );


    const principalAmount =
        cleanNumber(
            data.principalAmount
        );


    if (!memberId) {

        throw new Error(
            "Member is required"
        );
    }


    if (!loanTypeId) {

        throw new Error(
            "Loan type is required"
        );
    }


    if (
        principalAmount <= 0
    ) {

        throw new Error(
            "Principal amount must be greater than 0"
        );
    }


    // ========================================================
    // CHECK MEMBER
    // ========================================================
    const [memberRows] =
        await db.query(
            `
            SELECT id, loaner_id
            FROM member
            WHERE id = ?
            LIMIT 1
            `,
            [
                memberId
            ]
        );


    if (
        memberRows.length === 0 || memberRows[0].loaner_id !== loanerId
    ) {

        throw new Error(
            "Member not found"
        );
    }

    console.log('Member: ', memberRows[0].loaner_id);

    // ========================================================
    // GET LOAN TYPE
    // ========================================================

    const [
        loanTypeRows
    ] =
        await db.query(
            `
            SELECT
                id,
                type,
                interest
            FROM loan_type
            WHERE id = ?
            LIMIT 1
            `,
            [
                loanTypeId
            ]
        );


    if (
        loanTypeRows.length === 0
    ) {

        throw new Error(
            "Loan type not found"
        );
    }


    const loanType =
        loanTypeRows[0];


    // ========================================================
    // INTEREST
    // ========================================================

    const interest =
        data.interest !== undefined &&
        data.interest !== null &&
        data.interest !== ""
            ? cleanNumber(
                data.interest
            )
            : cleanNumber(
                loanType.interest
            );


    // ========================================================
    // TOTAL DUE
    // ========================================================

    const totalDue =
        data.totalDue !== undefined &&
        data.totalDue !== null &&
        data.totalDue !== ""
            ? cleanNumber(
                data.totalDue
            )
            : principalAmount +
              (
                  principalAmount *
                  interest /
                  100
              );

    // ========================================================
    // STATUS
    // ========================================================

    const [member] = await db.query(`select status from member where id = ?`, [memberId]);
    
    console.log('member: ', member[0].status);
    const status = member[0]?.status;


    // ========================================================
    // RELEASE DATE
    // ========================================================

    const releaseDate =
        data.releaseDate ||
        null;


    // ========================================================
    // DUE DATE
    // ========================================================

    const dueDate =
        data.due_date ||
        data.dueDate ||
        null;


    // ========================================================
    // INSERT
    // ========================================================
    const [active] = await db.query(`select activeLoan from member where id = ?`,[memberId]);

    const [maxLoan] = await db.query(`select maxLoan from member where id = ?`, [memberId]);
    if(active[0].activeLoan >= maxLoan[0].maxLoan){
        throw new Error(`max loan limit per member reach ${active[0].activeLoan}/${maxLoan[0].maxLoan} for member ID: ${memberId}`);
    }
    if(status.toLowerCase() === 'approved'){
        console.log("creating loans ", status)
        const [
        result
    ] =
        await db.query(
            `
            INSERT INTO loans (

                loaner_id,

                member_id,

                loan_type_id,

                principalAmount,

                interest,

                totalDue,

                releaseDate,

                due_date
            )
            VALUES (?, ?, ? ,?, ?, ?, ?, ?)
            `,
            [

                loanerId,

                memberId,

                loanTypeId,

                principalAmount,

                interest,

                totalDue,

                releaseDate,

                dueDate

            ]
        );


        if(active.length !== 0){
            console.log("updating activeLoan count");
            const [inc] = await db.query(`update member set activeLoan = ${active[0].activeLoan + 1} where id = ?`, [memberId]);
            
            if(!inc){
                throw new Error('cannot update activeLoan add check backend service');
            }
        }
        return await getLoan(
        loanerId,
        result.insertId
    );

    }

    else{
        throw new Error(`cannot create loan of member status of ${status}`);
    }

    


    
};


// ============================================================
// UPDATE LOAN
// ============================================================

const updateLoan = async (
    loanerId,
    loanId,
    data
) => {

    const id =
        cleanInteger(
            loanId
        );


    if (!id) {

        throw new Error(
            "Loan ID is required"
        );
    }


    // ========================================================
    // CHECK OWNERSHIP
    // ========================================================

    const existing =
        await Loaner.getLoan(
            Number(loanerId),
            id
        );


    if (!existing) {

        throw new Error(
            "Loan not found"
        );
    }


    // ========================================================
    // BUILD UPDATE
    // ========================================================

    const fields = [];
    const params = [];


    // MEMBER
    if (
        data.member_id !==
        undefined
    ) {

        const memberId =
            cleanInteger(
                data.member_id
            );


        if (!memberId) {

            throw new Error(
                "Invalid member"
            );
        }


        const [
            memberRows
        ] =
            await db.query(
                `
                SELECT id
                FROM member
                WHERE id = ?
                AND loaner_id = ?
                LIMIT 1
                `,
                [
                    memberId,
                    loanerId
                ]
            );


        if (
            memberRows.length === 0
        ) {

            throw new Error(
                "Member not found"
            );
        }


        fields.push(
            "member_id = ?"
        );

        params.push(
            memberId
        );
    }


    // LOAN TYPE
    if (
        data.loan_type_id !==
        undefined
    ) {

        const loanTypeId =
            cleanInteger(
                data.loan_type_id
            );


        if (!loanTypeId) {

            throw new Error(
                "Invalid loan type"
            );
        }


        const [
            loanTypeRows
        ] =
            await db.query(
                `
                SELECT id
                FROM loan_type
                WHERE id = ?
                LIMIT 1
                `,
                [
                    loanTypeId
                ]
            );


        if (
            loanTypeRows.length === 0
        ) {

            throw new Error(
                "Loan type not found"
            );
        }


        fields.push(
            "loan_type_id = ?"
        );

        params.push(
            loanTypeId
        );
    }


    // PRINCIPAL
    if (
        data.principalAmount !==
        undefined
    ) {

        const principal =
            cleanNumber(
                data.principalAmount
            );


        if (
            principal <= 0
        ) {

            throw new Error(
                "Principal must be greater than 0"
            );
        }


        fields.push(
            "principalAmount = ?"
        );

        params.push(
            principal
        );
    }


    // INTEREST
    if (
        data.interest !==
        undefined
    ) {

        fields.push(
            "interest = ?"
        );

        params.push(
            cleanNumber(
                data.interest
            )
        );
    }


    // TOTAL DUE
    if (
        data.totalDue !==
        undefined
    ) {

        fields.push(
            "totalDue = ?"
        );

        params.push(
            cleanNumber(
                data.totalDue
            )
        );
    }


    // RELEASE DATE
    if (
        data.releaseDate !==
        undefined
    ) {

        fields.push(
            "releaseDate = ?"
        );

        params.push(
            data.releaseDate ||
            null
        );
    }


    // DUE DATE
    if (
        data.due_date !==
        undefined
    ) {

        fields.push(
            "due_date = ?"
        );

        params.push(
            data.due_date ||
            null
        );
    }


    if (
        data.dueDate !==
        undefined &&
        data.due_date ===
        undefined
    ) {

        fields.push(
            "due_date = ?"
        );

        params.push(
            data.dueDate ||
            null
        );
    }


    // STATUS
    if (
        data.status !==
        undefined
    ) {

        const allowedStatuses = [
            "pending",
            "active",
            "overdue",
            "paid",
            "closed"
        ];


        if (
            !allowedStatuses.includes(
                data.status
            )
        ) {

            throw new Error(
                "Invalid loan status"
            );
        }


        fields.push(
            "status = ?"
        );

        params.push(
            data.status
        );
    }


    // ========================================================
    // NOTHING TO UPDATE
    // ========================================================

    if (
        fields.length === 0
    ) {

        return existing;
    }


    params.push(
        id,
        loanerId
    );


    const [update] = await db.query(
        `
        UPDATE loans
        SET
            ${fields.join(", ")}
        WHERE
            id = ?
            AND loaner_id = ?
        `,
        params
    );

    


    return await getLoan(
        loanerId,
        id
    );
};


// ============================================================
// DELETE LOAN
// ============================================================

const deleteLoan = async (
    loanerId,
    loanId
) => {

    const id =
        cleanInteger(
            loanId
        );


    if (!id) {

        throw new Error(
            "Loan ID is required"
        );
    }


    const existing =
        await Loaner.getLoan(
            Number(loanerId),
            id
        );


    if (!existing) {

        throw new Error(
            "Loan not found"
        );
    }


    // ========================================================
    // CHECK PAYMENTS
    // ========================================================

    const [
        paymentRows
    ] =
        await db.query(
            `
            SELECT COUNT(*) AS total
            FROM payments
            WHERE loan_id = ?
            `,
            [
                id
            ]
        );


    const paymentCount =
        Number(
            paymentRows[0]?.total ||
            0
        );


    if (
        paymentCount > 0
    ) {

        throw new Error(
            "Cannot delete a loan with existing payments"
        );
    }


    // ========================================================
    // DELETE
    // ========================================================

    const [
        result
    ] =
        await db.query(
            `
            DELETE FROM loans
            WHERE
                id = ?
                AND loaner_id = ?
            `,
            [
                id,
                loanerId
            ]
        );


    return result;
};


// ============================================================
// MEMBERS
// ============================================================


// GET ALL MEMBERS
const getMembers = async ({
    loaner_id,
    search = "",
    status = "",
    page = 1,
    limit = 20
}) => {

    try {

        const loanerId =
            cleanInteger(
                loaner_id
            );


        if (!loanerId) {

            throw new Error(
                "Loaner ID is required"
            );
        }


        const safePage =
            Math.max(
                cleanInteger(
                    page,
                    1
                ),
                1
            );


        const safeLimit =
            Math.min(
                Math.max(
                    cleanInteger(
                        limit,
                        20
                    ),
                    1
                ),
                100
            );


        const result =
            await Member.getAll({

                search:
                    String(search || ""),

                status:
                    String(status || ""),

                loaner_id:
                    loanerId,

                page:
                    safePage,

                limit:
                    safeLimit

            });


        const total =
            await Member.count({

                search:
                    String(search || ""),

                status:
                    String(status || ""),

                loaner_id:
                    loanerId

            });


        return {

            members:
                result,

            total:
                Number(total || 0),

            page:
                safePage,

            limit:
                safeLimit,

            totalPages:
                Math.ceil(
                    Number(total || 0) /
                    safeLimit
                )

        };

    } catch (error) {

        console.error(
            "GET MEMBERS SERVICE ERROR:",
            error
        );

        throw error;
    }
};


// ============================================================
// GET MEMBER
// ============================================================

const getMember = async (
    loanerId,
    memberId
) => {

    const id =
        cleanInteger(
            memberId
        );


    if (!id) {

        throw new Error(
            "Member ID is required"
        );
    }


    const result =
        await Member.findById(
            id
        );


    if (
        !result ||
        Number(result.loaner_id) !==
        Number(loanerId)
    ) {

        throw new Error(
            "Member not found"
        );
    }


    return result;
};


// ============================================================
// CREATE MEMBER
// ============================================================

const createMember = async (
    loanerId,
    data
) => {

    if (!data.firstname) {

        throw new Error(
            "Firstname is required"
        );
    }


    if (!data.lastname) {

        throw new Error(
            "Lastname is required"
        );
    }


    const result =
        await Member.create({

            loaner_id:
                Number(loanerId),

            firstname:
                data.firstname,

            lastname:
                data.lastname,

            age:
                data.age ||
                null,

            source_of_income:
                data.source_of_income ??
                data.sourceOfIncome ??
                null,

            province:
                data.province ||
                null,

            city:
                data.city ||
                null,

            brgy:
                data.brgy ||
                null,

            subd:
                data.subd ||
                null,

            contact:
                data.contact ||
                null,

            status:
                data.status ||
                "pending"

        });


    return result;
};


// ============================================================
// UPDATE MEMBER
// ============================================================

const updateMember = async (
    loanerId,
    memberId,
    data
) => {

    const id =
        cleanInteger(
            memberId
        );


    const existing =
        await getMember(
            loanerId,
            id
        );


    const result =
        await Member.update(
            id,
            {

                loaner_id:
                    Number(loanerId),

                firstname:
                    data.firstname ??
                    existing.firstname,

                lastname:
                    data.lastname ??
                    existing.lastname,

                age:
                    data.age ??
                    existing.age,

                source_of_income:
                    data.source_of_income ??
                    data.sourceOfIncome ??
                    existing.source_of_income,

                province:
                    data.province ??
                    existing.province,

                city:
                    data.city ??
                    existing.city,

                brgy:
                    data.brgy ??
                    existing.brgy,

                subd:
                    data.subd ??
                    existing.subd,

                contact:
                    data.contact ??
                    existing.contact,

                status:
                    data.status ??
                    existing.status

            }
        );


    return result;
};


// ============================================================
// APPROVE MEMBER
// ============================================================

const approveMember = async (
    loanerId,
    memberId
) => {

    const id =
        cleanInteger(
            memberId
        );


    await getMember(
        loanerId,
        id
    );


    return await Member.approve(
        id
    );
};


// ============================================================
// DELETE MEMBER
// ============================================================

const deleteMember = async (
    loanerId,
    memberId
) => {

    const id =
        cleanInteger(
            memberId
        );


    await getMember(
        loanerId,
        id
    );


    return await Member.delete(
        id
    );
};


// ============================================================
// MEMBER HISTORY
// ============================================================

const getMemberHistory = async (
    loanerId,
    memberId
) => {

    const id =
        cleanInteger(
            memberId
        );


    await getMember(
        loanerId,
        id
    );


    return await Member.getLoanHistory(
        id
    );
};


// ============================================================
// MEMBER BALANCE
// ============================================================

const getMemberBalance = async (
    loanerId,
    memberId
) => {

    const id =
        cleanInteger(
            memberId
        );


    await getMember(
        loanerId,
        id
    );


    return await Member.getBalance(
        id
    );
};


// ============================================================
// MEMBER STATISTICS
// ============================================================

const getMemberStatistics = async (
    loanerId,
    memberId
) => {

    const id =
        cleanInteger(
            memberId
        );


    await getMember(
        loanerId,
        id
    );


    return await Member.getStatistics(
        id
    );
};

const getLoanTypes = async() => {
    const result = await Loaner.getLoanTypes();

    return result;
}


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    // AUTH
    loginLoaner,
    signupLoaner,
    changePass,

    // LOANS
    getLoans,
    getLoanPerStatus,
    getLoan,
    createLoan,
    updateLoan,
    deleteLoan,
    getLoanTypes,

    // MEMBERS
    getMembers,
    getMember,
    createMember,
    updateMember,
    approveMember,
    deleteMember,
    getMemberHistory,
    getMemberBalance,
    getMemberStatistics,

    //COLLECTIONS
    getCollections

};