const express = require("express");
const router = express.Router();

const {
    // AUTH
    changePassword,
    loginLoaner,
    signupLoaner,

    // LOANS
    getLoans,
    getLoan,
    createLoan,
    updateLoan,
    deleteLoan,
    getLoanPerStatus,
    getLoanTypes,

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
    getMyData,

    //COLLECTIONS
    getCollections
} = require("../controllers/controller");


const {makePayment} = require("../controllers/paymentController");

const verifyToken = require("../middleware/authMiddleware");

// ============================================================
// PAYMENTS
// ============================================================

router.post('/payments', verifyToken, makePayment);


// ============================================================
// AUTH
// ============================================================

router.post(
    "/login",
    loginLoaner
);

router.post('/member/login', loginMember);

router.post(
    "/signup",
    signupLoaner
);

router.post(
    "/changePassword",
    verifyToken,
    changePassword
);

//=========================================
//TRANSACTIONS - COLLECTIONS
//========================================
router.get('/transactions/collections', verifyToken, getCollections);

// ============================================================
// LOANS
// ============================================================

// Get all loans
//
// Examples:
//
// GET /loans
// GET /loans?status=active
// GET /loans?status=overdue
// GET /loans?search=john
// GET /loans?limit=20&offset=0
//
router.get(
    "/loans",
    verifyToken,
    getLoans
);

router.get("/loans/loantype", verifyToken, getLoanTypes);

// Get loans by status
//
// Example:
//
// GET /loans/status/active
// GET /loans/status/overdue
// GET /loans/status/paid
// GET /loans/status/closed
//
router.get(
    "/loans/status/:status",
    verifyToken,
    getLoanPerStatus
);


// Get single loan
//
// GET /loans/25
//
router.get(
    "/loans/:id",
    verifyToken,
    getLoan
);


// Create loan
//
// POST /loans
//
router.post(
    "/loans",
    verifyToken,
    createLoan
);


// Update loan
//
// PUT /loans/25
//
router.put(
    "/loans/:id",
    verifyToken,
    updateLoan
);


// Delete loan
//
// DELETE /loans/25
//
router.delete(
    "/loans/:id",
    verifyToken,
    deleteLoan
);


// Backwards compatibility
//
// Your existing Applicants.jsx currently uses:
// GET /loans/applications
//
// Keep this route so the current frontend doesn't immediately break.
//
router.get(
    "/loans/applications",
    verifyToken,
    getLoans
);


// ============================================================
// MEMBERS
// ============================================================

// Get all members
//
// GET /members
//
router.get('')
router.get(
    "/members",
    verifyToken,
    getMembers
);


// Get single member
//
// GET /members/25
//
router.get(
    "/members/:id",
    verifyToken,
    getMember
);


// Create member
//
// POST /members
//
router.post(
    "/members",
    verifyToken,
    createMember
);


// Update member
//
// PUT /members/25
//
router.put(
    "/members/:id",
    verifyToken,
    updateMember
);


// Approve member
//
// PATCH /members/25/approve
//
router.patch(
    "/members/:id/approve",
    verifyToken,
    approveMember
);


// Delete member
//
// DELETE /members/25
//
router.delete(
    "/members/:id",
    verifyToken,
    deleteMember
);


// ============================================================
// MEMBER DETAILS
// ============================================================

// Loan history
//
// GET /members/25/history
//

router.get(
    "/member/me",
    getMyData
);
router.get(
    "/members/:id/history",
    verifyToken,
    getMemberHistory
);


// Balance
//
// GET /members/25/balance
//
router.get(
    "/members/:id/balance",
    verifyToken,
    getMemberBalance
);


// Statistics
//
// GET /members/25/statistics
//
router.get(
    "/members/:id/statistics",
    verifyToken,
    getMemberStatistics
);


module.exports = router;