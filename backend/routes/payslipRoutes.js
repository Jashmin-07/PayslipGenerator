const express = require('express');
const router = express.Router();
const { createPayslip } = require('../controllers/payslipController');
router.post('/', createPayslip);
module.exports = router;


