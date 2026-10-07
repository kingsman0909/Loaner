const PaymentService = require('../services/paymentService');

const makePayment = async (req, res) => {
    try {
        const paymentData = req.body;
        const result = await PaymentService.makePayment(paymentData);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    makePayment
};