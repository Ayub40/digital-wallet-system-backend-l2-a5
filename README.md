# 💳 Digital Wallet System API

A complete backend API system for managing a secure and feature-rich digital wallet platform. This system allows **Users**, **Agents**, and **Admins** to perform various operations such as transactions, role management, commission tracking, and wallet control.

## 🌐 Base URL

```
https://your-api-domain.com/api/v1
```

## 🧱 Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB (Mongoose)
- JWT (Authentication)
- Bcrypt (Password Hashing)
- Zod (Request Validation)
- Express Async Handler
- Custom Error Handling
- Role-based Authorization
- MVC & Modular Architecture

## 👥 Roles

- **SUPER_ADMIN**: Manages all admins and agents.
- **ADMIN**: Manages users, agents, wallets, and transactions.
- **AGENT**: Can cash in, cash out, and add balance to self.
- **USER**: Can add money, send money, and withdraw.

## 🔐 Authentication & Authorization

- JWT-based login system.
- Secure password hashing using bcrypt.
- Role-based route protection and access control.

## 🧾 Features

### 👤 User Features

- Register/Login
- Add Money (from external source)
- Withdraw Money (to external source)
- Send Money (to another user)
- View Transactions
- Wallet Balance

### 🧑‍💼 Agent Features

- Cash In (to any user)
- Cash Out (from any user)
- Add Money to own wallet (unlimited)
- View Own Transactions

### 🛡 Admin/Super Admin Features

- Create/Administer Users & Agents
- Approve/Suspend Agents
- View all transactions
- Role Management

## 🔁 Transaction Rules

- **User:**
  - `Add Money`: from="External source", to=Current User
  - `Withdraw Money`: from=Current User, to="External source"
  - `Send Money`: from=Current User, to=Another User

- **Agent:**
  - `Cash In`: from=Agent, to=Any User
  - `Cash Out`: from=Any User, to=Agent
  - `Add Money`: from=Nothing, to=Self (Unlimited)

## 🧩 Modules

Each module follows a structured approach:

```
src/
  └── app/
      ├── modules/
      │   ├── user/
      │   │   ├── user.interface.ts
      │   │   ├── user.model.ts
      │   │   ├── user.controller.ts
      │   │   ├── user.service.ts
      │   │   ├── user.route.ts
      │   │   └── user.validation.ts
      │   └── ...
```

## 🧪 API Endpoints (Sample)

| Method | Endpoint                   | Description                    |
|--------|----------------------------|--------------------------------|
| POST   | `/auth/register`           | Register new user/agent       |
| POST   | `/auth/login`              | Login                         |
| GET    | `/users/me`                | Get logged-in user info       |
| PATCH  | `/users/:id/approve`       | Approve/Suspend agent         |
| POST   | `/transactions/add-money`  | Add money to wallet           |
| POST   | `/transactions/withdraw`   | Withdraw from wallet          |
| POST   | `/transactions/send`       | Send money to another user    |
| POST   | `/transactions/cash-in`    | Agent cash in to a user       |
| POST   | `/transactions/cash-out`   | Agent cash out from a user    |

## ✅ Validation

All requests are validated using **Zod** schemas before hitting the controller logic.

## ⚠️ Error Handling

Custom global error handler for consistent and structured error responses.

## 🔒 Security Measures

- JWT tokens with expiration
- Hashed passwords with bcrypt
- Middleware for protected routes
- Rate-limiting (optional)
- CORS configuration

## 🏁 Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

```bash
git clone https://github.com/your-username/digital-wallet-api.git
cd digital-wallet-api
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```
PORT=4000
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=10
```

### Run the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 📁 Folder Structure

```
src/
├── app/
│   ├── modules/
│   ├── middlewares/
│   ├── routes/
│   ├── utils/
│   └── config/
├── constants/
├── errorHelpers/
├── server.ts
└── app.ts
```

## 🧠 License



