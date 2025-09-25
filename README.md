# Chat App - Full Stack Real-time Chat Application

A modern, full-stack real-time chat application built with NestJS backend with PostgreSQL and React frontend featuring Material-UI components.

## 🚀 Features

- **Real-time messaging** with Socket.IO WebSockets
- **User authentication** with JWT tokens and secure password hashing
- **Room-based chat system** (create, join, leave, browse public rooms)
- **Online status indicators** and last seen timestamps
- **Typing indicators** with real-time updates
- **Message history** with pagination and persistence
- **User profiles** with avatar support and editable information
- **Responsive design** with Material-UI components
- **Protected routes** and authentication guards
- **Error boundaries** and comprehensive error handling
- **PostgreSQL database** with TypeORM and entity relationships

## 🛠️ Tech Stack

### Backend

- **NestJS** - Modern Node.js framework with decorators
- **TypeScript** - Type safety and better developer experience
- **PostgreSQL** - Robust relational database
- **TypeORM** - Object-Relational Mapping with decorators
- **Socket.IO** - Real-time bidirectional communication
- **JWT & Passport** - Secure authentication and authorization
- **bcryptjs** - Password hashing and verification
- **class-validator** - DTO validation with decorators

### Frontend

- **React 18** with TypeScript and hooks
- **Material-UI (MUI) v5** - Modern React UI components
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client with interceptors
- **React Router v6** - Modern routing solution
- **React Hook Form** - Form handling with validation
- **Yup** - Schema validation
- **date-fns** - Date formatting utilities

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd chat-app-nestjs-postgresql-reactjs
   ```

2. **Setup PostgreSQL Database**

   ```bash
   # Create database
   createdb chatapp

   # Or using psql
   psql -U postgres
   CREATE DATABASE chatapp;
   \q
   ```

3. **Setup Backend**

   ```bash
   cd backend

   # Install dependencies
   npm install

   # Configure environment
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret

   # Start development server
   npm run start:dev
   # Backend runs at http://localhost:3001
   ```

4. **Setup Frontend (New Terminal)**

   ```bash
   cd frontend

   # Install dependencies
   npm install

   # Configure environment (optional)
   cp .env.example .env.local
   # Edit if you need different API URLs

   # Start development server
   npm start
   # Frontend runs at http://localhost:3000
   ```

5. **Access Application**
   - Open http://localhost:3000 in your browser
   - Register a new account or login with existing credentials
   - Create or join rooms and start chatting in real-time!

## 🔧 Configuration

### Backend Environment Variables (.env)

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_database_password
DB_NAME=chatapp

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Application Configuration
NODE_ENV=development
PORT=3001
```

