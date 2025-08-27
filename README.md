# Rento

> A peer-to-peer rental marketplace built with React Native and Expo

[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~53.0.19-000020?style=flat&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-~5.8.3-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-~2.50.0-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)

Rento is a comprehensive mobile application that facilitates peer-to-peer item rentals, connecting people who want to rent out their belongings with those seeking temporary access to items. Whether you're a homeowner with tools sitting idle or a student needing equipment for a project, Rento bridges the gap in the sharing economy.

## ✨ Features

### 🔐 Authentication & Profiles
- Secure user registration and authentication via Supabase Auth
- Comprehensive profile management with avatar support
- Dual-mode functionality (renter and lender roles)
- Device-specific push notification registration

### 📦 Listing Management
- Create detailed rental listings with rich metadata
- Multi-image upload with cloud storage integration
- Flexible pricing and availability scheduling
- Category-based organization and filtering
- Location-based discovery with geospatial data
- Multiple pickup methods (owner delivery, renter pickup, courier)

### 🤝 Booking System
- Intuitive booking request workflow
- Real-time status tracking (Pending → Confirmed → Completed)
- Integrated messaging for booking coordination
- Comprehensive booking history and management

### 💬 Communication
- Real-time one-to-one messaging between users
- Conversation threading with read receipts
- Unread message badges and notifications
- Message history persistence

### ❤️ Wishlist & Discovery
- Save items to personal wishlist
- Browse available listings with smart filtering
- Location-based item discovery
- Category-based exploration

### 🔔 Notifications
- In-app notification system for key events
- Push notification support for mobile engagement
- Customizable notification preferences
- Real-time updates for booking status changes

## 🏗️ Architecture

### Frontend Stack
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build system
- **Expo Router**: File-based navigation with TypeScript support
- **TypeScript**: Static type checking and enhanced development experience
- **Lucide React Native**: Consistent iconography

### Backend & Infrastructure
- **Supabase**: Backend-as-a-Service providing:
  - PostgreSQL database with real-time subscriptions
  - Authentication and user management
  - File storage for images and media
  - Row-level security (RLS) policies
  - Optional GraphQL endpoint

### Data Layer
- **Apollo Client**: GraphQL client with caching (configured)
- **Supabase Client**: Direct database interactions and real-time subscriptions
- Hybrid approach allowing flexibility between REST and GraphQL

## 📱 Supported Platforms

- **iOS**: Native iOS app with tablet support
- **Android**: Native Android app with adaptive icons
- **Web**: Progressive Web App (PWA) with Metro bundler

## 🚀 Quick Start

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/salarkhannn/rento.git
   cd rento
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your preferred platform**
   ```bash
   # iOS Simulator
   npm run ios
   
   # Android Emulator
   npm run android
   
   # Web browser
   npm run web
   ```

### Database Setup

1. Create a new project in [Supabase](https://supabase.com)
2. Run the database migrations using the provided schema files
3. Configure Row Level Security (RLS) policies for data protection
4. Set up the storage bucket named `rental-images` for file uploads

## 🗂️ Project Structure

```
rento/
├── app/                          # Expo Router pages and navigation
│   ├── (tabs)/                   # Tab-based navigation screens
│   ├── auth/                     # Authentication flow
│   ├── conversation/             # Messaging interface
│   ├── edit-listing/             # Listing management
│   ├── guards/                   # Access control components
│   └── utils/                    # Utility functions
├── assets/                       # Static assets (images, fonts, icons)
├── components/                   # Reusable UI components
├── constants/                    # App-wide constants and configurations
├── lib/                          # Core business logic and integrations
│   ├── apollo.ts                 # GraphQL client configuration
│   ├── supabase.ts              # Supabase client and type definitions
│   ├── queries.ts               # Database queries and mutations
│   └── notifications.ts         # Push notification handling
├── ui/                          # Design system components
│   ├── components/              # UI primitives
│   ├── theme.ts                 # Theme configuration
│   └── typography.ts            # Typography system
└── supabase/                    # Supabase configuration files
```

## 🧪 Testing

The project uses Jest and React Test Renderer for unit and integration testing:

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:ci
```

Test files are located in `components/__tests__/` directory and follow the naming convention `*.test.js`.

## 📦 Build & Deployment

### Development Builds

```bash
# Create development build for iOS
eas build --profile development --platform ios

# Create development build for Android
eas build --profile development --platform android
```

### Production Builds

```bash
# Build for app stores
eas build --profile production --platform all
```

### Web Deployment

```bash
# Build for web deployment
npm run web:build

# Preview web build locally
npm run web:serve
```

## 🔧 Configuration

### Environment Variables

The application requires the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |

### Platform-Specific Settings

#### iOS
- Supports tablets and phones
- Background app refresh for notifications
- User tracking description for privacy compliance

#### Android
- Adaptive app icon support
- Notification permissions
- Keyboard handling optimizations

## 🤝 Contributing

We welcome contributions to Rento! Please follow these guidelines:

1. **Fork** the repository and create your feature branch
2. **Write** comprehensive tests for new functionality
3. **Follow** the existing code style and TypeScript conventions
4. **Update** documentation for any API changes
5. **Submit** a pull request with a clear description of changes

### Development Workflow

```bash
# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes and test thoroughly
npm test

# Commit with conventional commit messages
git commit -m "feat: add amazing feature"

# Push to your fork and submit a pull request
git push origin feature/amazing-feature
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team** for the excellent development platform
- **Supabase** for providing comprehensive backend services
- **React Native Community** for continuous innovation
- **Contributors** who help improve this project

## 📞 Support

For support, please:
- 📧 Email: [support@rento.app](mailto:support@rento.app)
- 🐛 Report issues on [GitHub Issues](https://github.com/salarkhannn/rento/issues)
- 💬 Join our community discussions

---

<div align="center">
  <p>Built with ❤️ by the Rento team</p>
  <p>
    <a href="https://github.com/salarkhannn/rento">⭐ Star us on GitHub</a> •
    <a href="#-contributing">🤝 Contribute</a> •
    <a href="#-support">📞 Get Support</a>
  </p>
</div>
