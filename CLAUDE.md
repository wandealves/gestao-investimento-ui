# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 20 investment management UI application with TailwindCSS and DaisyUI for styling. The project uses standalone components architecture and follows modern Angular patterns with signals.

## Development Commands

### Core Development
- `npm start` or `ng serve` - Start development server (http://localhost:4200)
- `npm run build` or `ng build` - Build for production (outputs to `dist/`)
- `npm run watch` or `ng build --watch --configuration development` - Build in watch mode for development

### Testing
- `npm test` or `ng test` - Run unit tests with Karma
- No e2e testing framework is currently configured

### Code Generation
- `ng generate component component-name` - Generate new component
- `ng generate --help` - See all available schematics

## Architecture

### Application Structure
- **Standalone Components**: Uses Angular's standalone component architecture (no NgModules)
- **Bootstrap**: Application bootstrapped via `bootstrapApplication()` in `src/main.ts`
- **Configuration**: App config defined in `src/app/app.config.ts` with router and zone change detection
- **Routing**: Empty routes array in `src/app/app.routes.ts` - ready for route definitions
- **Main Component**: `App` component in `src/app/app.ts` uses signals for reactive state

### Styling
- **TailwindCSS**: Primary CSS framework imported in `src/styles.css`
- **DaisyUI**: Component library plugin for TailwindCSS
- **Build Integration**: Styles processed through Angular's build system

### TypeScript Configuration
- **Strict Mode**: Enabled with comprehensive strict checks
- **Modern Target**: ES2022 with module preservation
- **Angular Compiler**: Strict templates and injection parameters enabled

### File Organization
- `src/app/` - Main application code
- `public/` - Static assets (favicon, etc.)
- `src/styles.css` - Global styles with TailwindCSS imports

## Development Notes

- Uses Angular 20's latest features including signals and standalone components
- Project configured with Prettier for HTML files with Angular parser
- Build budgets set to 500kB warning / 1MB error for initial bundle
- Component styles limited to 4kB warning / 8kB error