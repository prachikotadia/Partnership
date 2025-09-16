# Together Backend API

A comprehensive backend API for the Together partner collaboration platform, built with Node.js, Express, TypeScript, and PostgreSQL.

## 🚀 Features

### Core Features
- **User Authentication & Management** - JWT-based auth with partner connections
- **Real-time Communication** - WebSocket support for live updates
- **Task Management** - Shared task lists with subtasks and assignments
- **Notes & Collaboration** - Shared notes with categories and tags
- **Daily Check-ins** - Mood tracking and streak management
- **Financial Planning** - Shared expense tracking and budgeting
- **Schedule Management** - Shared calendar with events and reminders
- **Bucket List** - Shared goals and achievements tracking
- **Push Notifications** - Real-time notifications for partners
- **File Uploads** - Support for attachments and media

### Technical Features
- **RESTful API** - Well-structured REST endpoints
- **Real-time Updates** - Socket.IO for live collaboration
- **Database ORM** - Prisma for type-safe database operations
- **Caching** - Redis for session management and caching
- **Email Service** - Nodemailer for transactional emails
- **Security** - Helmet, rate limiting, input validation
- **Error Handling** - Comprehensive error handling and logging
- **TypeScript** - Full type safety throughout the application

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- Redis (v6 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/together_db"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_EXPIRES_IN="7d"
   
   # Server
   PORT=3001
   NODE_ENV="development"
   CORS_ORIGIN="http://localhost:8080"
   
   # Redis
   REDIS_URL="redis://localhost:6379"
   
   # Email (optional)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token"
  }
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/me`
Get current user information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### Task Management

#### GET `/api/tasks`
Get all tasks for the authenticated user.

**Query Parameters:**
- `status` - Filter by status (TODO, IN_PROGRESS, DONE, CANCELLED)
- `priority` - Filter by priority (LOW, MEDIUM, HIGH, URGENT)
- `assignedTo` - Filter by assigned user
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

#### POST `/api/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Get ingredients for dinner",
  "priority": "MEDIUM",
  "dueDate": "2024-01-15T18:00:00Z",
  "assignedTo": "Person2"
}
```

#### PUT `/api/tasks/:id`
Update an existing task.

#### DELETE `/api/tasks/:id`
Delete a task.

### Notes Management

#### GET `/api/notes`
Get all notes for the authenticated user.

#### POST `/api/notes`
Create a new note.

**Request Body:**
```json
{
  "title": "Meeting Notes",
  "content": "Discussion about project timeline",
  "category": "Work",
  "tags": ["meeting", "project"],
  "isPinned": false,
  "isShared": true
}
```

### Check-ins & Streaks

#### GET `/api/check-ins`
Get all check-ins for the authenticated user.

#### POST `/api/check-ins`
Create a daily check-in.

**Request Body:**
```json
{
  "mood": "happy",
  "emoji": "😊",
  "note": "Had a great day!",
  "energy": 8,
  "gratitude": "Grateful for good health",
  "goals": ["Exercise", "Read"],
  "partnerMessage": "Love you!",
  "isShared": true
}
```

#### GET `/api/check-ins/today`
Get today's check-in status.

#### GET `/api/check-ins/streaks`
Get all streaks for the authenticated user.

### Financial Management

#### GET `/api/finance`
Get all finance entries.

#### POST `/api/finance`
Create a new finance entry.

**Request Body:**
```json
{
  "title": "Grocery Shopping",
  "description": "Weekly groceries",
  "amount": 150.00,
  "currency": "USD",
  "category": "Food",
  "type": "EXPENSE",
  "date": "2024-01-15T00:00:00Z",
  "assignedTo": "Person2"
}
```

#### GET `/api/finance/summary`
Get financial summary with totals by type.

### Schedule Management

#### GET `/api/schedule`
Get all schedule items.

#### POST `/api/schedule`
Create a new schedule item.

**Request Body:**
```json
{
  "title": "Date Night",
  "description": "Dinner at our favorite restaurant",
  "startDate": "2024-01-20T19:00:00Z",
  "endDate": "2024-01-20T22:00:00Z",
  "isAllDay": false,
  "location": "The Romantic Bistro",
  "mood": "romantic",
  "assignedTo": "Both"
}
```

### Bucket List

#### GET `/api/bucket-list`
Get all bucket list items.

#### POST `/api/bucket-list`
Create a new bucket list item.

**Request Body:**
```json
{
  "title": "Visit Japan",
  "description": "Experience cherry blossom season",
  "category": "Travel",
  "priority": "HIGH",
  "cost": 5000,
  "timeEstimate": "2 weeks",
  "difficulty": "medium",
  "assignedTo": "Person1"
}
```

### User Management

#### GET `/api/users/profile`
Get user profile information.

#### PUT `/api/users/preferences`
Update user preferences.

#### POST `/api/users/connect-partner`
Connect with a partner by email.

#### DELETE `/api/users/disconnect-partner`
Disconnect from current partner.

### Notifications

#### GET `/api/notifications`
Get all notifications.

#### PUT `/api/notifications/:id/read`
Mark a notification as read.

#### PUT `/api/notifications/mark-all-read`
Mark all notifications as read.

## 🔌 WebSocket Events

The API supports real-time communication through WebSocket connections.

### Client Events (Send to Server)

- `task:update` - Update task information
- `note:update` - Update note information
- `checkin:create` - Create a new check-in
- `finance:update` - Update finance information
- `schedule:update` - Update schedule information
- `bucket:update` - Update bucket list item
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `presence:update` - Update presence status

### Server Events (Receive from Server)

- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `note:created` - New note created
- `note:updated` - Note updated
- `note:deleted` - Note deleted
- `checkin:created` - New check-in created
- `finance:created` - New finance entry created
- `finance:updated` - Finance entry updated
- `schedule:created` - New schedule item created
- `schedule:updated` - Schedule item updated
- `bucket:created` - New bucket list item created
- `bucket:updated` - Bucket list item updated
- `typing:start` - Partner started typing
- `typing:stop` - Partner stopped typing
- `presence:updated` - Partner presence updated

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM. Key entities include:

- **Users** - User accounts with partner relationships
- **Tasks** - Task management with subtasks and history
- **Notes** - Collaborative notes with categories and tags
- **CheckIns** - Daily mood and activity tracking
- **Streaks** - Habit tracking and streak management
- **Achievements** - Gamification and rewards
- **BucketListItems** - Shared goals and dreams
- **ScheduleItems** - Calendar and event management
- **FinanceEntries** - Financial tracking and budgeting
- **Notifications** - System and partner notifications

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Rate Limiting** - Prevent abuse and DDoS attacks
- **Input Validation** - Comprehensive request validation
- **CORS Protection** - Configurable cross-origin resource sharing
- **Helmet Security** - Security headers and protection
- **SQL Injection Protection** - Prisma ORM prevents SQL injection
- **XSS Protection** - Input sanitization and validation

## 🚀 Deployment

### Environment Setup

1. **Production Environment Variables**
   ```env
   NODE_ENV=production
   DATABASE_URL="postgresql://user:pass@host:5432/db"
   JWT_SECRET="your-production-secret"
   REDIS_URL="redis://host:6379"
   CORS_ORIGIN="https://your-frontend-domain.com"
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### Database Migrations

```bash
# Create a new migration
npm run db:migrate

# Apply migrations
npm run db:push

# Reset database (development only)
npx prisma migrate reset
```

## 📊 Monitoring & Logging

- **Health Check** - `/health` endpoint for monitoring
- **Error Logging** - Comprehensive error logging
- **Request Logging** - Morgan for HTTP request logging
- **Performance Monitoring** - Built-in performance tracking

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## 📈 Performance Optimization

- **Database Indexing** - Optimized database queries
- **Redis Caching** - Session and data caching
- **Compression** - Gzip compression for responses
- **Connection Pooling** - Efficient database connections
- **Rate Limiting** - Prevent resource abuse

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs

---

**Built with ❤️ for couples and partners who want to stay connected and organized together.**
