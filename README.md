# 🦷 Mec Dental Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React%2019-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20v4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)](https://nodejs.org/)

A premium, full-stack Dental Clinic Management System designed with the **"Medical Sanctuary"** philosophy. This project focuses on providing a professional landing page for patients and a robust management system for clinic operations.

## ✨ Key Features

### 🌐 Premium Landing Page
- **Hero Section:** Engaging introduction with glassmorphism effects and floating 3D icons.
- **Service Showcase:** Interactive grid displaying core dental services (Implant, Orthodontics, etc.).
- **Doctor Profiles:** Professional cards showcasing the clinic's dedicated experts.
- **Gallery:** High-fidelity space showcase using a responsive bento-grid layout.
- **Appointment Form:** Seamless user experience for booking consultations with instant visual feedback.

### ⚙️ Management System (QA Focused)
- **Patient Management:** Track records and treatment history.
- **Scheduling:** Real-time appointment management.
- **Authentication:** Secure access using JWT and bcrypt.
- **Testing Suite:** Developed specifically for Software Testing and Quality Assurance evaluation.

## 🎨 Design Philosophy: "Medical Sanctuary"
Built with **Tailwind CSS v4**, the UI follows a "Medical Sanctuary" theme:
- **Tonal Layering:** Deep blues (`#003b9a`) for authority combined with soft surfaces for comfort.
- **Glassmorphism:** High-end backdrop blurs and subtle white borders.
- **Modern Typography:** Clean and readable **Manrope** font throughout the application.

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Material Symbols |
| **Backend** | Node.js, Express |
| **Database** | MySQL (with support for Sequelize/JSON) |
| **Auth** | JSON Web Tokens (JWT), Bcrypt.js |

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MySQL Server

### 1. Backend Configuration
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dental_db
JWT_SECRET=your_super_secret_key
```
Start the server:
```bash
npm run dev
```

### 2. Frontend Configuration
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📂 Project Structure
```text
.
├── backend/            # Express.js API
│   ├── src/            # Backend logic
│   └── package.json
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── assets/     # High-res image assets
│   │   ├── components/ # Modular UI components
│   │   └── index.css   # Custom Tailwind v4 tokens
│   └── package.json
└── README.md
```

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ for Excellence in Dental Care.*
