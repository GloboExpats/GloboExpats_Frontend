# GlobalExpat Marketplace Frontend

A modern, responsive marketplace platform built specifically for the global expat community. This Next.js 14 application provides a trusted platform where verified expat professionals can buy and sell quality items with confidence.

## 🌍 Project Overview

GlobalExpat Marketplace connects verified expat professionals worldwide through a secure, user-friendly marketplace. The platform emphasizes trust, verification, and community connection, making it easy for expats to find quality items from fellow professionals in their new locations.

### Key Features

- **Verified Seller Network**: All sellers undergo identity and organization verification
- **Global Expat Community**: Connect with professionals worldwide
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Notifications**: Live updates for messages, cart, and transactions
- **Multi-currency Support**: Support for major currencies including regional East African currencies
- **Advanced Search & Filtering**: Find exactly what you're looking for
- **Secure Transactions**: Built-in safety features and escrow protection
- **Admin Dashboard**: Comprehensive management tools for platform oversight

## 🏗️ Architecture Overview

### Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI with custom shadcn/ui components
- **State Management**: React Context + Custom Hooks
- **Authentication**: JWT-based with session persistence
- **API Integration**: RESTful API with built-in error handling
- **Performance**: Optimized with memoization, lazy loading, and code splitting

### Project Structure

```
ExpatFrontend-test/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Homepage
│   ├── (auth)/                  # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/             # User dashboard routes
│   │   ├── account/
│   │   ├── cart/
│   │   └── checkout/
│   ├── (marketplace)/           # Core marketplace routes
│   │   ├── browse/
│   │   ├── product/[id]/
│   │   └── category/[slug]/
│   ├── (selling)/               # Seller features
│   │   ├── sell/
│   │   └── seller/
│   └── admin/                   # Admin dashboard
├── components/                   # Reusable components
│   ├── ui/                      # Base UI components (buttons, cards, etc.)
│   ├── header/                  # Header sub-components
│   ├── account/                 # Account management components
│   └── [feature]/               # Feature-specific components
├── hooks/                       # Custom React hooks
│   ├── use-auth.ts             # Authentication logic
│   ├── use-cart.ts             # Shopping cart management
│   ├── use-notifications.ts    # Real-time notifications
│   └── [feature].ts            # Feature-specific hooks
├── providers/                   # React Context providers
│   ├── auth-provider.tsx       # Authentication state
│   └── cart-provider.tsx       # Shopping cart state
├── lib/                         # Utilities and configuration
│   ├── types.ts                # TypeScript type definitions
│   ├── api.ts                  # API client and endpoints
│   ├── utils.ts                # Helper functions
│   └── constants.ts            # Application constants
├── docs/                        # Documentation
└── public/                      # Static assets
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or pnpm for faster installs)
- **Git**: For version control

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ExpatFrontend-test
   ```

2. **Install dependencies**

   ```bash
   # Using npm
   npm install

   # Using pnpm (recommended for faster installs)
   pnpm install
   ```

3. **Environment setup**

   ```bash
   # Copy environment template
   cp .env.example .env.local

   # Edit environment variables
   nano .env.local
   ```

4. **Start development server**

   ```bash
   # Using npm
   npm run dev

   # Using pnpm
   pnpm dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
BACKEND_URL=http://localhost:8000

# CDN Configuration
NEXT_PUBLIC_CDN_URL=https://cdn.globalexpat.com

# Environment
NEXT_PUBLIC_ENVIRONMENT=development

# CORS Origins (production only)
ALLOWED_ORIGINS=https://globalexpat.com,https://www.globalexpat.com
```

## 🔄 Component Architecture

### Provider Hierarchy

The application uses a hierarchical provider structure for state management:

```typescript
// app/layout.tsx
<AuthProvider>           // User authentication and verification
  <CartProvider>         // Shopping cart management
    <ErrorBoundary>      // Error handling and recovery
      <Header />         // Navigation and user actions
      <main>{children}</main>
      <Footer />
      <Toaster />        // Toast notifications
    </ErrorBoundary>
  </CartProvider>
</AuthProvider>
```

