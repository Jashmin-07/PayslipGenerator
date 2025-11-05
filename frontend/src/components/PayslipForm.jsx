import React, { useState } from "react";
import payslipImg from "../assets/images/payslip.png";
import addIcon from "../assets/images/add.png";
import deleteIcon from "../assets/images/delete-button.png";
import dropdownIcon from "../assets/images/dropdown.png";
import { FaSyncAlt } from "react-icons/fa";
import { currencyList } from "./currencyList";
import axios from "axios";
import "./PayslipForm.css";
import { generatePayslipPdf } from "../assets/utilities/generatePayslipPdf";

const COLORS = [
  "#2c84ff", "#1abc9c", "#f4b942", "#fb7f6f", "#a74de8",
  "#ff7850", "#7d7dfb", "#ff8b00", "#231f20", "#7cf890"
];

const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
};

const PayslipForm = () => {
  const [themeColor, setThemeColor] = useState("#ff7850");
  const [currencyModal, setCurrencyModal] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    companyName: "",
    companyAddress: "",
    secondLine: "",
    cityPin: "",
    country: "",
    employeeName: "",
    employeeId: "",
    contact: "",
    joiningDate: "",
    payPeriod: getCurrentMonth(),
    paidDays: "",
    lossOfPayDays: "",
    payDate: "",
    earnings: [
      { name: "Basic Pay Cost", amount: 0 },
      { name: "Rent Allowance", amount: 0 }
    ],
    deductions: [
      { name: "Income Tax", amount: 0 },
      { name: "PF Amount", amount: 0 }
    ],
    currency: "INR",
    currencySymbol: "₹"
  });
  const [extraFields, setExtraFields] = useState([]);

  const filteredCurrencies = currencyList.filter(
    c =>
      c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(currencySearch.toLowerCase())
  );
  const handleCurrencyChoose = (c) => {
    setForm(prev => ({
      ...prev,
      currency: c.code,
      currencySymbol: c.symbol
    }));
    setCurrencyModal(false);
    setCurrencySearch("");
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Extra fields logic
  const handleAddField = () => {
    setExtraFields(fields => [...fields, { label: "", value: "" }]);
  };
  const handleExtraFieldChange = (idx, e) => {
    const updated = [...extraFields];
    updated[idx][e.target.name] = e.target.value;
    setExtraFields(updated);
  };
  const handleDeleteField = (idx) => {
    setExtraFields(fields => fields.filter((_, i) => i !== idx));
  };

  // Earnings/Deductions
  const handleEarningsChange = (index, field, value) => {
    const earnings = [...form.earnings];
    earnings[index][field] = field === "amount" ? Number(value) : value;
    setForm((prev) => ({ ...prev, earnings }));
  };
  const handleAddEarning = () => {
    setForm((prev) => ({
      ...prev,
      earnings: [...prev.earnings, { name: "", amount: 0 }]
    }));
  };
  const handleDeleteEarning = (index) => {
    setForm((prev) => ({
      ...prev,
      earnings: prev.earnings.filter((_, i) => i !== index)
    }));
  };
  const handleDeductionsChange = (index, field, value) => {
    const deductions = [...form.deductions];
    deductions[index][field] = field === "amount" ? Number(value) : value;
    setForm((prev) => ({ ...prev, deductions }));
  };
  const handleAddDeduction = () => {
    setForm((prev) => ({
      ...prev,
      deductions: [...prev.deductions, { name: "", amount: 0 }]
    }));
  };
  const handleDeleteDeduction = (index) => {
    setForm((prev) => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index)
    }));
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!form.companyName) newErrors.companyName = "Enter Company Name";
    if (!form.companyAddress) newErrors.companyAddress = "Enter Company Address";
    if (!form.cityPin) newErrors.cityPin = "Enter Company Pin";
    if (!form.employeeName) newErrors.employeeName = "Enter Employee Name";
    if (!form.employeeId) newErrors.employeeId = "Enter Employee Id";
    if (!form.joiningDate) newErrors.joiningDate = "Select the Joining Date";
    if (!form.payPeriod) newErrors.payPeriod = "Select Pay Period";
    if (!form.paidDays) newErrors.paidDays = "Enter PaidDays";
    return newErrors;
  };

  const grossEarnings = form.earnings.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalDeductions = form.deductions.reduce((sum, d) => sum + Number(d.amount), 0);
  const totalNetPayable = grossEarnings - totalDeductions;

  function netPayInWords() {
    if (totalNetPayable === 0) return "Zero Only";
    if (totalNetPayable === 1) return "One Only";
    return "eight hundred sixty-six thousand, four hundred eighty Only";
  }

  const handleGeneratePayslip = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      window.scrollTo(0, 0);
      return;
    }
    try {
      const payload = { ...form, extraFields };
      await axios.post('http://localhost:5000/api/payslips', payload);
      generatePayslipPdf({
        form,
        extraFields,
        logoPreview,
        grossEarnings,
        totalDeductions,
        totalNetPayable,
        netPayInWords,
        onFinish: () => alert("Payslip saved to database and PDF generated!")
      });
    } catch (error) {
      alert('Failed to save and generate payslip: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleReset = () => {
    setForm({
      companyName: "", companyAddress: "", secondLine: "", cityPin: "", country: "",
      employeeName: "", employeeId: "", contact: "", joiningDate: "", payPeriod: getCurrentMonth(),
      paidDays: "", lossOfPayDays: "", payDate: "",
      earnings: [
        { name: "Basic Pay Cost", amount: 0 },
        { name: "Rent Allowance", amount: 0 }
      ],
      deductions: [
        { name: "Income Tax", amount: 0 },
        { name: "PF Amount", amount: 0 }
      ],
      currency: "INR",
      currencySymbol: "₹"
    });
    setLogo(null);
    setLogoPreview(null);
    setExtraFields([]);
    setErrors({});
  };

  const leftFields = extraFields.filter((_, idx) => idx % 2 === 0);
  const rightFields = extraFields.filter((_, idx) => idx % 2 === 1);

  return (
    <div className="main-payslip-shell">
      {/* Currency Modal */}
      {currencyModal && (
        <div className="currency-modal-overlay" onClick={() => setCurrencyModal(false)}>
          <div className="currency-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="currency-modal-title">Select Currency</div>
              <span style={{ fontSize: "2rem", cursor: "pointer" }} onClick={() => setCurrencyModal(false)}>&times;</span>
            </div>
            <input
              className="currency-modal-search"
              value={currencySearch}
              onChange={e => setCurrencySearch(e.target.value)}
              placeholder="Search currency or code"
              autoFocus
            />
            <div className="currency-list">
              {filteredCurrencies.map((c) => (
                <div key={c.code} className="currency-list-item" onClick={() => handleCurrencyChoose(c)}>
                  <span className="currency-name">{c.name}</span>
                  <span className="currency-symbol">{c.symbol}</span>
                  <span className="currency-code">{c.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* HEADER */}
      <section className="payslip-header" style={{ background: themeColor }}>
        <div className="payslip-header-content">
          <div className="payslip-text-block">
            <h1>Free Payslip Generator</h1>
            <p>Say goodbye to confusing and time-consuming payroll processes with our free payslip generator.
              Our user-friendly software allows you to create customized payslips in minutes.</p>
          </div>
          <img src={payslipImg} alt="Payslip illustration" className="payslip-image" />
        </div>
      </section>
      <section className="payslip-container payslip-card-bg">
        <div className="section-block flexcard-row">
          <div className="logo-block">
            <div className="upload-logo" onClick={() => document.getElementById("logo-upload-input").click()}>
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="logo-preview" />
              ) : (
                <span className="logo-placeholder" role="img" aria-label="camera">
                  ADD YOUR COMPANY LOGO HERE
                </span>
              )}
              <input
                id="logo-upload-input"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleLogoChange}
              />
            </div>
            <div className="logo-upload-label">
              <div className="logo-upload-title">Upload Logo</div>
              <div className="logo-upload-instructions theme-details">
                <div>240 x 240 pixels @ 72 DPI,</div>
                <div>Maximum size of 1MB.</div>
              </div>
            </div>
          </div>
          <div className="payslip-meta-right">
            <div className="payslip-date-block">
              <div className="payslip-date-label">Payslip For the Month</div>
              <div className="payslip-date-value" style={{ color: themeColor }}>
                {form.payPeriod
                  ? new Date(form.payPeriod + "-01").toLocaleString("default", { month: "long", year: "numeric" })
                  : "October-2025"}
              </div>
            </div>
            <div className="theme-picker-block">
              <span className="theme-picker-title">Change Theme Colour</span>
              <div className="theme-picker-palette">
                {COLORS.map((col) => (
                  <span
                    key={col}
                    className={`theme-circle ${themeColor === col ? "theme-selected" : ""}`}
                    style={{ background: col }}
                    onClick={() => setThemeColor(col)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Company & Meta */}
        <div className="border-bottom">
          <div className="section-block pale-card-bg form-card-section">
            <div className="form-grid">
              <div>
                <input
                  type="text"
                  placeholder="Company Name*"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleInputChange}
                  className={errors.companyName ? "input-error" : ""}
                />
                {errors.companyName && <div className="error-message">{errors.companyName}</div>}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Company Address*"
                  name="companyAddress"
                  value={form.companyAddress}
                  onChange={handleInputChange}
                  className={errors.companyAddress ? "input-error" : ""}
                />
                {errors.companyAddress && <div className="error-message">{errors.companyAddress}</div>}
              </div>
              <input type="text" placeholder="Second Line" name="secondLine" value={form.secondLine} onChange={handleInputChange} />
              <div>
                <input
                  type="text"
                  placeholder="City Pin code*"
                  name="cityPin"
                  value={form.cityPin}
                  onChange={handleInputChange}
                  className={errors.cityPin ? "input-error" : ""}
                />
                {errors.cityPin && <div className="error-message">{errors.cityPin}</div>}
              </div>
              <input type="text" placeholder="Country" name="country" value={form.country} onChange={handleInputChange} />
            </div>
          </div>
        </div>
        <div className="border-bottom">
          <section className="section-block gray-card-bg">
            <h3 className="section-header">
              Employee Pay Summary<span className="required-star">*</span>
            </h3>
            <div className="emp-summary-container">
              <div>
                <div>
                  <div className="emp-summary-row">
                    <label>Employee Name</label><span>:</span>
                    <input
                      type="text"
                      name="employeeName"
                      placeholder="Eg. Enter your name"
                      value={form.employeeName}
                      onChange={handleInputChange}
                      className={errors.employeeName ? "input-error" : ""}
                    />
                  </div>
                  {errors.employeeName && <div className="error-message">{errors.employeeName}</div>}
                </div>
                <div>
                  <div className="emp-summary-row">
                    <label>Joining Date</label><span>:</span>
                    <input
                      type="date"
                      name="joiningDate"
                      value={form.joiningDate}
                      onChange={handleInputChange}
                      className={errors.joiningDate ? "input-error" : ""}
                    />
                  </div>
                  {errors.joiningDate && <div className="error-message">{errors.joiningDate}</div>}
                </div>
                <div>
                  <div className="emp-summary-row">
                    <label>Pay Period</label><span>:</span>
                    <input
                      type="month"
                      name="payPeriod"
                      value={form.payPeriod}
                      onChange={handleInputChange}
                      className={errors.payPeriod ? "input-error" : ""}
                    />
                  </div>
                  {errors.payPeriod && <div className="error-message">{errors.payPeriod}</div>}
                </div>
                <div className="emp-summary-row">
                  <label>Loss of Pay Days</label><span>:</span>
                  <input
                    type="number"
                    name="lossOfPayDays"
                    placeholder="Eg. 02"
                    value={form.lossOfPayDays}
                    onChange={handleInputChange}
                  />
                </div>
                {leftFields.map((fld, idx) => (
                  <div className="emp-summary-row extra-field-row" key={`left-${idx}`}>
                    <input
                      type="text"
                      name="label"
                      className="extra-label"
                      placeholder="Enter Text"
                      value={fld.label}
                      onChange={e => handleExtraFieldChange(idx * 2, e)}
                    />
                    <span>:</span>
                    <input
                      type="text"
                      name="value"
                      className="extra-value"
                      placeholder="Enter Value"
                      value={fld.value}
                      onChange={e => handleExtraFieldChange(idx * 2, e)}
                    />
                    <button
                      type="button"
                      className="del-field-btn"
                      title="Delete field"
                      onClick={() => handleDeleteField(idx * 2)}
                    >
                      <img src={deleteIcon} alt="Delete" className="icon-inline" />
                    </button>
                  </div>
                ))}
                <button
                  className="add-field-btn"
                  type="button"
                  onClick={handleAddField}
                  style={{ backgroundColor: themeColor }}
                >
                  <img src={addIcon} alt="Add" className="icon-inline" />
                  Add another field
                </button>
              </div>
              <div>
                <div>
                  <div className="emp-summary-row">
                    <label>Employee ID</label><span>:</span>
                    <input
                      type="text"
                      name="employeeId"
                      placeholder="Eg. 12345"
                      value={form.employeeId}
                      onChange={handleInputChange}
                      className={errors.employeeId ? "input-error" : ""}
                    />
                  </div>
                  {errors.employeeId && <div className="error-message">{errors.employeeId}</div>}
                </div>
                <div className="emp-summary-row">
                  <label>Contact</label><span>:</span>
                  <input
                    type="text"
                    name="contact"
                    placeholder="Eg. 91234 56789"
                    value={form.contact}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <div className="emp-summary-row">
                    <label>Paid Days</label><span>:</span>
                    <input
                      type="number"
                      name="paidDays"
                      placeholder="Eg. 22"
                      value={form.paidDays}
                      onChange={handleInputChange}
                      className={errors.paidDays ? "input-error" : ""}
                    />
                  </div>
                  {errors.paidDays && <div className="error-message">{errors.paidDays}</div>}
                </div>
                <div className="emp-summary-row">
                  <label>Pay Date</label><span>:</span>
                  <input
                    type="date"
                    name="payDate"
                    value={form.payDate}
                    onChange={handleInputChange}
                  />
                </div>
                {rightFields.map((fld, idx) => (
                  <div className="emp-summary-row extra-field-row" key={`right-${idx}`}>
                    <input
                      type="text"
                      name="label"
                      className="extra-label"
                      placeholder="Enter Text"
                      value={fld.label}
                      onChange={e => handleExtraFieldChange(idx * 2 + 1, e)}
                    />
                    <span>:</span>
                    <input
                      type="text"
                      name="value"
                      className="extra-value"
                      placeholder="Enter Value"
                      value={fld.value}
                      onChange={e => handleExtraFieldChange(idx * 2 + 1, e)}
                    />
                    <button
                      type="button"
                      className="del-field-btn"
                      title="Delete field"
                      onClick={() => handleDeleteField(idx * 2 + 1)}
                    >
                      <img src={deleteIcon} alt="Delete" className="icon-inline" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
        <section className="section-block pale-card-bg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="section-header">Income Details<span className="required-star">*</span></h3>
            <span>
              Choose currency : <span style={{ fontWeight: 700 }}>{form.currency} ({form.currencySymbol})</span>
              <button
                type="button"
                className="choose-currency-icon-btn"
                onClick={() => setCurrencyModal(true)}
                style={{
                  background: "none",
                  border: "none",
                  verticalAlign: "middle",
                  padding: "0 7px",
                  cursor: "pointer"
                }}
                aria-label="Choose currency"
              >
                <img
                  src={dropdownIcon}
                  alt="Open currency picker"
                  style={{
                    width: "20px",
                    height: "28px",
                    display: "inline-block",
                    objectFit: "contain"
                  }}
                />
              </button>
            </span>
          </div>
          <div className="income-details-row">
            <div className="income-card income-card-left">
              <h4 className="income-col-title">Earnings</h4>
              {form.earnings.map((earning, i) => (
                <div key={i} className="income-row">
                  <input
                    type="text"
                    className="income-label-input"
                    value={earning.name}
                    onChange={e => handleEarningsChange(i, "name", e.target.value)}
                    placeholder="Enter Earnings Title"
                  />
                  <span className="income-colon">:</span>
                  <div className="income-input-with-currency">
                    <input
                      type="number"
                      className="income-input"
                      value={earning.amount || ""}
                      onChange={e => handleEarningsChange(i, "amount", e.target.value)}
                      placeholder={i === 0 ? "Eg. 1,00,000" : "Eg. 2450/-"}
                    />
                    <span className="currency-symbol-outside">{form.currencySymbol}</span>
                  </div>
                  {i >= 2 && (
                    <button
                      className="del-field-btn"
                      type="button"
                      onClick={() => handleDeleteEarning(i)}
                      title="Delete earning"
                    >
                      <img src={deleteIcon} alt="Delete" className="icon-inline" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="income-btn styled-add-btn"
                style={{ backgroundColor: themeColor }}
                onClick={handleAddEarning}
              >
                <img src={addIcon} alt="Add" className="icon-inline" />
                Add Earnings
              </button>
            </div>
            <div className="income-card income-card-right">
              <h4 className="income-col-title">Deductions</h4>
              {form.deductions.map((deduction, i) => (
                <div key={i} className="income-row">
                  <input
                    type="text"
                    className="income-label-input"
                    value={deduction.name}
                    onChange={e => handleDeductionsChange(i, "name", e.target.value)}
                    placeholder="Enter Deduction Title"
                  />
                  <span className="income-colon">:</span>
                  <div className="income-input-with-currency">
                    <input
                      type="number"
                      className="income-input"
                      value={deduction.amount || ""}
                      onChange={e => handleDeductionsChange(i, "amount", e.target.value)}
                      placeholder="Eg. 2450/-"
                    />
                    <span className="currency-symbol-outside">{form.currencySymbol}</span>
                  </div>
                  {i >= 2 && (
                    <button
                      className="del-field-btn"
                      type="button"
                      onClick={() => handleDeleteDeduction(i)}
                      title="Delete deduction"
                    >
                      <img src={deleteIcon} alt="Delete" className="icon-inline" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="income-btn styled-add-btn"
                style={{ backgroundColor: themeColor }}
                onClick={handleAddDeduction}
              >
                <img src={addIcon} alt="Add" className="icon-inline" />
                Add Deductions
              </button>
            </div>
          </div>
          <div className="income-total-summary">
            <div className="income-summary-label">Gross Earnings</div>
            <input className="income-summary-input no-focus"
              type="text"
              value={form.currencySymbol + grossEarnings.toLocaleString()}
              readOnly
              tabIndex={-1}
            />
            <div className="income-summary-label">Total Deductions</div>
            <input className="income-summary-input no-focus"
              type="text"
              value={form.currencySymbol + totalDeductions.toLocaleString()}
              readOnly
              tabIndex={-1}
            />
          </div>
        </section>
      </section>
      <div className="payslip-footer-wrap">
        <div className="payslip-summary-block">
          <div className="total-net-payable-heading">
            Total Net Payable : {form.currency}{totalNetPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="in-words-block">
            Rupees in Words: – {netPayInWords()}
          </div>
          <div className="formula-block">( Total Net Payable = Gross Earnings – Total Deductions )</div>
          <div className="summary-btn-row">
            <button className="summary-btn green" type="button" onClick={handleGeneratePayslip}>
              Generate Payslip
            </button>
            <button className="summary-btn red" type="button" onClick={handleReset}>
              <FaSyncAlt style={{ verticalAlign: "middle", marginRight: 8, fontSize: "1.2em" }} />
              Reset
            </button>
          </div>
        </div>
        <div className="feedback-row">
          <span className="feedback-text">
            Give feedback What do you experience with our product ?
          </span>
          <button className="feedback-button" disabled>
            FEEDBACK
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayslipForm;









// import React, { useState } from "react";
// import { PDFDownloadLink, Font, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
// import payslipImg from "../assets/images/payslip.png";
// import addIcon from "../assets/images/add.png";
// import deleteIcon from "../assets/images/delete-button.png";
// import dropdownIcon from "../assets/images/dropdown.png";
// import { FaSyncAlt } from "react-icons/fa";
// import { currencyList } from "./currencyList";
// import axios from "axios";

// Font.register({
//   family: "NotoSans",
//   src: "/fonts/Noto_Sans/NotoSans-Regular.ttf", // put your font file in public folder
// });

// const styles = StyleSheet.create({
//   page: {
//     fontFamily: "NotoSans",
//     fontSize: 12,
//     padding: 24,
//   },
//   header: {
//     display: "flex",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },
//   companyName: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   meta: {
//     textAlign: "right",
//   },
//   line: {
//     marginVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: "#888",
//   },
//   labelValueRow: {
//     display: "flex",
//     flexDirection: "row",
//     marginVertical: 4,
//   },
//   label: {
//     width: "30%",
//     fontWeight: "bold",
//   },
//   value: {
//     width: "70%",
//   },
//   summarySection: {
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   tableRow: {
//     display: "flex",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginVertical: 2,
//   },
//   earningsTitle: {
//     width: "45%",
//     fontWeight: "bold",
//     textDecoration: "underline",
//   },
//   deductionsTitle: {
//     width: "45%",
//     fontWeight: "bold",
//     textDecoration: "underline",
//     textAlign: "right",
//   },
//   amount: {
//     width: "45%",
//     textAlign: "right",
//   },
//   netPayableBlock: {
//     marginTop: 30,
//     padding: 12,
//     borderRadius: 6,
//     backgroundColor: "#f0f0f0",
//     textAlign: "center",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   rupeesInWords: {
//     fontStyle: "italic",
//     marginTop: 8,
//     textAlign: "center",
//     fontSize: 11,
//   },
// });

// const PayslipDocument = ({
//   form,
//   extraFields,
//   logoPreview,
//   grossEarnings,
//   totalDeductions,
//   totalNetPayable,
//   netPayInWords,
// }) => (
//   <Document>
//     <Page size="A4" style={styles.page}>
//       <View style={styles.header}>
//         <View>
//           {logoPreview && <Image src={logoPreview} style={{ width: 70, height: 50 }} />}
//         </View>
//         <View style={{ flexGrow: 1, paddingLeft: 10 }}>
//           <Text style={styles.companyName}>{form.companyName || "-"}</Text>
//           <Text>{form.companyAddress || "-"}</Text>
//           <Text>{form.secondLine || ""}</Text>
//           <Text>{form.country || "-"}</Text>
//           <Text>{form.cityPin || "-"}</Text>
//         </View>
//         <View style={styles.meta}>
//           <Text>Payslip for Month</Text>
//           <Text style={{ fontSize: 18, fontWeight: "bold", color: "#4CAF50" }}>
//             {form.payPeriod
//               ? new Date(form.payPeriod + "-01").toLocaleString("default", {
//                   month: "long",
//                   year: "numeric",
//                 })
//               : "-"}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.line} />

//       {[
//         ["Employee Name", form.employeeName],
//         ["Employee ID", form.employeeId],
//         ["Joining Date", form.joiningDate],
//         ["Contact", form.contact],
//         [
//           "Pay Period",
//           form.payPeriod
//             ? new Date(form.payPeriod + "-01").toLocaleString("default", {
//                 month: "long",
//                 year: "numeric",
//               })
//             : "",
//         ],
//         ["Pay Date", form.payDate],
//       ].map(([label, value], i) => (
//         <View key={i} style={styles.labelValueRow}>
//           <Text style={styles.label}>{label}:</Text>
//           <Text style={styles.value}>{value || "-"}</Text>
//         </View>
//       ))}

//       {extraFields.map(
//         (fld, i) =>
//           (fld.label || fld.value) && (
//             <View key={`extra-${i}`} style={styles.labelValueRow}>
//               <Text style={styles.label}>{fld.label || "-"}</Text>
//               <Text style={styles.value}>{fld.value || "-"}</Text>
//             </View>
//           )
//       )}

//       <View style={styles.line} />

//       <View style={styles.summarySection}>
//         <View style={styles.tableRow}>
//           <Text style={styles.earningsTitle}>Earnings</Text>
//           <Text style={styles.amount}>Amounts</Text>
//         </View>
//         {form.earnings.map((earning, i) => (
//           <View key={`e-${i}`} style={styles.tableRow}>
//             <Text style={{ width: "60%" }}>{earning.name || "-"}</Text>
//             <Text style={{ width: "40%", textAlign: "right" }}>
//               {form.currencySymbol} {earning.amount?.toLocaleString() || "0"}
//             </Text>
//           </View>
//         ))}
//         <View style={[styles.tableRow, { marginTop: 6 }]}>
//           <Text style={{ fontWeight: "bold" }}>Gross Earnings</Text>
//           <Text style={{ fontWeight: "bold", textAlign: "right" }}>
//             {form.currencySymbol} {grossEarnings.toLocaleString()}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.summarySection}>
//         <View style={styles.tableRow}>
//           <Text style={styles.deductionsTitle}>Deductions</Text>
//           <Text style={styles.amount}>Amounts</Text>
//         </View>
//         {form.deductions.map((deduction, i) => (
//           <View key={`d-${i}`} style={styles.tableRow}>
//             <Text style={{ width: "60%" }}>{deduction.name || "-"}</Text>
//             <Text style={{ width: "40%", textAlign: "right" }}>
//               {form.currencySymbol} {deduction.amount?.toLocaleString() || "0"}
//             </Text>
//           </View>
//         ))}
//         <View style={[styles.tableRow, { marginTop: 6 }]}>
//           <Text style={{ fontWeight: "bold" }}>Total Deductions</Text>
//           <Text style={{ fontWeight: "bold", textAlign: "right", color: "red" }}>
//             {form.currencySymbol} {totalDeductions.toLocaleString()}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.netPayableBlock}>
//         Total Net Payable : {form.currencySymbol} {totalNetPayable.toLocaleString()}
//       </View>

//       <Text style={styles.rupeesInWords}>Rupees in Words: {netPayInWords()}</Text>

//       <Text style={{ marginTop: 10, fontSize: 9, textAlign: "center" }}>
//         ( Total Net Payable = Gross Earnings – Total Deductions )
//       </Text>
//     </Page>
//   </Document>
// );

// const COLORS = [
//   "#2c84ff",
//   "#1abc9c",
//   "#f4b942",
//   "#fb7f6f",
//   "#a74de8",
//   "#ff7850",
//   "#7d7dfb",
//   "#ff8b00",
//   "#231f20",
//   "#7cf890",
// ];

// const PayslipForm = () => {
//   const [themeColor, setThemeColor] = useState("#ff7850");
//   const [currencyModal, setCurrencyModal] = useState(false);
//   const [currencySearch, setCurrencySearch] = useState("");
//   const [logo, setLogo] = useState(null);
//   const [logoPreview, setLogoPreview] = useState(null);
//   const [errors, setErrors] = useState({});
//   const [form, setForm] = useState({
//     companyName: "",
//     companyAddress: "",
//     secondLine: "",
//     cityPin: "",
//     country: "",
//     employeeName: "",
//     employeeId: "",
//     contact: "",
//     joiningDate: "",
//     payPeriod: getCurrentMonth(),
//     paidDays: "",
//     lossOfPayDays: "",
//     payDate: "",
//     earnings: [
//       { name: "Basic Pay Cost", amount: 0 },
//       { name: "Rent Allowance", amount: 0 },
//     ],
//     deductions: [
//       { name: "Income Tax", amount: 0 },
//       { name: "PF Amount", amount: 0 },
//     ],
//     currency: "INR",
//     currencySymbol: "₹",
//   });
//   const [extraFields, setExtraFields] = useState([]);
//   const [readyToDownload, setReadyToDownload] = useState(false);

//   const filteredCurrencies = currencyList.filter(
//     (c) =>
//       c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
//       c.code.toLowerCase().includes(currencySearch.toLowerCase())
//   );
//   const handleCurrencyChoose = (c) => {
//     setForm((prev) => ({
//       ...prev,
//       currency: c.code,
//       currencySymbol: c.symbol,
//     }));
//     setCurrencyModal(false);
//     setCurrencySearch("");
//   };

//   const handleLogoChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setLogo(file);
//       setLogoPreview(URL.createObjectURL(file));
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   // Extra fields logic
//   const handleAddField = () => {
//     setExtraFields((fields) => [...fields, { label: "", value: "" }]);
//   };
//   const handleExtraFieldChange = (idx, e) => {
//     const updated = [...extraFields];
//     updated[idx][e.target.name] = e.target.value;
//     setExtraFields(updated);
//   };
//   const handleDeleteField = (idx) => {
//     setExtraFields((fields) => fields.filter((_, i) => i !== idx));
//   };

//   // Earnings/Deductions
//   const handleEarningsChange = (index, field, value) => {
//     const earnings = [...form.earnings];
//     earnings[index][field] = field === "amount" ? Number(value) : value;
//     setForm((prev) => ({ ...prev, earnings }));
//   };
//   const handleAddEarning = () => {
//     setForm((prev) => ({
//       ...prev,
//       earnings: [...prev.earnings, { name: "", amount: 0 }],
//     }));
//   };
//   const handleDeleteEarning = (index) => {
//     setForm((prev) => ({
//       ...prev,
//       earnings: prev.earnings.filter((_, i) => i !== index),
//     }));
//   };
//   const handleDeductionsChange = (index, field, value) => {
//     const deductions = [...form.deductions];
//     deductions[index][field] = field === "amount" ? Number(value) : value;
//     setForm((prev) => ({ ...prev, deductions }));
//   };
//   const handleAddDeduction = () => {
//     setForm((prev) => ({
//       ...prev,
//       deductions: [...prev.deductions, { name: "", amount: 0 }],
//     }));
//   };
//   const handleDeleteDeduction = (index) => {
//     setForm((prev) => ({
//       ...prev,
//       deductions: prev.deductions.filter((_, i) => i !== index),
//     }));
//   };

//   // Validation
//   const validateForm = () => {
//     const newErrors = {};
//     if (!form.companyName) newErrors.companyName = "Enter Company Name";
//     if (!form.companyAddress) newErrors.companyAddress = "Enter Company Address";
//     if (!form.cityPin) newErrors.cityPin = "Enter Company Pin";
//     if (!form.employeeName) newErrors.employeeName = "Enter Employee Name";
//     if (!form.employeeId) newErrors.employeeId = "Enter Employee Id";
//     if (!form.joiningDate) newErrors.joiningDate = "Select the Joining Date";
//     if (!form.payPeriod) newErrors.payPeriod = "Select Pay Period";
//     if (!form.paidDays) newErrors.paidDays = "Enter PaidDays";
//     return newErrors;
//   };

//   const grossEarnings = form.earnings.reduce((sum, e) => sum + Number(e.amount), 0);
//   const totalDeductions = form.deductions.reduce((sum, d) => sum + Number(d.amount), 0);
//   const totalNetPayable = grossEarnings - totalDeductions;

//   function netPayInWords() {
//     if (totalNetPayable === 0) return "Zero Only";
//     if (totalNetPayable === 1) return "One Only";
//     return "eight hundred sixty-six thousand, four hundred eighty Only";
//   }

//   const handleGeneratePayslip = async () => {
//     const validationErrors = validateForm();
//     if (Object.keys(validationErrors).length) {
//       setErrors(validationErrors);
//       window.scrollTo(0, 0);
//       return;
//     }
//     try {
//       const payload = { ...form, extraFields };
//       await axios.post("http://localhost:5000/api/payslips", payload);
//       setReadyToDownload(true);
//       setErrors({});
//     } catch (error) {
//       alert("Failed to save payslip: " + (error.response?.data?.error || error.message));
//     }
//   };

//   const handleReset = () => {
//     setForm({
//       companyName: "",
//       companyAddress: "",
//       secondLine: "",
//       cityPin: "",
//       country: "",
//       employeeName: "",
//       employeeId: "",
//       contact: "",
//       joiningDate: "",
//       payPeriod: getCurrentMonth(),
//       paidDays: "",
//       lossOfPayDays: "",
//       payDate: "",
//       earnings: [
//         { name: "Basic Pay Cost", amount: 0 },
//         { name: "Rent Allowance", amount: 0 },
//       ],
//       deductions: [
//         { name: "Income Tax", amount: 0 },
//         { name: "PF Amount", amount: 0 },
//       ],
//       currency: "INR",
//       currencySymbol: "₹",
//     });
//     setLogo(null);
//     setLogoPreview(null);
//     setExtraFields([]);
//     setErrors({});
//     setReadyToDownload(false);
//   };

//   return (
//     <div className="main-payslip-shell">
//       {/* Currency Modal */}
//       {currencyModal && (
//         <div className="currency-modal-overlay" onClick={() => setCurrencyModal(false)}>
//           <div className="currency-modal" onClick={(e) => e.stopPropagation()}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//               <div className="currency-modal-title">Select Currency</div>
//               <span style={{ fontSize: "2rem", cursor: "pointer" }} onClick={() => setCurrencyModal(false)}>
//                 &times;
//               </span>
//             </div>
//             <input
//               className="currency-modal-search"
//               value={currencySearch}
//               onChange={(e) => setCurrencySearch(e.target.value)}
//               placeholder="Search currency or code"
//               autoFocus
//             />
//             <div className="currency-list">
//               {filteredCurrencies.map((c) => (
//                 <div key={c.code} className="currency-list-item" onClick={() => handleCurrencyChoose(c)}>
//                   <span className="currency-name">{c.name}</span>
//                   <span className="currency-symbol">{c.symbol}</span>
//                   <span className="currency-code">{c.code}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//       {/* HEADER */}
//       <section className="payslip-header" style={{ background: themeColor }}>
//         <div className="payslip-header-content">
//           <div className="payslip-text-block">
//             <h1>Free Payslip Generator</h1>
//             <p>
//               Say goodbye to confusing and time-consuming payroll processes with our free payslip generator. Our user-friendly software
//               allows you to create customized payslips in minutes.
//             </p>
//           </div>
//           <img src={payslipImg} alt="Payslip illustration" className="payslip-image" />
//         </div>
//       </section>
//       <section className="payslip-container payslip-card-bg">
//         {/* Your form inputs here, same as before */}
//       </section>
//       <div className="payslip-footer-wrap">
//         <div className="payslip-summary-block">
//           <div className="total-net-payable-heading">
//             Total Net Payable : {form.currency}
//             {totalNetPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
//           </div>
//           <div className="in-words-block">Rupees in Words: – {netPayInWords()}</div>
//           <div className="formula-block">( Total Net Payable = Gross Earnings – Total Deductions )</div>
//           <div className="summary-btn-row" style={{ marginTop: "20px" }}>
//             <button className="summary-btn green" type="button" onClick={handleGeneratePayslip}>
//               Generate Payslip
//             </button>
//             <button className="summary-btn red" type="button" onClick={handleReset}>
//               <FaSyncAlt style={{ verticalAlign: "middle", marginRight: 8, fontSize: "1.2em" }} />
//               Reset
//             </button>

//             {readyToDownload && (
//               <PDFDownloadLink
//                 document={
//                   <PayslipDocument
//                     form={form}
//                     extraFields={extraFields}
//                     logoPreview={logoPreview}
//                     grossEarnings={grossEarnings}
//                     totalDeductions={totalDeductions}
//                     totalNetPayable={totalNetPayable}
//                     netPayInWords={netPayInWords()}
//                   />
//                 }
//                 fileName={`${form.employeeName || "Payslip"}_Payslip.pdf`}
//                 style={{
//                   marginLeft: 10,
//                   padding: "8px 12px",
//                   backgroundColor: "#4caf50",
//                   color: "white",
//                   border: "none",
//                   borderRadius: 4,
//                   cursor: "pointer",
//                   textDecoration: "none",
//                 }}
//                 onClick={() => setReadyToDownload(false)}
//               >
//                 Download Payslip PDF
//               </PDFDownloadLink>
//             )}
//           </div>
//         </div>
//         <div className="feedback-row">
//           <span className="feedback-text">Give feedback What do you experience with our product ?</span>
//           <button className="feedback-button" disabled>
//             FEEDBACK
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PayslipForm;

// // Single declaration helper function
// function getCurrentMonth() {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = (now.getMonth() + 1).toString().padStart(2, "0");
//   return `${year}-${month}`;
// }
