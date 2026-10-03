const authService = require("../services/service");


const loginLoaner = async (req, res) => {
   console.log("controller reach")
    try {
        const result = await authService.loginLoaner(req.body);

        res.json(result);

    } catch(error) {

        res.status(401).json({
            message: error.message
        });

    }

};

const signupLoaner = async (req, res) => {
    console.log("sign up controller")
    try{
        const result = await authService.signupLoaner(req.body)

        res.json(result);
    }
    catch(error){
        res.status(401).json({
            message: error.message || 'error in controller sign up'
        })
    }
}

const changePassword = async (req, res) => {

    console.log("controller reach change pass", req.user)
    try{
        const result = await authService.changePass(req.body);

        res.json(result)
    }
    catch(error){
        res.status(401).json({
            message: error.message
        })
    }
}


const getLoans = async(req, res) => {
    console.log('getting loans')
    try{
        const result = await authService.getLoans(req.user);

        res.json(result)
    }
    catch(err){
        res.status(401).json({
            message: err.message
        })
    }
}

module.exports = {
    loginLoaner,
    signupLoaner,
    changePassword,
    getLoans
}