### Key Components

#### Authentication System

```typescript
// Authentication flow
useAuth() → AuthProvider → localStorage → Backend API

Features:
- JWT token management
- Verification status tracking
- Organization email verification
- Admin role management
- Session persistence
```

#### Shopping Cart

```typescript
// Cart management flow
useCart() → CartProvider → localStorage → Backend sync

Features:
- Persistent cart storage
- Real-time item count
- Verification checks
- Multi-currency support
```

#### Verification System

The platform uses a two-tier verification system:

1. **Organization Email Verification** (Tier 1)
   - Allows buying and contacting sellers
   - Required for basic platform access
   - Verifies professional status

2. **Identity Verification** (Tier 2)
   - Allows selling items
   - Complete platform access
   - Document verification required

## 🛡️ Security Features

### User Verification

- **Identity Verification**: Government ID and document verification
- **Organization Email**: Professional email verification required
- **Seller Verification**: Enhanced verification for marketplace sellers
- **Admin Oversight**: Manual review process for sensitive transactions

### Data Protection

- **Type Safety**: Full TypeScript implementation
- **Input Validation**: Client and server-side validation
- **Error Boundaries**: Graceful error handling and recovery
- **Secure Storage**: Encrypted local storage for sensitive data
- **CORS Protection**: Configured for production security

## 📱 Responsive Design

### Breakpoint Strategy

```css
/* Mobile First Approach */
default: 320px - 767px    /* Mobile */
md: 768px - 1023px       /* Tablet */
lg: 1024px - 1279px      /* Desktop */
xl: 1280px+              /* Large Desktop */
```

### Component Responsiveness

- **Header**: Adaptive navigation with mobile hamburger menu
- **Product Grid**: Responsive grid (1→2→3→4 columns)
- **Forms**: Touch-friendly inputs with proper spacing
- **Modals**: Full-screen on mobile, centered on desktop

## 🎨 Design System

### Color Palette

```css
/* Brand Colors */
--brand-primary: #1e40af; /* Blue 700 */
--brand-secondary: #f59e0b; /* Amber 500 */

/* Neutral Palette */
--neutral-50: #fafafa; /* Light backgrounds */
--neutral-800: #262626; /* Dark text */
--neutral-900: #171717; /* Headings */

/* Status Colors */
--success: #16a34a; /* Green 600 */
--warning: #eab308; /* Yellow 500 */
--error: #dc2626; /* Red 600 */
--info: #2563eb; /* Blue 600 */
```

### Typography

```css
/* Font Families */
--font-inter: 'Inter', sans-serif; /* Body text */
--font-lexend: 'Lexend', sans-serif; /* Headings */

/* Font Scales */
text-xs: 0.75rem; /* 12px */
text-sm: 0.875rem; /* 14px */
text-base: 1rem; /* 16px */
text-lg: 1.125rem; /* 18px */
text-xl: 1.25rem; /* 20px */
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:turbo       # Start with Turbo (faster builds)

# Production
npm run build           # Build for production
npm run start           # Start production server
npm run build:analyze   # Analyze bundle size

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors
npm run format          # Format with Prettier
npm run type-check      # TypeScript type checking

# Testing
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:ui         # Run tests with UI

# Utilities
npm run clean           # Clean build artifacts
npm run optimize-images # Optimize image assets
```

### Code Quality Standards

- **ESLint**: Configured for Next.js and TypeScript
- **Prettier**: Code formatting with consistent style
- **TypeScript**: Strict mode enabled for type safety
- **Pre-commit Hooks**: Automated linting and type checking

### Performance Optimization

- **Code Splitting**: Route-based and component-based splitting
- **Image Optimization**: Next.js Image component with responsive sizing
- **Bundle Analysis**: Regular bundle size monitoring
- **Memoization**: Strategic use of React.memo and useMemo
- **Lazy Loading**: Dynamic imports for non-critical components

## 🧪 Testing

### Testing Strategy

