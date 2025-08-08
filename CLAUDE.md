# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a complete Angular 20 investment management application called "InvestPro" with authentication, portfolio tracking, dividend management, and modern dark/light theme support. Built with standalone components, signals, and TailwindCSS with DaisyUI.

## Development Commands

### Core Development
- `npm start` or `ng serve` - Start development server (http://localhost:4200)
- `npm run build` or `ng build` - Build for production (outputs to `dist/`)
- `npm run watch` or `ng build --watch --configuration development` - Build in watch mode for development

### Testing
- `npm test` or `ng test` - Run unit tests with Karma
- No e2e testing framework is currently configured

### Code Generation
- `ng generate component component-name` - Generate new component (use standalone: true)
- `ng generate service service-name` - Generate new service
- `ng generate --help` - See all available schematics

## Application Architecture

### Authentication System
- **Mock Authentication**: Uses `AuthService` with predefined demo users
- **Demo Credentials**: 
  - Admin: `admin@investpro.com` / `admin123`  
  - User: `user@investpro.com` / `user123`
- **Route Guards**: `authGuard` protects authenticated routes, `loginGuard` prevents access to login when authenticated
- **Persistent Sessions**: Uses localStorage for session management
- **Conditional Layout**: Login page shows without sidebar/navbar, authenticated pages show full layout

### Data Models & Services
- **Investment Model**: Core domain models in `src/app/models/investment.model.ts` with enums for `AssetType` and `DividendType`
- **Auth Model**: Authentication types in `src/app/models/auth.model.ts` 
- **Services Architecture**:
  - `InvestmentService`: CRUD operations with localStorage persistence using signals
  - `DividendService`: Dividend tracking and yield calculations
  - `PortfolioService`: Aggregated portfolio analytics and performance metrics
  - `AuthService`: Mock authentication with login/logout functionality
  - `ThemeService`: Dark/light theme management with system preference detection

### Component Structure
- **Layout Component**: Conditional rendering based on route (login vs authenticated)
- **Login Component**: Full-screen auth form with demo credential buttons
- **Dashboard Component**: Portfolio overview with metrics cards and performance data
- **Investment List Component**: CRUD interface with modal forms, filtering, and sorting
- **Dividend Tracking Component**: Dividend management with yearly filtering and type categorization
- **Investment Form Component**: Modal form for adding/editing investments

### Routing & Navigation  
- **Protected Routes**: All main routes (`/dashboard`, `/investments`, `/dividends`) require authentication
- **Lazy Loading**: All components are lazy-loaded for performance
- **Default Redirects**: Root redirects to dashboard, unknown routes redirect to login

### Styling & Theming
- **TailwindCSS v4**: Modern utility framework with custom dark mode overrides in `src/styles.css`
- **DaisyUI**: Component library for consistent UI patterns
- **Theme System**: Dynamic dark/light mode with class-based switching and localStorage persistence
- **Custom CSS**: Dark mode overrides use `!important` to handle TailwindCSS v4 compatibility
- **Responsive Design**: Mobile-first approach with collapsible sidebar

### State Management
- **Angular Signals**: Reactive state management throughout the application
- **Computed Values**: Derived state for portfolio calculations and filtered data
- **Local Storage**: Data persistence for investments, dividends, auth, and theme preferences
- **Signal-based Services**: All services use signals for reactive data flow

### Key Patterns
- **Standalone Components**: No NgModules, everything uses standalone architecture
- **Reactive Forms**: Form validation with `ReactiveFormsModule`
- **Service Injection**: Modern `inject()` function usage
- **Modal Patterns**: In-place modal forms instead of separate route navigation
- **Defensive Coding**: Comprehensive error handling and type safety

## Development Guidelines

### Adding New Features
- Use signals for reactive state management
- Follow the existing service pattern with localStorage persistence  
- Implement both light and dark theme styles
- Add proper TypeScript interfaces in the models folder
- Use standalone components with proper imports

### Styling Conventions
- Use TailwindCSS classes with dark: prefixes for theme support
- Add custom CSS overrides in `src/styles.css` for complex dark mode scenarios
- Maintain responsive design patterns (mobile-first)
- Use gradient buttons and modern card designs to match existing UI

### Data Persistence
- All data is stored in localStorage with appropriate keys
- Services handle serialization/deserialization automatically
- Auth state persists across browser sessions
- Theme preference persists and respects system settings initially