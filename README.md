# Zepository

**Zepository** is a modern, comprehensive IT Asset Management System designed specifically for educational institutions and organizations to efficiently track and manage hardware resources, labs, and equipment lifecycles.

---

## 🌟 Key Features

- **Comprehensive Asset Tracking**: Track hardware assets (computers, peripherals, network devices) along with their complete metadata, including Brand, Model, Serial Number, Purchase Date, Funding Agency, and Price.
- **Location Management**: Centralized management of Labs/Rooms, allowing you to seamlessly assign and reassign equipment to specific physical locations.
- **Deep Detail Logging**: Support for capturing extended equipment details:
  - **Warranty Details**: Track vendor information, contacts, and warranty active periods.
  - **Ledger Records**: Sync physical record-keeping with digital tracking (Ledger Serial No, Page No).
  - **Custom Specifications**: Dynamically attach specific attributes (e.g., RAM, Storage, Processing Power) with measurable units.
- **Status Monitoring**: Track the working status of equipment (Working, Defective, Obsolete) and perform immediate state updates.
- **Rich Dashboard Analytics**: Interactive, visually stunning dashboards displaying system health, total assets, defective item counts, and recent system activities.
- **Secure Authentication**: Built-in secure user authentication using JWT to ensure that only authorized personnel can add, modify, or delete assets.

---

## 🛠️ Technology Stack

**Frontend**
- **React.js (Vite)**: Lightning-fast, modern frontend framework.
- **Tailwind CSS**: Utility-first CSS framework for a premium, highly responsive UI.
- **React Router DOM**: Client-side routing for seamless page transitions.
- **Axios**: robust HTTP client for backend communication.

**Backend**
- **Node.js & Express**: High-performance backend routing and logic.
- **MySQL2**: Secure, robust relational database connection pool.
- **JSON Web Tokens (JWT)**: Stateless API security.

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v16 or higher)
- [MySQL](https://www.mysql.com/) database server running locally or remotely

### 1. Clone the Repository
```bash
git clone https://github.com/lalit-5720/Zepository.git
cd Zepository
```

### 2. Database Setup
1. Log into your MySQL instance.
2. Create a new database named `zepository_db` (or a name of your choosing).
3. Import the required SQL schemas (ensure you have tables for `asset_details`, `asset_types`, `lab_details`, `ledger_details`, `warranty_details`, `asset_specs`, and `users`).

### 3. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` root and configure the following variables:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   DB_NAME=zepository_db
   JWT_SECRET=your_super_secret_jwt_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 4. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` root and configure your API URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## 📡 API Endpoints & Requirements

All protected routes require a valid JSON Web Token (JWT) sent in the `Authorization` header.

**Header Format:**
```json
{
  "Authorization": "Bearer <your_jwt_token>"
}
```

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/login` | Authenticate user and receive JWT. (Payload: `email`, `password`) | No |
| `POST` | `/signup` | Register a new user. (Payload: `name`, `email`, `password`) | No |
| `GET`  | `/me`    | Retrieve authenticated user details. | Yes |

### Assets (`/api/assets`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/` | Retrieve all active assets excluding obsolete ones. | Yes |
| `GET`  | `/:id` | Retrieve detailed data for a specific asset (including specs, warranty, ledger, and service history). | Yes |
| `POST` | `/add` | Create a new asset along with optional specs/warranty/ledger. (Payload: `type_id`, `brand`, `model`, `serial_no`, etc.) | Yes |
| `PUT`  | `/:id` | Update an existing asset and override its associated nested data (`basic`, `ledger`, `warranty`, `specs`). | Yes |
| `GET`  | `/stats` | Retrieve asset dashboard statistics (working, defective, under service grouped by type). | Yes |
| `GET`  | `/types` | Retrieve a list of all available asset types. | Yes |

### Labs / Locations (`/api/labs`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/` | Retrieve a list of all labs and their current in-charge faculty. | Yes |
| `POST` | `/` | Create a new lab record (Payload: `name` or `lab_name`). | Yes |
| `PUT`  | `/:id` | Rename an existing lab or update details (Payload: `name` or `lab_name`). | Yes |
| `DELETE`| `/:id` | Delete a lab (Fails if assets are currently assigned). | Yes |

### Services / Maintenance (`/api/service`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/` | Retrieve all assets currently under maintenance/service. | Yes |
| `POST` | `/send/:id` | Send a specific asset to service/maintenance. (Payload: `asset_id`, `sent_date`, `service_provider`, `service_through`, `service_note`) | Yes |
| `PUT`  | `/complete/:id`| Mark a specific asset's service as completed. (Payload: `service_cost`, `service_note`, `claim_warranty`) | Yes |

---

## 📁 Project Structure

```text
Zepository/
├── backend/                  # Node.js Express Backend
│   ├── controllers/          # Business logic (assetController, labController, etc.)
│   ├── middleware/           # Express middlewares (JWT auth, error handling)
│   ├── routes/               # API route definitions
│   ├── db/                   # MySQL connection pooling setup
│   └── server.js             # Application entry point
│
└── frontend/                 # React Frontend
    ├── src/
    │   ├── assets/           # Static assets, images, icons
    │   ├── components/       # Reusable React components (UI blocks, forms)
    │   ├── hooks/            # Custom React hooks (e.g., useLabsRooms)
    │   ├── services/         # API abstraction layer (Axios interceptors)
    │   ├── App.jsx           # Main routing component
    │   └── main.jsx          # React DOM mounting point
    ├── index.html            # Vite entry template
    └── tailwind.config.js    # Tailwind theme and plugin configuration
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
If you plan to make major architectural changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
