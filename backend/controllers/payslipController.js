const Payslip = require('../models/Payslip');

exports.createPayslip = async (req, res) => {
  try {
    const { earnings = [], deductions = [] } = req.body;

    const grossEarnings = Array.isArray(earnings)
      ? earnings.reduce((acc, e) => acc + Number(e.amount || 0), 0)
      : 0;
    const totalDeductions = Array.isArray(deductions)
      ? deductions.reduce((acc, d) => acc + Number(d.amount || 0), 0)
      : 0;
    const totalNetPayable = grossEarnings - totalDeductions;

    const payslip = new Payslip({
      ...req.body,
      totalNetPayable,
      earnings,
      deductions
    });

    const saved = await payslip.save();
    res.status(201).json(saved);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
