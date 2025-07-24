# 🍺🍷🥃 Red Robin Rating - Alcoholic Beverage Review Platform

A full-stack web application for craft beverage enthusiasts to discover, review, and manage their favorite **beers, wines, and spirits**. Built with React and Node.js.

## ✨ Features

### 🍻 **Beer + Cider Management**

- Browse and search the beer and cider database
- Add new beers and ciders to the collection
- Detailed beverage information (name, brewery/producer, style, ABV)
- **Sessionable beer classification** - mark beers perfect for long drinking sessions
- Filter by type (beer/cider), style, rating, and sessionable status
- Support for traditional ciders, fruit ciders, hopped ciders, and more

### 🍷 **Wine Management**

- Comprehensive wine database with detailed information
- Wine-specific data: vintage, region, winery, sweetness levels
- Extensive wine style support (red, white, sparkling, fortified, etc.)
- Sweetness classification (Bone Dry to Very Sweet)
- Advanced filtering by wine type, vintage, and region

### 🥃 **Spirits Management**

- Complete spirits collection with distillery information
- Spirits-specific data: age, category, region, distillery
- Support for whiskey, rum, vodka, gin, tequila, brandy, and liqueurs
- Detailed categorisation (Single Malt, Bourbon, VSOP, etc.)
- Age and region-based filtering

### ⭐ **Universal Review System**

- Rate beverages within a 5-star system across all categories
- Write detailed tasting notes for beers, wines, and spirits
- View community reviews and ratings
- Track your personal beverage history across all types

### 👥 **Social Features**

- User profiles with comprehensive review history
- Find and connect with fellow beverage enthusiasts
- View other users' collections across beers, wines, and spirits

### 🛡️ **Admin Dashboard**

- Complete user and beverage management across all categories
- Toggle sessionable status for beers
- Bulk operations for efficient management
- Import curated beverage collections (80+ popular beverages)
- Review moderation tools for all beverage types

### 🎯 **Sessionable Beer Feature**

Special focus on "sessionable" beers - those perfect for drinking multiple over an extended period (drink responsibly):

- **User Control**: Mark beers as sessionable when adding
- **Admin Management**: Retroactively manage sessionable status
- **Visual Indicators**: Badges on sessionable beers
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
   git clone https://github.com/yourusername/red-robin-rating.git
   cd red-robin-rating
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
red-robin-rating/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── BeerCard.js     # Beer/cider display
│   │   │   ├── WineCard.js     # Wine display
│   │   │   ├── SpiritCard.js   # Spirits display
│   │   │   └── StarRating.js   # Universal rating component
│   │   ├── pages/          # Main page components
│   │   │   ├── BeersPage.js    # Beer + cider browsing
│   │   │   ├── WinesPage.js    # Wine browsing
│   │   │   ├── SpiritsPage.js  # Spirits browsing
│   │   │   ├── BeerDetailPage.js
│   │   │   ├── WineDetailPage.js
│   │   │   ├── SpiritDetailPage.js
│   │   │   └── AddBeveragePage.js # Multi-category add form
│   │   ├── services/       # API service layer
│   │   └── App.js          # Main app component
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── models/             # MongoDB schemas
│   │   ├── Beer.js         # Beer + cider model
│   │   ├── Wine.js         # Wine model
│   │   ├── Spirit.js       # Spirits model
│   │   ├── Review.js       # Universal review model
│   │   └── User.js         # User model
│   ├── routes/             # API endpoints
│   │   ├── beers.js        # Beer + cider routes
│   │   ├── wines.js        # Wine routes
│   │   ├── spirits.js      # Spirits routes
│   │   └── reviews.js      # Review routes
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

### For Beverage Enthusiasts

1. **Register/Login** to create your account
2. **Browse Beverages** across beers, wines, and spirits
3. **Filter by Category**:
   - **Beers + Ciders**: Filter by sessionable status, style, brewery
   - **Wines**: Filter by sweetness, vintage, region, winery
   - **Spirits**: Filter by age, category, distillery, region
4. **Add Reviews** with ratings and detailed tasting notes
5. **Add New Beverages** to expand the community database
6. **Connect with Friends** to see their beverage preferences

### For Administrators

1. **Access Admin Dashboard** (admin role required)
2. **Manage Users** - view, edit, or remove users
3. **Manage All Beverages** - edit details across all categories
4. **Category-Specific Management**:
   - **Beers**: Toggle sessionable status, manage brewery info
   - **Wines**: Update vintage, sweetness, region data
   - **Spirits**: Manage age statements, categories, distilleries
5. **Review Moderation** - manage community reviews across all categories

## 🍺🍷🥃 Beverage Categories

### Beer + Cider System

Support for both traditional beers and ciders:

**Beer Styles**: IPA, Stout, Wheat, Lager, Ale, Pilsner, Sour, Porter, and more

