# EcoFinds - Sustainable Second-Hand Marketplace

EcoFinds is a modern web application that connects buyers and sellers in a sustainable second-hand marketplace. Built with Node.js, Express, MongoDB, and EJS, it provides a comprehensive platform for trading pre-owned goods while promoting environmental sustainability.

## 🎬 Demo Video

Check out the live demo of EcoFinds in action:


https://github.com/user-attachments/assets/45a5ae0c-6e4a-47bd-b966-257f3524e109







<video width="640" height="360" controls>
  <source src="https://github.com/user-attachments/assets/d1b734d4-6227-43ab-9565-357d18beff5e" type="video/webm">
 
</video>

This video showcases the core features of EcoFinds, such as user authentication, product management, shopping experience, and the user dashboard.

## Features

### 🔐 User Authentication
- Secure user registration and login
- Password hashing with bcrypt
- Session-based authentication
- User profile management

### 📝 Product Management
- Create, read, update, and delete product listings
- Image placeholder support (ready for file uploads)
- Product categorization and condition tracking
- Advanced search and filtering capabilities

### 🛒 Shopping Experience
- Shopping cart functionality
- Product browsing with filters
- Category-based navigation
- Keyword search

### 👤 User Dashboard
- Complete profile management
- Edit personal information and address
- View purchase history
- Manage product listings

### 📱 Responsive Design
- Mobile-first design approach
- Beautiful, modern UI with CSS Grid and Flexbox
- Smooth animations and transitions
- Accessible interface

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: EJS templating, CSS3, JavaScript
- **Authentication**: Express-session, bcryptjs
- **Styling**: Custom CSS with modern design patterns

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecofinds
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

4. **Start the application**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
ecofinds/
├── app.js                 # Main application file
├── package.json           # Dependencies and scripts
├── models/                # Database models
│   ├── User.js           # User model
│   └── Product.js        # Product model
├── routes/                # Express routes
│   ├── auth.js           # Authentication routes
│   ├── products.js       # Product-related routes
│   └── users.js          # User-related routes
├── views/                 # EJS templates
│   ├── layout.ejs        # Main layout template
│   ├── auth/             # Authentication templates
│   ├── products/         # Product-related templates
│   └── users/            # User-related templates
├── public/                # Static assets
│   ├── css/              # Stylesheets
│   ├── js/               # Client-side JavaScript
│   └── images/           # Image assets
└── README.md             # This file
```

## Key Features Implementation

### User Authentication
- Secure password hashing using bcryptjs
- Session management with express-session
- Protected routes with authentication middleware
- Flash messages for user feedback

### Product Listings
- CRUD operations for products
- Image placeholder system (ready for file upload integration)
- Advanced filtering by category, price, and keywords
- Product status tracking (available, sold, reserved)

### Shopping Cart
- Add/remove items from cart
- Quantity management
- Simple checkout process
- Purchase history tracking

### Responsive Design
- Mobile-first CSS with media queries
- Flexible grid layouts
- Touch-friendly interface
- Optimized for various screen sizes

## Database Schema

### User Model
- Basic information (username, email, password)
- Extended profile (name, phone, address)
- Shopping cart array
- Purchase history

### Product Model
- Product details (title, description, category, price)
- Condition and status tracking
- Seller reference
- View counter and timestamps

## Future Enhancements

1. **Image Upload**: Integrate multer for real image uploads
2. **Payment Integration**: Add Stripe or PayPal integration
3. **Messaging System**: Enable buyer-seller communication
4. **Reviews & Ratings**: Product and seller rating system
5. **Advanced Search**: Elasticsearch integration
6. **Email Notifications**: User engagement emails
7. **Admin Panel**: Administrative interface
8. **API Development**: RESTful API for mobile apps

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecofinds
SESSION_SECRET=your_session_secret_here
```


## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

- Font Awesome for icons
- MongoDB for the database
- Express.js community for excellent documentation
- All contributors who make sustainable consumption possible

---

**EcoFinds** - Empowering sustainable consumption through technology 🌱
