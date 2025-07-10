# 🍺 Red Robin Brewing - Craft Beer Review Platform

A full-stack web application for craft beer enthusiasts to discover, review, and manage their favorite beverage's.
Built with React and Node.js.

## ✨ Features

### 🍻 **Beer Management**

- Browse and search the beer database
- Add new beers to the collection
- Detailed beer information (name, brewery, style, ABV)
- **Sessionable beer classification** - mark beers perfect for long drinking sessions
- Filter by style, rating, and sessionable status

### ⭐ **Review System**

- Rate beers within a 5-star system
- Write detailed tasting notes
- View community reviews and ratings
- Track your personal beer history

### 👥 **Social Features**

- User profiles with review history
- Find and connect with fellow beer enthusiasts
- View other users' beer collections and reviews

### 🛡️ **Admin Dashboard**

- Complete user and beer management
- Toggle sessionable status for any beer
- Bulk operations for efficient management
- Import curated beer collections (50+ popular Australian & international beers)
- Review moderation tools

### 🎯 **Sessionable Beer Feature**

Special focus on "sessionable" beers - those perfect for drinking multiple over an extended period (drink responsibly):

- **User Control**: Mark beers as sessionable when adding
- **Admin Management**: Retroactively manage sessionable status
- **Visual Indicators**: Green badges on sessionable beers
- **Smart Filtering**: Filter to show only sessionable options
- **Real-time Updates**: Changes sync across all pages instantly

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/red-robin-brewing.git
   cd red-robin-brewing
   ```

2. **Backend Setup**

   ```bash
   cd server
   npm install
   ```

   **Create environment file from template:**

   ```bash
   cp .env.example .env
   ```

   **Update `server/.env` with your actual values:**

   ```env
   PORT=5000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-generated-jwt-secret
   NODE_ENV=development
   ```

   **Generate a secure JWT secret:**

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

   Copy the output and use it as your `JWT_SECRET`.

3. **Frontend Setup**

   ```bash
   cd ../client
   npm install
   ```

   **Create environment file from template:**

   ```bash
   cp .env.example .env
   ```

   **Update `client/.env`:**

   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **MongoDB Atlas Setup**

   If you don't have a MongoDB database:

   1. **Create free account** at [MongoDB Atlas](https://www.mongodb.com/atlas)
   2. **Create a cluster** (free tier available)
   3. **Create a database user** with read/write permissions
   4. **Get connection string** and update `MONGODB_URI` in `server/.env`
   5. **Add your IP address** to Network Access (or use 0.0.0.0/0 for development)

5. **Start the Application**

   **From project root:**

   ```bash
   npm run dev
   ```

   **Or start individually:**

   Backend (Terminal 1):

   ```bash
   cd server
   npm start
   ```

   Frontend (Terminal 2):

   ```bash
   cd client
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### 🔐 Environment Configuration

This project uses environment variables to keep sensitive information secure:

- **`.env`** files contain your actual secrets (never committed to Git)
- **`.env.example`** files show the required structure (safe to commit)
- **`.gitignore`** prevents `.env` files from being uploaded to GitHub

**Required Environment Variables:**

**Server (`server/.env`):**

- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secure random string for JWT authentication
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

**Client (`client/.env`):**

- `REACT_APP_API_URL` - Backend API URL

## 🏗️ Project Structure

```
red-robin-brewing/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main page components
│   │   ├── services/       # API service layer
│   │   └── App.js          # Main app component
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication & utilities
│   └── server.js           # Express server
│
└── README.md
```

## 🔧 Technology Stack

### Frontend

- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Fetch API** - HTTP requests

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📱 Usage Guide

### For Beer Enthusiasts

1. **Register/Login** to create your account
2. **Browse Beers** on the main page or dedicated beers section
3. **Filter by Sessionable** to find beers perfect for long sessions
4. **Add Reviews** with ratings and tasting notes
5. **Add New Beers** to expand the community database
6. **Connect with Friends** to see their beer preferences

### For Administrators

1. **Access Admin Dashboard** (admin role required)
2. **Manage Users** - view, edit, or remove users
3. **Manage Beers** - edit details, toggle sessionable status
4. **Sessionable Management**:
   - Click any beer's sessionable status to toggle
   - Use bulk operations for multiple beers
   - Import curated beer collections
5. **Review Moderation** - manage community reviews

## 🍺 Sessionable Beer System

The sessionable feature helps users identify beers perfect for extended drinking sessions:

### What Makes a Beer Sessionable?

- **Low to moderate ABV** (typically 3-5%)
- **Balanced flavor profile** (not overly hoppy or heavy)
- **Refreshing character** suitable for multiple servings

### How It Works