**Cider Styles**: Traditional Cider, Fruit Cider, Hopped Cider, Sour Cider, Perry, Ice Cider, Cyser

**Sessionable Feature**: Mark beers perfect for extended drinking sessions

### Wine System

Comprehensive wine classification:

**Red Wines**: Shiraz, Cabernet Sauvignon, Pinot Noir, Merlot, and many blends

**White Wines**: Chardonnay, Sauvignon Blanc, Riesling, Pinot Grigio, and more

**Sparkling & Other**: Champagne, Prosecco, Rosé, Fortified, Port, Dessert Wines

**Sweetness Levels**: Bone Dry, Dry, Off-Dry, Medium-Dry, Medium-Sweet, Sweet, Very Sweet

### Spirits System

Complete spirits coverage:

**Whiskey/Whisky**: Single Malt, Blended Scotch, Irish Whiskey, Bourbon, Tennessee Whiskey

**Rum**: White, Dark, Spiced, Aged varieties

**Gin**: London Dry, Plymouth, Old Tom styles

**Other Categories**: Vodka, Tequila, Brandy, Cognac, Liqueurs

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

## 🛠️ API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Beers + Ciders

- `GET /api/beers` - Get all beers and ciders
- `POST /api/beers` - Add new beer/cider (auth required)
- `GET /api/beers/:id` - Get specific beer/cider
- `PUT /api/beers/:id` - Update beer/cider (auth required)
- `DELETE /api/beers/:id` - Delete beer/cider (auth required)

### Wines

- `GET /api/wines` - Get all wines
- `POST /api/wines` - Add new wine (auth required)
- `GET /api/wines/:id` - Get specific wine
- `PUT /api/wines/:id` - Update wine (auth required)
- `DELETE /api/wines/:id` - Delete wine (auth required)

### Spirits

- `GET /api/spirits` - Get all spirits
- `POST /api/spirits` - Add new spirit (auth required)
- `GET /api/spirits/:id` - Get specific spirit
- `PUT /api/spirits/:id` - Update spirit (auth required)
- `DELETE /api/spirits/:id` - Delete spirit (auth required)

### Reviews (Universal)

- `GET /api/reviews/beer/:id` - Get reviews for beer/cider
- `GET /api/reviews/wine/:id` - Get reviews for wine
- `GET /api/reviews/spirit/:id` - Get reviews for spirit
- `POST /api/reviews` - Add review (auth required)

### Admin (Admin Role Required)

- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - All users
- `GET /api/admin/beers` - All beers with management
- `GET /api/admin/wines` - All wines with management
- `GET /api/admin/spirits` - All spirits with management
- `PUT /api/admin/beverages/:category/:id` - Update any beverage
- `DELETE /api/admin/users/:id` - Delete users
- `POST /api/admin/populate` - Import curated beverage collections

## 🎨 UI/UX Features

### Design

- **Responsive Design** - Works on mobile, tablet, and desktop
- **Modern Interface** - Clean, intuitive user experience
- **Category-Specific Styling** - Each beverage type has distinct theming:
  - **Beers**: Red accent colors
  - **Wines**: Purple accent colors
  - **Spirits**: Amber accent colors
- **Interactive Elements** - Hover effects, smooth transitions

### Beverage Cards

- **Category-Specific Cards** - Tailored displays for each beverage type
- **Visual Hierarchy** - Clear information display
- **Sessionable Badges** - Green indicators for beers
- **Star Ratings** - Universal rating system
- **Quick Actions** - Easy navigation to details

### Advanced Filtering & Search

**Beer + Cider Page**:

- Filter by beer vs cider type
- Sessionable filter
- Style and brewery filtering
- ABV range filtering

**Wine Page**:

- Sweetness level filtering
- Vintage year filtering
- Region and winery filtering
- Wine style categorisation

**Spirits Page**:

- Age statement filtering
- Category filtering (Single Malt, Bourbon, etc.)
- Distillery and region filtering
- Spirit type classification

### Universal Features

- **Multi-criteria Filtering** - Combine multiple filters
- **Real-time Search** - Instant results as you type
- **Sort Options** - Name, rating, ABV, recent additions
- **Responsive Grid** - Adapts to screen size

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

- Built for craft beverage enthusiasts by enthusiasts
- Special focus on Australian craft beverage scene
- Community-driven database across all beverage categories
- Inspired by the social aspect of beverage appreciation

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

**Beverage Category Issues:**

- Ensure proper enum values in your database models
- Check that wine/spirit styles match the defined enums
- Verify API endpoints are correctly configured for all beverage types

## 🍻🍷🥃 Cheers!

Ready to discover your next favorite beverage? Start exploring the world of craft beers, fine wines, and premium spirits with Red Robin Rating!

_From hoppy IPAs to aged whiskeys, from crisp whites to robust reds - your perfect beverage is waiting to be discovered and reviewed._
