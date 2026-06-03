const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");

// Import routes
const holidayRoutes = require("./routes/holidayRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const dutyRoutes = require("./routes/dutyRoutes");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const userRoutes = require("./routes/userRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const patientPortalRoutes = require("./routes/patientPortalRoutes");
const configChangeLogRoutes = require("./routes/configChangeLogRoutes");
const salaryRoutes = require("./routes/salaryRoutes");


const app = express();

// Kết nối MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({ success: true, message: "🦷 Mec Dental API is running..." });
});

// API Routes - Nhóm chức năng 2: Quản lý lịch khám
app.use("/api/v1/holidays", holidayRoutes);
app.use("/api/v1/shifts", shiftRoutes);
app.use("/api/v1/duty-schedules", dutyRoutes);
app.use("/api/v1/patients", patientRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/permissions", permissionRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/patient-portal", patientPortalRoutes);
app.use("/api/v1/config-change-logs", configChangeLogRoutes);
app.use("/api/v1/salaries", salaryRoutes);


// Middleware xử lý lỗi tập trung (phải đặt sau tất cả routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
