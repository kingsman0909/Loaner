const authService = require("../services/service");


// ============================================================
// AUTH
// ============================================================

const loginLoaner = async (req, res) => {

    console.log("LOGIN CONTROLLER");

    try {

        const result =
            await authService.loginLoaner(
                req.body
            );

        return res.status(200).json(result);

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        return res.status(401).json({
            message: error.message
        });
    }
};

const loginMember = async(req, res) => {
    try{
        const result = await authService.loginMember(req.body);

        return res.status(200).json(
            result
        )
    }
    catch(err){
        return res.status(401).json({
            message: err.message
        })
    }
}


const signupLoaner = async (req, res) => {

    console.log("SIGNUP CONTROLLER");

    try {

        const result =
            await authService.signupLoaner(
                req.body
            );

        return res.status(201).json({
            message: "Loaner created successfully",
            result
        });

    } catch (error) {

        console.error(
            "SIGNUP ERROR:",
            error
        );

        return res.status(400).json({
            message:
                error.message ||
                "Error creating loaner"
        });
    }
};


const changePassword = async (req, res) => {

    console.log(
        "CHANGE PASSWORD CONTROLLER",
        req.user
    );

    try {

        const result =
            await authService.changePass(
                req.body
            );

        return res.status(200).json({
            message:
                "Password changed successfully",
            result
        });

    } catch (error) {

        console.error(
            "CHANGE PASSWORD ERROR:",
            error
        );

        return res.status(400).json({
            message: error.message
        });
    }
};


// ============================================================
// LOANS
// ============================================================


// GET ALL LOANS
//
// GET /loans
//
// Query:
// search
// status
// limit
// offset
//
const getLoans = async (req, res) => {

    console.log("GET LOANS");

    try {

        const {
            search = "",
            status = "",
            limit = 20,
            offset = 0
        } = req.query;


        const result =
            await authService.getLoans({
                ...req.user,

                search,
                status,
                limit,
                offset
            });


        return res.status(200).json(
            result
        );

    } catch (error) {

        console.error(
            "GET LOANS CONTROLLER ERROR:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Error getting loans"
        });
    }
};


// GET LOANS BY STATUS
//
// GET /loans/status/active
//
const getLoanPerStatus = async (req, res) => {

    console.log(
        "GET LOANS BY STATUS"
    );

    try {

        const {
            status
        } = req.params;


        const page =
            Math.max(
                parseInt(req.query.page) || 1,
                1
            );


        const limit =
            Math.min(
                Math.max(
                    parseInt(req.query.limit) || 20,
                    1
                ),
                100
            );


        const result =
            await authService.getLoanPerStatus(
                req.user.id,
                status,
                page,
                limit
            );


        return res.status(200).json(
            result
        );

    } catch (error) {

        console.error(
            "GET LOANS STATUS ERROR:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Error getting loans"
        });
    }
};


// GET SINGLE LOAN
//
// GET /loans/:id
//
const getLoan = async (req, res) => {

    console.log(
        "GET SINGLE LOAN"
    );

    try {

        const {
            id
        } = req.params;


        const result =
            await authService.getLoan(
                req.user.id,
                id
            );


        return res.status(200).json({
            loan: result
        });

    } catch (error) {

        console.error(
            "GET LOAN ERROR:",
            error
        );

        const status =
            error.message ===
            "Loan not found"
                ? 404
                : 500;


        return res.status(status).json({
            message: error.message
        });
    }
};


// CREATE LOAN
//
// POST /loans
//
const createLoan = async (req, res) => {

    console.log(
        "CREATE LOAN",
        req.body
    );

    try {

        const result =
            await authService.createLoan(
                req.user.id,
                req.body
            );


        return res.status(201).json({

            message:
                "Loan created successfully",

            loan:
                result

        });

    } catch (error) {

        console.error(
            "CREATE LOAN ERROR:",
            error
        );

        return res.status(400).json({
            message:
                error.message ||
                "Error creating loan"
        });
    }
};


// UPDATE LOAN
//
// PUT /loans/:id
//
const updateLoan = async (req, res) => {

    console.log(
        "UPDATE LOAN",
        req.params.id,
        req.body
    );

    try {

        const result =
            await authService.updateLoan(
                req.user.id,
                req.params.id,
                req.body
            );


        return res.status(200).json({

            message:
                "Loan updated successfully",

            loan:
                result

        });

    } catch (error) {

        console.error(
            "UPDATE LOAN ERROR:",
            error
        );

        const status =
            error.message ===
            "Loan not found"
                ? 404
                : 400;


        return res.status(status).json({
            message: error.message
        });
    }
};


// DELETE LOAN
//
// DELETE /loans/:id
//
const deleteLoan = async (req, res) => {

    console.log(
        "DELETE LOAN",
        req.params.id
    );

    try {

        const result =
            await authService.deleteLoan(
                req.user.id,
                req.params.id
            );


        return res.status(200).json({

            message:
                "Loan deleted successfully",

            result

        });

    } catch (error) {

        console.error(
            "DELETE LOAN ERROR:",
            error
        );

        const status =
            error.message ===
            "Loan not found"
                ? 404
                : 400;


        return res.status(status).json({
            message: error.message
        });
    }
};


// ============================================================
// MEMBERS
// ============================================================


// GET ALL MEMBERS
//
// GET /members
//
const getMembers = async (req, res) => {

    try {

        console.log(
            "GET MEMBERS"
        );


        const {
            search = "",
            status = "",
            page = 1,
            limit = 20
        } = req.query;


        const result =
            await authService.getMembers({

                loaner_id:
                    req.user.id,

                search,

                status,

                page,

                limit

            });


        return res.status(200).json(
            result
        );

    } catch (error) {

        console.error(
            "GET MEMBERS CONTROLLER ERROR:",
            error
        );

        return res.status(500).json({
            message:
                error.message ||
                "Error getting members"
        });
    }
};