### Frontend Environment Variables (.env.local)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_SOCKET_URL=http://localhost:3001
```

## 📋 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user account
- `POST /api/auth/login` - User authentication and token generation

### User Management

- `GET /api/users` - Get all users (with online status)
- `GET /api/users/me` - Get current user profile
- `GET /api/users/:id` - Get specific user by ID
- `PATCH /api/users/:id` - Update user profile (username, avatar)

### Room Management

- `POST /api/rooms` - Create new room (group/public, private options)
- `GET /api/rooms` - Get all public rooms available to join
- `GET /api/rooms/my-rooms` - Get user's joined rooms with members
- `GET /api/rooms/:id` - Get specific room details
- `POST /api/rooms/:id/join` - Join an existing room
- `DELETE /api/rooms/:id/leave` - Leave a room
- `GET /api/rooms/:id/members` - Get room members list
- `PATCH /api/rooms/:id` - Update room details (admin only)
- `DELETE /api/rooms/:id` - Delete room (creator only)

### Chat & Messaging

- `GET /api/chat/rooms/:roomId/messages` - Get room message history
- `POST /api/chat/messages` - Send message (HTTP fallback)
- `PATCH /api/chat/messages/:id` - Edit own message
- `DELETE /api/chat/messages/:id` - Delete own message

### WebSocket Events

#### Client → Server Events

- `joinRoom({ roomId })` - Join room for real-time updates
- `leaveRoom({ roomId })` - Leave room
- `sendMessage({ content, roomId, type? })` - Send message in real-time
- `typing({ roomId, isTyping })` - Send typing status

#### Server → Client Events

- `connected` - Connection confirmation
- `newMessage(message)` - New message received
- `userOnline({ userId })` - User came online
- `userOffline({ userId })` - User went offline
- `userTyping({ userId, roomId, isTyping })` - Typing indicator
- `joinedRoom({ roomId })` - Room join confirmation
- `leftRoom({ roomId })` - Room leave confirmation
- `error({ message })` - Error notifications

## 🎨 Features Deep Dive

### Chat System

- **Real-time messaging** with Socket.IO WebSockets
- **Room-based organization** with different room types
- **Message persistence** with PostgreSQL storage
- **Typing indicators** with automatic timeout
- **Message editing and deletion** for message authors
- **File and image sharing** (entity support ready)

### User Experience

- **Responsive design** that works on mobile and desktop
- **User profiles** with customizable avatars and usernames
- **Online status** with real-time updates and last seen
- **Browse rooms dialog** to discover and join public rooms
- **Create room dialog** with privacy and type options
- **Protected routes** with automatic authentication handling

### Technical Features

- **JWT authentication** with automatic token refresh handling
- **Error boundaries** for graceful error handling
- **Form validation** with React Hook Form and Yup schemas
- **Optimistic updates** for better user experience
- **Connection management** with automatic reconnection
- **TypeScript** throughout for type safety

## 📁 Project Structure

```
chat-app-nestjs-postgresql-reactjs/
├── backend/                           # NestJS backend application
│   ├── src/
│   │   ├── auth/                     # Authentication module
│   │   │   ├── guards/               # JWT and local auth guards
│   │   │   ├── strategies/           # Passport strategies
│   │   │   ├── dto/                  # Data transfer objects
│   │   │   ├── auth.service.ts       # Authentication business logic
│   │   │   ├── auth.controller.ts    # Auth HTTP endpoints
│   │   │   └── auth.module.ts        # Auth module configuration
│   │   ├── users/                    # User management module
│   │   │   ├── entities/             # TypeORM entities
│   │   │   ├── dto/                  # Data transfer objects
│   │   │   ├── users.service.ts      # User business logic
│   │   │   ├── users.controller.ts   # User HTTP endpoints
│   │   │   └── users.module.ts       # Users module configuration
│   │   ├── rooms/                    # Room management module
│   │   │   ├── entities/             # Room and RoomMember entities
│   │   │   ├── dto/                  # Data transfer objects
│   │   │   ├── rooms.service.ts      # Room business logic
│   │   │   ├── rooms.controller.ts   # Room HTTP endpoints
│   │   │   └── rooms.module.ts       # Rooms module configuration
│   │   ├── chat/                     # Chat functionality module
│   │   │   ├── entities/             # Message entity
│   │   │   ├── dto/                  # Message DTOs
│   │   │   ├── chat.service.ts       # Chat business logic
│   │   │   ├── chat.controller.ts    # Chat HTTP endpoints
│   │   │   ├── chat.gateway.ts       # WebSocket gateway
│   │   │   └── chat.module.ts        # Chat module configuration
│   │   ├── app.module.ts             # Main application module
│   │   └── main.ts                   # Application entry point
│   ├── package.json                  # Backend dependencies
│   ├── tsconfig.json                 # TypeScript configuration
│   └── .env.example                  # Environment template
├── frontend/                          # React frontend application
│   ├── src/
│   │   ├── components/               # Reusable React components
│   │   │   ├── chat/                # Chat-specific components
│   │   │   │   ├── ChatArea.tsx     # Main chat interface
│   │   │   │   ├── MessageList.tsx  # Message display component
│   │   │   │   ├── RoomList.tsx     # Room sidebar component
│   │   │   │   ├── CreateRoomDialog.tsx # Room creation dialog
│   │   │   │   ├── BrowseRoomsDialog.tsx # Room browsing dialog
│   │   │   │   └── UserProfile.tsx  # User profile dialog
│   │   │   ├── ProtectedRoute.tsx   # Route protection wrapper
│   │   │   └── ErrorBoundary.tsx    # Error boundary component
│   │   ├── contexts/                # React Context providers
│   │   │   ├── AuthContext.tsx      # Authentication context
│   │   │   └── ChatContext.tsx      # Chat state management
│   │   ├── pages/                   # Application pages
│   │   │   ├── auth/                # Authentication pages
│   │   │   │   ├── LoginPage.tsx    # Login form page
│   │   │   │   └── RegisterPage.tsx # Registration form page
│   │   │   └── chat/                # Chat application pages
│   │   │       └── ChatPage.tsx     # Main chat application
│   │   ├── services/                # External service integrations
│   │   │   ├── api.ts               # HTTP API client
│   │   │   └── socket.ts            # WebSocket service
│   │   ├── types/                   # TypeScript type definitions
│   │   │   └── index.ts             # Shared type definitions
│   │   ├── App.tsx                  # Main application component
│   │   ├── index.tsx                # Application entry point
│   │   └── SimpleApp.tsx            # Simple test component
│   ├── public/                      # Static files
│   │   ├── index.html               # HTML template
│   │   └── manifest.json            # PWA manifest
│   ├── package.json                 # Frontend dependencies
│   ├── tsconfig.json                # TypeScript configuration
│   └── .env.example                 # Environment template
├── README.md                        # This documentation file
└── .gitignore                       # Git ignore rules
```

## 🧪 Testing & Development

### Backend Development Commands

```bash
cd backend

