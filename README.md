
### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see backend repository)

### Installation

1. **Clone the repository**
   ```
   git clone https://github.com/shabeeb248/Nima-market-research-tool-frontend.git
   cd Nima-market-research-tool-frontend
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start the development server**
   ```
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 📖 Usage

### Admin Access

**Default Admin Credentials:**
- Email: `admin@gmail.com`
- Password: `test@1234`

**Admin Workflow:**
1. Login with admin credentials
2. Navigate to Admin Panel
3. Add new users via "Users" section
4. Monitor system analytics and user searches

### User Access

**Creating a User Account:**
1. Login as admin
2. Go to "Users" tab
3. Click "+ Add User"
4. Enter username, email, and password
5. Click "Create"

**User Workflow:**
1. Login with user credentials
2. Enter search keywords
3. Select data types (News, Articles, Papers)
4. Click "Search"
5. View paginated results
6. Download PDF report

## 👥 User Roles

### Admin
- Full system access
- User management
- Analytics viewing
- All reports access

### User
- Search functionality
- Personal report generation
- Search history access
- Profile management

## 📁 Project Structure

```
market-research-tool/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── UserManagement.tsx
│   │   ├── SearchResults.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── AuthPage.tsx
│   │   ├── Login.tsx
│   │   └── KeywordSearch.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   └── reportApi.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
└── README.md
```

## 🔌 API Integration

The frontend integrates with the following backend endpoints:

### Authentication
- `POST /api/login` - User login
- `POST /api/signup` - User registration

### Search & Reports
- `POST /api/get-data` - Perform search
- `GET /api/search-results/{searchId}` - Get search results
- `GET /api/reports` - Get user reports
- `GET /api/download-report/{searchId}` - Download PDF report

### Admin Endpoints
- `GET /api/admin/users` - List all users
- `POST /api/admin/add-user` - Add new user
- `PATCH /api/admin/update-user/{userId}` - Update user
- `PATCH /api/admin/change-status/{userId}` - Change user status
- `GET /api/admin/search-results` - Get all search results
- `POST /api/admin/analytics` - Get system analytics

