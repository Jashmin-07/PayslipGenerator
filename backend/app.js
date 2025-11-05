// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const payslipRoutes = require('./routes/payslipRoutes');

// const app = express();

// app.use(cors());
// app.use(bodyParser.json());
// app.use('/api/payslip', payslipRoutes);

// const PORT = process.env.PORT || 5000;

// const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("MongoDB connected"))
//   .catch(err => console.log(err));

// app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));




require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const payslipRoutes = require('./routes/payslipRoutes');

const app = express();

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('ERROR: MONGODB_URI is not set in .env file');
  process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.use('/api/payslips', payslipRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
