// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
     
//     </>
//   )
// }

// export default App

// import React from "react";
// import PayslipForm from "./components/PayslipForm";
// function App() {
//   return (
//     <div>

//       <PayslipForm />
//     </div>
//   );
// }
// export default App;


import React from "react";
import PayslipForm from "./components/PayslipForm";
import "./App.css";

function App() {
  return (
    <div className="payslip-page-root">
      <PayslipForm />
      <div className="payslip-footer-wrap">{/* ... footer ... */}</div>
    </div>
  );
}

export default App;
