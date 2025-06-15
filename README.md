# 📦 Simple Inventory Web

<p align="center">
    <img src="https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel">
    <img src="https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP">
    <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
    <img src="https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap">
</p>

<p align="center">
    <strong>A modern, user-friendly web application for managing inventory items with real-time tracking and comprehensive reporting features.</strong>
</p>

---

## 🎯 About The Project

Simple Inventory Web adalah sistem manajemen inventori berbasis web yang dirancang untuk membantu bisnis kecil hingga menengah dalam mengelola stok barang mereka. Aplikasi ini menyediakan interface yang intuitif dan fitur-fitur lengkap untuk tracking inventori secara real-time.

### ✨ Key Features

- 📋 **Complete Inventory Management** - Add, edit, delete, and track inventory items
- 📊 **Real-time Stock Monitoring** - Live updates on stock levels and movements
- 🔄 **Stock Alerts** - Automatic notifications for low stock levels

## 🛠️ Built With

This project is built using modern web technologies:

**Backend:**
- **Laravel 7** - PHP Framework for robust backend architecture
- **MySQL** - Reliable database management system
- **PHP** - Server-side scripting language

**Frontend:**
- **Blade Templates** - Laravel's templating engine
- **Bootstrap 5** - Responsive CSS framework
- **jQuery** - JavaScript library for dynamic interactions
- **React js** - For beautiful data visualizations

**Tools & Services:**
- **Composer** - PHP dependency management
- **npm** - Node.js package manager
- **Vite** - Fast build tool and dev server

## 🚀 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/codemysister/simple-inventory-web.git
cd simple-inventory-web
```

### 2. Install Backend Dependencies

```bash
# Install PHP dependencies via Composer
composer install
```

### 3. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Database Configuration

Edit file `.env` dan sesuaikan konfigurasi database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=inventory
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 5. Database Migration & Seeding

```bash
# Create database tables and insert sample data
php artisan migrate --seed
```

### 6. Install Frontend Dependencies

```bash
# Install JavaScript dependencies
npm install
```

### 7. Build Frontend Assets

```bash
# For development
npm start
```

## 🌐 Accessing The Application

- **Main Application**: [http://localhost:8000](http://localhost:3000)

### 👤 Default Login Credentials

Setelah menjalankan `php artisan migrate --seed`:

```
Email: admin@gmail.com
Password: admin123
```

```
Email: user@gmail.com
Password: user123
```