```bash
# Unit Tests
components/ui/__tests__/     # UI component tests
hooks/__tests__/             # Custom hook tests
lib/__tests__/               # Utility function tests

# Integration Tests
__tests__/integration/       # Feature integration tests

# End-to-End Tests
cypress/e2e/                 # User flow tests
```

### Testing Tools

- **Vitest**: Fast unit testing framework
- **Testing Library**: Component testing utilities
- **Jest DOM**: DOM testing assertions
- **MSW**: API mocking for tests

## 🚀 Deployment

### Build Process

```bash
# Production build
npm run build:production

# Docker deployment
docker build -t expat-frontend .
docker run -p 3000:3000 expat-frontend
```

### Environment Configuration

- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Optimized build with CDN integration

### Performance Monitoring

- **Bundle Analyzer**: Monitor JavaScript bundle sizes
- **Core Web Vitals**: Track loading performance
- **Error Tracking**: Monitor and alert on errors
- **User Analytics**: Track user engagement and conversions

## 📖 API Integration

### Endpoint Structure

```typescript
// Authentication
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
POST /api/auth/logout         # User logout
GET  /api/auth/me            # Current user session

// Products
GET  /api/products           # List products
GET  /api/products/:id       # Get product details
POST /api/products           # Create product (sellers)
PUT  /api/products/:id       # Update product

// Cart & Orders
GET  /api/cart              # Get user cart
POST /api/cart/items        # Add cart item
DELETE /api/cart/items/:id  # Remove cart item
POST /api/orders            # Create order

// User Management
GET  /api/users/:id         # Get user profile
PUT  /api/users/:id         # Update user profile
POST /api/users/verify      # Verify user identity
```

### Error Handling

```typescript
// Standardized error responses
interface ApiError {
  message: string;
  code: string | number;
  details?: any;
}

// Error boundary integration
<ErrorBoundary fallback={ErrorFallback}>
  <YourComponent />
</ErrorBoundary>
```

## 🤝 Contributing

### Development Workflow

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Development**
   - Follow TypeScript strict mode
   - Add tests for new functionality
   - Update documentation as needed

3. **Code Quality**

   ```bash
   npm run lint:check
   npm run type-check
   npm run test
   ```

4. **Submit Pull Request**
   - Clear description of changes
   - Link to relevant issues
   - Include screenshots for UI changes

### Coding Standards

- **TypeScript**: Strict type checking enabled
- **Component Structure**: Functional components with hooks
- **State Management**: Context for global, useState for local
- **Error Handling**: Comprehensive error boundaries
- **Performance**: Memoization and optimization where beneficial
- **Accessibility**: WCAG 2.1 AA compliance

## 📚 Documentation

### Additional Resources

- **[Component Guide](./docs/COMPONENTS_GUIDE.md)**: Detailed component documentation
- **[React & TypeScript Guide](./docs/REACT_TYPESCRIPT_GUIDE.md)**: Architecture patterns
- **[Component Connections](./docs/COMPONENT_CONNECTIONS.md)**: Data flow documentation
- **[Performance Guide](./docs/PERFORMANCE_GUIDE.md)**: Optimization strategies
- **[API Requirements](./docs/api-requirements.md)**: Backend integration guide

### Architecture Decisions

- **Why Next.js 14**: Server-side rendering, App Router, and performance
- **Why TypeScript**: Type safety and developer experience
- **Why Tailwind CSS**: Utility-first approach and customization
- **Why React Context**: Simple global state without external dependencies
- **Why Component-based**: Reusability and maintainability

## 🐛 Troubleshooting

### Common Issues

#### Development Server Won't Start

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

#### Type Errors

```bash
# Regenerate TypeScript definitions
npm run type-check
```

#### Styling Issues

```bash
# Regenerate Tailwind CSS
npm run dev
```

#### Build Failures

```bash
# Clean and rebuild
npm run clean
npm run build
```

### Getting Help

- **Issues**: [GitHub Issues](link-to-issues)
- **Documentation**: Check `/docs` directory
- **Community**: [Discord/Slack Channel](link-to-community)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the global expat community**
