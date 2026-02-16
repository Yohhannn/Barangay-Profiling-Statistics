# Barangay Profiling Statistics System

A modern web application built with Laravel 12, Inertia.js (React), Tailwind CSS v4, and PostgreSQL for managing and analyzing barangay-level profiling data.

---

### Prerequisites

#### Before starting, ensure you have the following installed:

- PHP 8.3+
- Composer
- Node.js & NPM
- PostgreSQL (Running locally)

---

### Installation & Setup

All commands should be executed from within the **_/main_** directory of the repository.

1. Clone and Navigate to cd /main
2. composer run setup
3. Open the .env file in the root of the /main directory and update your PostgreSQL credentials

```DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=DB_BarangayProfilingStatistics
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

4. php artisan key:generate
5. php artisan migrate --seed
6. npm install
7. npm install three @types/three @react-three/fiber @react-three/drei next-themes lucide-react sweetalert2
8. composer run dev

```
Server running on [http://127.0.0.1:8000].
VITE Local:   http://localhost:5173/
```
