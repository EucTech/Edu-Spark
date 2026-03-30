# EduSpark

EduSpark is a platform for educators to create and manage their courses, built with a **NestJS** backend and a **Next.js** frontend.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)
- A MySQL database (connection string goes in `backend/.env`)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/EucTech/Edu-Spark.git
cd Edu-Spark
```

### 2. Install dependencies

```bash
# Backend
cd backend
pnpm install

# Frontend
cd ../frontend
pnpm install
```

### 3. Configure environment variables

**Backend** — create `backend/.env`:

```env
DATABASE_URL="your-mysql-connection-string"
JWT_SECRET="your-secret-key"
PORT=4001
SYSTEM_REGISTRATION_SECRET="your-registration-secret"
```

**Frontend** — create `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4001/api or https://edu-spark-production.up.railway.app/api
```

### 4. Set up the database

```bash
cd backend
npx prisma generate
npx prisma db push
```

### 5. Run the app

```bash
# Backend (from /backend)
pnpm start:dev

# Frontend (from /frontend)
pnpm dev
```

The backend runs on `http://localhost:4001/api` (local) or `https://edu-spark-production.up.railway.app/api` (production). The frontend runs on `http://localhost:3000`.

## Live Links

- **Frontend:** https://edu-spark-frontend-production.up.railway.app/
- **API:** https://edu-spark-production.up.railway.app/api
- **Swagger Docs:** https://edu-spark-production.up.railway.app/docs

## Testing Credentials

| Role     | Email / Username              | Password   |
|----------|-------------------------------|------------|
| Admin    | euccreative+50@gmail.com      | $Uche123   |
| Guardian | h.okereke@alustudent.com      | eduspark   |
| Student  | favvy                         | eduspark   |

## Demo

[Watch the demo on Loom](https://www.loom.com/share/7cc245cb8e83472fac5c8e26bfb00345)