const Payment = require('../models/Payment');

const makePayment = async (paymentData) => {
    try {
        const result = await Payment.createPayment(paymentData);  

        return result;
    }
    catch (error) {
        console.error('Error making payment:', error);
        throw new Error(error.message || error || 'error making payment in service');
    }
}


module.exports = {
    makePayment
};