- **User Input**: Anyone can mark their added beers as sessionable
- **Admin Control**: Admins can retroactively manage all sessionable tags
- **Visual Indicators**: Green "SESSIONABLE" badges appear on qualifying beers
- **Smart Filtering**: Dedicated filter to show only sessionable options

## 🔐 Security & Best Practices

### Environment Variables

- **Never commit `.env` files** - they contain sensitive credentials
- **Always use `.env.example`** templates to show required structure
- **Generate secure JWT secrets** using cryptographically strong random values
- **Rotate credentials** if accidentally exposed

### JWT Token Management

- Tokens are automatically invalidated when JWT secret changes
- Clear browser storage (`localStorage`) if getting "invalid signature" errors
- Users need to log out/in after JWT secret rotation

### Production Deployment

When deploying to production platforms:

**Recommended Platforms:**

- **Vercel** (Frontend) + **Railway/Render** (Backend)
- **Heroku** (Full-stack)
- **Netlify** (Frontend) + **Railway** (Backend)

**Environment Variables Setup:**

1. **Don't use** your local `.env` files in production
2. **Set environment variables** through your hosting platform's dashboard:
   - Vercel: Project Settings → Environment Variables
   - Heroku: Settings → Config Vars
   - Railway: Variables tab
3. **Generate new JWT secret** for production (different from development)
4. **Use production MongoDB** cluster (not development database)

### Database Security

- **Enable authentication** on MongoDB
- **Use strong passwords** for database users
- **Restrict network access** to trusted IPs
- **Enable encryption** in transit and at rest
- **Regular backups** of your data

## 🛠️ API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Beers

- `GET /api/beers` - Get all beers
- `POST /api/beers` - Add new beer (auth required)
- `GET /api/beers/:id` - Get specific beer
- `PUT /api/beers/:id` - Update beer (auth required)
- `DELETE /api/beers/:id` - Delete beer (auth required)

### Reviews

- `GET /api/reviews/beer/:id` - Get reviews for beer
- `POST /api/reviews` - Add review (auth required)

### Admin (Admin Role Required)

- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - All users
- `GET /api/admin/beers` - All beers with management
- `PUT /api/admin/beers/:id` - Update any beer (including sessionable)
- `DELETE /api/admin/users/:id` - Delete users
- `POST /api/admin/populate` - Import curated beer collection

## 🎨 UI/UX Features

### Design

- **Responsive Design** - Works on mobile, tablet, and desktop
- **Modern Interface** - Clean, intuitive user experience
- **Tailwind Styling** - Consistent, professional appearance
- **Interactive Elements** - Hover effects, smooth transitions

### Beer Cards

- **Visual Hierarchy** - Clear beer information display
- **Sessionable Badges** - Prominent green indicators
- **Star Ratings** - Visual rating system
- **Quick Actions** - Easy navigation to details

### Filtering & Search

- **Multi-criteria Filtering** - Style, rating, sessionable status
- **Real-time Search** - Instant results as you type
- **Sort Options** - Name, rating, ABV, recent additions

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Clone your fork locally
3. Copy `.env.example` files to `.env` and configure with your values
4. Install dependencies in both `server` and `client` directories
5. Create a feature branch (`git checkout -b feature/amazing-feature`)

### Environment Setup for Contributors

```bash
# Server setup
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Client setup
cd ../client
cp .env.example .env
# Edit .env with your API URL (usually http://localhost:5000)
```

### Making Changes

1. Commit your changes (`git commit -m 'Add amazing feature'`)
2. Push to the branch (`git push origin feature/amazing-feature`)
3. Open a Pull Request

### Security Notes for Contributors

- **Never commit** actual `.env` files
- **Always update** `.env.example` if you add new environment variables
- **Generate your own** JWT secrets for development
- **Use your own** MongoDB database for testing


## 🙏 Acknowledgments

- Built for craft beer enthusiasts by enthusiasts
- Special focus on Australian craft beer scene
- Community-driven beer database
- Inspired by the social aspect of beer appreciation

## 🛠️ Troubleshooting

### Common Issues

**MongoDB Connection Failed:**

- Check your `MONGODB_URI` in `server/.env`
- Verify MongoDB Atlas network access settings
- Ensure database user credentials are correct

**"Invalid Signature" Authentication Errors:**

- Clear browser localStorage: F12 → Application → Local Storage → Clear
- Or run in console: `localStorage.clear(); location.reload();`
- Log out and log back in to get new JWT token

**Environment Variables Not Loading:**

- Ensure `.env` files are in correct directories (`server/.env`, `client/.env`)
- Check for typos in variable names
- Restart servers after changing environment variables

**Port Already in Use:**

- Change `PORT` in `server/.env` to different value (e.g., 5001)
- Kill existing processes: `lsof -ti:5000 | xargs kill`


## 🍻 Cheers!

Ready to discover your next favorite brew? Start exploring the world of craft beer with Red Robin Brewing!

