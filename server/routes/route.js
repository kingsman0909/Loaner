
const express = require("express");

const router = express.Router();

const {changePassword, loginLoaner, signupLoaner,
       getLoans
} = require("../controllers/controller");
const verifyToken = require("../middleware/authMiddleware");

const test = () =>{
    console.log("hatdog")
}
router.post("/login", loginLoaner);
router.post("/signup", signupLoaner);
router.post("/changePassword", verifyToken, changePassword);


//LOANS
router.get('/loans/applications', verifyToken, getLoans);
module.exports = router;