# Development with hot reload
npm run start:dev

# Production build
npm run build
npm run start:prod

# Run tests
npm run test
npm run test:watch
npm run test:cov

# Code quality
npm run lint
npm run format
```

### Frontend Development Commands

```bash
cd frontend

# Development server with hot reload
npm start

# Production build
npm run build

# Run tests
npm test
npm run test:coverage

# Type checking
npx tsc --noEmit
```

### Testing the Application

1. **Authentication Testing**

   ```bash
   # Register new user
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

   # Login
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"password123"}'
   ```

2. **Room Management Testing**

   ```bash
   # Create room (requires JWT token)
   curl -X POST http://localhost:3001/api/rooms \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Room","description":"Testing room","isPrivate":false}'
   ```

3. **Real-time Testing**
   - Open multiple browser tabs to http://localhost:3000
   - Login with different accounts in each tab
   - Join the same room from different accounts
   - Send messages and observe real-time updates
   - Test typing indicators by typing in message input

## 🚀 Production Deployment

### Environment Setup

```bash
# Backend production environment
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PASSWORD=secure-database-password
JWT_SECRET=very-secure-jwt-secret-key

# Frontend production build
npm run build  # Creates optimized build in frontend/build/
```

### Deployment Options

**Option 1: Separate Services**

- Deploy backend to services like Railway, Heroku, or DigitalOcean
- Deploy frontend to Netlify, Vercel, or similar static hosting
- Configure CORS and environment variables accordingly

**Option 2: Single Server**

- Build frontend and serve from backend
- Configure NestJS to serve static files from frontend build
- Deploy entire application as single service

## 🐛 Troubleshooting

### Common Issues & Solutions

**CORS Errors:**

- Check [`backend/src/main.ts`](backend/src/main.ts) CORS configuration
- Ensure `origin: true` for development or specific origins for production

**WebSocket Connection Issues:**

- Verify both frontend and backend are running on correct ports
- Check environment variables in `.env.local` and `.env`
- Ensure firewall allows WebSocket connections

**Database Connection Errors:**

- Verify PostgreSQL is running and accessible
- Check database credentials in backend `.env`
- Ensure database `chatapp` exists

**Authentication Issues:**

- Check JWT_SECRET is set and consistent
- Verify token is being sent in Authorization header
- Check token expiration (default 24 hours)

**Build Issues:**

- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`
- Check Node.js version compatibility

### Debug Mode

```bash
# Backend debug mode
npm run start:debug

# Frontend with detailed errors
REACT_APP_DEBUG=true npm start

# Database query logging
# Add to backend .env
TYPEORM_LOGGING=true
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow existing code style and conventions
4. Add tests for new functionality
5. Ensure all tests pass
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open Pull Request with detailed description

### Code Style Guidelines

- Use TypeScript for type safety
- Follow existing naming conventions
- Add JSDoc comments for complex functions
- Use meaningful commit messages
- Keep components small and focused

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- NestJS team for the excellent framework
- React and Material-UI teams for frontend tools
- Socket.IO for real-time communication
- TypeORM for database abstraction
