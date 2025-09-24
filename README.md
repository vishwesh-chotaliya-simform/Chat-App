# Chat App - Full Stack Real-time Chat Application

A modern, full-stack real-time chat application built with NestJS backend with Postgresql and React frontend.

## 🚀 Features

- **Real-time messaging** with Socket.IO
- **User authentication** with JWT tokens
- **Room-based chat** (create, join, leave rooms)
- **Online status** indicators
- **Typing indicators**
- **Message history**
- **Responsive design** with Material-UI
- **PostgreSQL database** with TypeORM

## 🛠️ Tech Stack

### Backend

- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **TypeORM** - ORM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend

- **React** with TypeScript
- **Material-UI** - UI components
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Navigation

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd chat-app-nest-poc
   ```

2. **Setup Backend**

   ```bash
   cd backend

   # Install dependencies
   npm install

   # Configure environment
   cp .env.example .env
   # Edit .env with your database credentials

   # Create PostgreSQL database
   createdb chatapp

   # Start backend server
   npm run start:dev
   # Backend runs at http://localhost:3001
   ```

3. **Setup Frontend (New Terminal)**

   ```bash
   cd frontend

   # Install dependencies
   npm install

   # Configure environment (optional)
   cp .env.example .env.local
   # Edit if you need different API URLs

   # Start frontend server
   npm start
   # Frontend runs at http://localhost:3000
   ```

4. **Access Application**
   - Open http://localhost:3000 in your browser
   - Register a new account or login
   - Start chatting in real-time!

## 🔧 Development

### Backend Development

```bash
cd backend

# Available scripts
npm run start:dev     # Development with hot reload
npm run start         # Production mode
npm run build         # Build for production
npm run test          # Run tests
npm run lint          # Lint code
```

### Frontend Development

```bash
cd frontend

# Available scripts
npm start             # Development server
npm run build         # Build for production
npm test              # Run tests
npm run eject         # Eject from Create React App
```

### Environment Configuration

#### Backend Environment (.env)

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=chatapp

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Application Configuration
NODE_ENV=development
PORT=3001
```

#### Frontend Environment (.env.local)

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_SOCKET_URL=http://localhost:3001
```

## 📋 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### User Endpoints

- `GET /api/users` - Get all users
- `GET /api/users/me` - Get current user profile
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user

### Room Endpoints

- `POST /api/rooms` - Create new room
- `GET /api/rooms` - Get all public rooms
- `GET /api/rooms/my-rooms` - Get user's rooms
- `POST /api/rooms/:id/join` - Join room
- `DELETE /api/rooms/:id/leave` - Leave room
- `GET /api/rooms/:id/members` - Get room members

### Chat Endpoints

- `GET /api/chat/rooms/:roomId/messages` - Get room messages
- `POST /api/chat/messages` - Send message (HTTP)
- `PATCH /api/chat/messages/:id` - Edit message
- `DELETE /api/chat/messages/:id` - Delete message

### WebSocket Events

- `joinRoom` - Join a room for real-time updates
- `sendMessage` - Send a message in real-time
- `typing` - Send typing indicator
- `newMessage` - Receive new message
- `userOnline`/`userOffline` - User status updates
- `userTyping` - Typing indicator updates

## 🚀 Production Deployment

### Option 1: Separate Deployment

Deploy backend and frontend separately to different servers.

### Option 2: Combined Deployment

```bash
# Build frontend
cd frontend
npm run build

# Copy build to backend static folder (optional)
cp -r build/* ../backend/public/

# Build and start backend
cd ../backend
npm run build
NODE_ENV=production npm run start:prod
```

## 📁 Project Structure

```
chat-app-nest-poc/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── rooms/          # Room management
│   │   ├── chat/           # Chat functionality
│   │   └── main.ts         # Application entry point
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment template
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Application pages
│   │   └── services/       # API and socket services
│   ├── package.json        # Frontend dependencies
│   └── .env.example        # Environment template
├── README.md               # This file
└── .gitignore              # Git ignore rules
```

## 🧪 Testing

### Test Backend APIs

```bash
# Test authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Test room creation (requires JWT token)
curl -X POST http://localhost:3001/api/rooms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Room","description":"Testing"}'
```

### Test Real-time Messaging

1. Open multiple browser tabs to http://localhost:3000
2. Login with different accounts
3. Join the same room
4. Send messages and see real-time updates

## 🐛 Troubleshooting

### Common Issues

**CORS Errors:**

- Backend [`main.ts`](backend/src/main.ts) has `origin: true` which allows all origins

**Socket Connection Issues:**

- Check that both frontend and backend are running
- Verify environment variables in `.env.local`

**Database Connection:**

- Ensure PostgreSQL is running
- Check database credentials in backend `.env`

**Build Errors:**

- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.
