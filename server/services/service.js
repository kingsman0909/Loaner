const Loaner = require("../model/Loaner");
const jwt = require('jsonwebtoken');

const loginLoaner = async ({ username, password }) => {
    console.log("service reach kainis", username, password)
    const result = await Loaner.findByUsername(username);

    if(!result){
        throw new Error("User not found");
    }
    if (username !== result.username) {
        throw new Error("User not found");
    }

    if (password !== result.password) {
        console.log("password error");
        throw new Error("Wrong password");
    }

    console.log("creating token");

    const {
        password: pass,
        ...userData
    } = result;

    const token = jwt.sign(
        {
            result
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    console.log(token);
    return {
        token,
        userData
    };
};

const signupLoaner = async (loaner) => {
    const response = await Loaner.findByUsername(loaner.username);

    if(response){
        throw new Error("User already Exist");
    }
    
    console.log("creating token");

    const result = await Loaner.createLoaner(loaner);

    return result;
};

const changePass = async ({username, newPassword, current}) => {
    const checkUser = await Loaner.findByUsername(username);
    if(!checkUser){
        throw new Error('Theres no user with username ', username)
    }

    console.log(current, checkUser.password);
    if(current !== checkUser.password){
        throw new Error('password dont matched to real user');
    }
    const result = await Loaner.changePassword(username, newPassword);

    return result;
}

const getLoans = async({id}) => {
    try{
        const result = await Loaner.getLoans(id);

        return result;
    }
    catch(err){
        throw new Error('Error getting loans in service')
    }
}

module.exports = {
    loginLoaner,
    signupLoaner,
    changePass,
    getLoans
}