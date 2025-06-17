# QRMeal

QRMeal is a modern web application that leverages QR code technology to enhance the dining experience. This full-stack application is built with Next.js for the frontend and Node.js/Express for the backend, providing a seamless and interactive platform for restaurants and customers.

## 🚀 Features

- QR code generation and scanning
- Real-time updates using Socket.IO
- Modern UI with Tailwind CSS and Radix UI components
- Responsive design for all devices
- Secure authentication system
- Image upload and processing capabilities
- Interactive data visualization with Recharts

## 🛠️ Tech Stack

### Frontend

- Next.js 15.2.4
- React 19.1.0
- TypeScript
- Tailwind CSS
- Radix UI Components
- React Query
- Socket.IO Client
- React Hook Form with Zod validation

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Socket.IO
- JWT Authentication
- Cloudinary for image storage
- Sharp for image processing

## 📦 Prerequisites

- Node.js (Latest LTS version recommended)
- MongoDB
- npm or yarn package manager

## 🚀 Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/QRMeal.git
cd QRMeal
```

2. Install dependencies for both client and server:

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:
   - Create `.env` files in both client and server directories
   - Configure necessary environment variables (see Environment Variables section)

### Running the Application

1. Start the development server:

```bash
# Start the backend server
cd server
npm run dev

# Start the frontend development server
cd client
npm run dev
```

2. Open your browser and navigate to `http://localhost:3000`

## 🔧 Environment Variables

### Client (.env)

```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Server (.env)

```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📝 Available Scripts

### Client

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Server

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript files
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run prettier` - Check code formatting
- `npm run prettier:fix` - Fix code formatting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- PhuscBui

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the amazing tools and libraries
