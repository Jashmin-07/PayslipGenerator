const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
});
const deductionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
});
const extraFieldSchema = new mongoose.Schema({
  label: { type: String, default: "" },
  value: { type: String, default: "" }
});

const payslipSchema = new mongoose.Schema({
  companyName: { type: String, default: "" },
  companyAddress: { type: String, default: "" },
  secondLine: { type: String, default: "" },
  cityPin: { type: String, default: "" },
  country: { type: String, default: "" },
  employeeName: { type: String, default: "" },
  employeeId: { type: String, default: "" },
  contact: { type: String, default: "" },
  joiningDate: { type: String, default: "" },
  payPeriod: { type: String, default: "" },
  paidDays: { type: Number, default: 0 },
  lossOfPayDays: { type: Number, default: 0 },
  payDate: { type: String, default: "" },
  earnings: [earningSchema],
  deductions: [deductionSchema],
  currency: { type: String, default: "" },
  currencySymbol: { type: String, default: "" },
  totalNetPayable: { type: Number, default: 0 },
  extraFields: [extraFieldSchema]
}, { timestamps: true });

module.exports = mongoose.model('Payslip', payslipSchema);