// GET SINGLE MEMBER
//
// GET /members/:id
//
const getMember = async (req, res) => {

    try {

        const result =
            await authService.getMember(
                req.user.id,
                req.params.id
            );


        return res.status(200).json({
            member: result
        });

    } catch (error) {

        console.error(
            "GET MEMBER ERROR:",
            error
        );

        const status =
            error.message ===
            "Member not found"
                ? 404
                : 500;


        return res.status(status).json({
            message:
                error.message
        });
    }
};


// CREATE MEMBER
//
// POST /members
//
const createMember = async (req, res) => {

    try {

        console.log(
            "CREATE MEMBER",
            req.body
        );


        const result =
            await authService.createMember(
                req.user.id,
                req.body
            );


        return res.status(201).json({

            message:
                "Member created successfully",

            member:
                result

        });

    } catch (error) {

        console.error(
            "CREATE MEMBER ERROR:",
            error
        );

        return res.status(400).json({
            message:
                error.message
        });
    }
};


// UPDATE MEMBER
//
// PUT /members/:id
//
const updateMember = async (req, res) => {

    try {

        const result =
            await authService.updateMember(
                req.user.id,
                req.params.id,
                req.body
            );


        return res.status(200).json({

            message:
                "Member updated successfully",

            member:
                result

        });

    } catch (error) {

        console.error(
            "UPDATE MEMBER ERROR:",
            error
        );

        const status =
            error.message ===
            "Member not found"
                ? 404
                : 400;


        return res.status(status).json({
            message:
                error.message
        });
    }
};


// APPROVE MEMBER
//
// PATCH /members/:id/approve
//
const approveMember = async (req, res) => {

    try {

        const result =
            await authService.approveMember(
                req.user.id,
                req.params.id
            );


        return res.status(200).json({

            message:
                "Member approved successfully",

            member:
                result

        });

    } catch (error) {

        console.error(
            "APPROVE MEMBER ERROR:",
            error
        );

        const status =
            error.message ===
            "Member not found"
                ? 404
                : 400;


        return res.status(status).json({
            message:
                error.message
        });
    }
};


// DELETE MEMBER
//
// DELETE /members/:id
//
const deleteMember = async (req, res) => {

    try {

        const result =
            await authService.deleteMember(
                req.user.id,
                req.params.id
            );


        return res.status(200).json({

            message:
                "Member deleted successfully",

            result

        });

    } catch (error) {

        console.error(
            "DELETE MEMBER ERROR:",
            error
        );

        const status =
            error.message ===
            "Member not found"
                ? 404
                : 400;


        return res.status(status).json({
            message:
                error.message
        });
    }
};


// MEMBER LOAN HISTORY
//
// GET /members/:id/history
//
const getMemberHistory = async (req, res) => {

    try {

        const result =
            await authService.getMemberHistory(
                req.user.id,
                req.params.id
            );


        return res.status(200).json({
            history: result
        });

    } catch (error) {

        console.error(
            "MEMBER HISTORY ERROR:",
            error
        );

        const status =
            error.message ===
            "Member not found"
                ? 404
                : 500;


        return res.status(status).json({
            message:
                error.message
        });
    }
};


// MEMBER BALANCE
//
// GET /members/:id/balance
//
const getMemberBalance = async (req, res) => {

    try {

        const result =
            await authService.getMemberBalance(
                req.user.id,
                req.params.id
            );


        return res.status(200).json({
            balance: result
        });

    } catch (error) {

        console.error(
            "MEMBER BALANCE ERROR:",
            error
        );

        const status =
            error.message ===
            "Member not found"
                ? 404
                : 500;


        return res.status(status).json({
            message:
                error.message
        });
    }
};


// MEMBER STATISTICS
//
// GET /members/:id/statistics
//
const getMemberStatistics = async (req, res) => {

    try {

        const result =
            await authService.getMemberStatistics(
                req.user.id,
                req.params.id
            );


        return res.status(200).json({
            statistics: result
        });

    } catch (error) {

        console.error(
            "MEMBER STATISTICS ERROR:",
            error
        );

        const status =
            error.message ===
            "Member not found"
                ? 404
                : 500;


        return res.status(status).json({
            message:
                error.message
        });
    }
};


const getLoanTypes = async (req, res) => {
    try{
        const result = await authService.getLoanTypes();

        res.status(200).json(result)
    }
    catch(err){
        res.status(401).json({
            message: `${err.message} error in controller`
        })
    }
}


//TRANSACTION - COLLECTION
const getCollections = async (req, res) => {
    try {
        const { filter = 'all', loaner_id } = req.query;

        const allowedFilters = [
            'all',
            'full',
            'partial'
        ];

        if (!allowedFilters.includes(filter)) {
            return res.status(400).json({
                message: 'Invalid collection filter'
            });
        }

        const collections =
            await authService.getCollections(filter, loaner_id);

        return res.status(200).json(collections);

    } catch (error) {
        console.error(
            'GET COLLECTIONS ERROR:',
            error
        );

        return res.status(500).json({
            message: 'Failed to fetch collections',
            error: error.message
        });
    }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {

    // AUTH
    loginLoaner,
    signupLoaner,
    changePassword,

    // LOANS
    getLoans,
    getLoanPerStatus,
    getLoan,
    getLoanTypes,
    createLoan,
    updateLoan,
    deleteLoan,

    // MEMBERS
    loginMember,
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