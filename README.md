# 🏛️ Nyaya Setu (न्याय सेतु)

**Nyaya Setu** is a comprehensive, modern Digital Justice and e-FIR platform built for the citizens, police officers, investigating agencies, and judiciary of India. It aims to bridge the gap between citizens and the justice system by providing a transparent, secure, and accessible digital portal.

## ✨ Key Features

### 👤 For Citizens
- **Secure e-FIR Logging:** File an FIR digitally in minutes with AES-256 grade data security.
- **Real-Time Tracking:** Track the status of your FIRs and cases effortlessly through the dashboard.
- **Bilingual Support:** Access the portal seamlessly in both English and Hindi.
- **FAQ Search Portal:** Quickly find answers to common justice-related questions through an interactive, smart search bar.

### 👮‍♂️ For Police & Investigation Agencies
- **Cross-Agency Data Sharing:** Securely share critical case information and evidence between departments.
- **Evidence Vault:** Upload and view tampering-proof digital evidence with a secure chain of custody.
- **Audit Trails:** Ensure 100% transparency with detailed logs of who viewed or modified a case.
- **Two-Step Verification:** Government officers are authenticated via a stringent 2FA and ID proof upload flow.
- **Smart Case Search & Inter-department Chat:** Streamline investigations and internal communication.

### ⚖️ For Judiciary & Courts
- **Digital Case Proceedings:** View full case details and associated FIRs in an organized layout.
- **Document Management:** Directly access uploaded evidence and verified reports from investigating officers.

## 🎨 UI/UX Highlights
- **Modern Glassmorphism:** A stunning UI utilizing beautiful frosted glass cards, dynamic light-themed color palettes (greens, pinks, violets, and oranges), and smooth gradients.
- **Interactive Animations:** Features micro-animations, staggering popups, hovering 3D elements, and CSS-driven text gradient shimmers.
- **UIDAI-Style Carousel:** A responsive, sleek image carousel for announcements and platform highlights.
- **Interactive Map:** An embedded, interactive map of India built with `react-simple-maps` for tracking state-level analytics.

## 🚀 Tech Stack

- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Maps:** `react-simple-maps` & `topojson-client`
- **Routing:** `react-router-dom`

## 🛠️ Installation & Setup

1. **Clone the repository (if applicable)**
   ```bash
   git clone https://github.com/YourUsername/nyaya-setu.git
   cd nyaya-setu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🔐 Authentication (Mocked)
The platform currently utilizes a mocked AuthContext for demonstration purposes. Depending on the login role selected (`citizen`, `police`, `agency`, `court`), the UI completely adapts its routing, sidebars, and dashboard metrics to match the user's permissions.

---
*Built as a digital initiative to revolutionize the Indian Justice System.*
