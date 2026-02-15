# CloudVault - Personal Cloud Storage & File Sharing

CloudVault is a modern, high-performance web application for secure cloud storage and seamless file sharing. It provides a robust, user-friendly interface for managing personal files, collaborating with others, and handling subscriptions.

## 🚀 Key Features

### 🔐 Advanced Authentication
- **Multi-Method Login**: Support for traditional Email/Password, Google OAuth, and GitHub OAuth.
- **Secure Registration**: 2-step registration process with mandatory **Email OTP Verification**.
- **Password Security**: Built-in password strength indicator to ensure robust user credentials.
- **Multi-Device Session Handling**: Intelligent eviction logic that notifies users and logs them out if they log in from another device (based on subscription limits).
- **Security**: All user inputs are sanitized using `DOMPurify` to prevent XSS.

### 📁 Intelligent File Management
- **Hierarchical File System**: Create, navigate, and manage nested folders with ease.
- **High-Performance Uploads**: Implements **S3 Direct Uploads** with progress tracking, supporting multiple file selections and cancellation.
- **External Imports**: Seamlessly import files directly from **Google Drive** using the integrated Google Picker.
- **Smart Actions**:
  - **Rename**: Change file/folder names with built-in protection for file extensions.
  - **Delete**: Safely remove files and directories.
  - **View/Download**: Instant preview and download options.
- **View Modes**: Toggle between **List View** and **Grid View** based on your preference.
- **Smart Search & Sort**: Efficiently find files with real-time search and sorting by name, date, or size.

### 🤝 Seamless Collaboration & Sharing
- **Public & Private Sharing**: Share files/folders via public links or directly with specific users.
- **Granular Permissions**: Control access by assigning **Viewer** or **Editor** roles to collaborators.
- **Collaboration Dashboard**: Dedicated "Shared with Me" and "Shared by Me" views to track all shared resources.
- **Management Center**: Centralized page to manage and revoke permissions for any shared item.

### 💳 Subscription & Billing
- **Tiered Plans**: Flexible plans (Free, Standard, Premium) with varying storage limits and device access.
- **Razorpay Integration**: Fully integrated payment gateway for secure monthly or yearly subscription renewals.
- **Restriction Logic**: Graceful handling of "Paused", "Expired", or "Halted" subscriptions, limiting actions like uploads, downloads, and deletions.
- **Smooth Redirects**: Visual countdown and status polling during subscription activation.

### 🎨 Premium UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile browsers.
- **Dynamic Interactions**: Custom right-click context menus for quick actions on items.
- **Real-time Feedback**: Interactive "Toast" notifications and loading overlays for all critical actions (uploads, deletes, auth).
- **Aesthetic Excellence**: Modern, clean interface with custom icons (`Lucide-React`, `React-Icons`) and smooth transitions.

## 🛠️ Technology Stack

- **Frontend Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **State & Routing**: React Router v7, Context API
- **Authentication**: Auth0/Custom OAuth (Google, GitHub)
- **API Communication**: Axios, Fetch API
- **Payment Gateway**: Razorpay
- **Icons**: Lucide-React, React-Icons
- **Security & Utilities**: DOMPurify, Input-OTP, Tailwind-Merge, Clsx

## 📂 Project Structure

- `src/apis`: Subscription and OAuth API integration.
- `src/components`: Reusable UI components (Modals, Headers, Toasts, Context Menus).
- `src/context`: Auth state management.
- `src/lib`: Core utility functions.
- `src/main.jsx` & `src/App.jsx`: Root configuration and routing.
- `public/`: Static assets and icons.

---
Developed with ❤️ for secure and efficient cloud management.
