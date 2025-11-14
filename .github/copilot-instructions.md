# Copilot Instructions for AI Coding Agents

## Project Overview
This is a React Native (Expo) application using TypeScript, with modular UI components and screens organized for mobile development. The project leverages Tailwind CSS (via NativeWind), custom hooks, and Firebase integration.

## Architecture & Structure
- **Screens**: Located in `app/screens/` and `app/(tabs)/`. Each screen is a functional component, often using hooks and UI components from `components/`.
- **UI Components**: Modularized under `components/ui/` (e.g., `action-bar`, `balance-card`, `box`, etc.). Each subfolder contains an `index.tsx` entry point and sometimes platform-specific files (e.g., `index.web.tsx`).
- **Layout**: The main app layout is in `app/_layout.tsx` and `app/(tabs)/_layout.tsx`.
- **Assets**: Images and fonts are in `assets/`.
- **Constants & Data**: Shared constants in `constants/`, mock/sample data in `constants/data/`.
- **Firebase**: Integration code in `lib/firebase.tsx`.
- **Utilities**: Shared helpers in `utils/`.

## Developer Workflows
- **Start App**: Use `npx expo start` to launch the development server.
- **Build**: Use Expo CLI (`npx expo build`) for building binaries.
- **Test**: Tests are in `components/__tests__/`. Use `npm test` or `jest` for running tests.
- **Debug**: Debug using Expo Go or device simulators. Hot reload is enabled by default.

## Project-Specific Conventions
- **TypeScript**: All source files use TypeScript. Type definitions are in `*.d.ts` files.
- **Tailwind/NativeWind**: Styling is done via Tailwind classes in JSX, configured in `tailwind.config.js` and `nativewind-env.d.ts`.
- **Platform-Specific Code**: Use `.web.tsx` or `.ts` for platform-specific implementations (see `box/index.web.tsx`).
- **Component Organization**: UI components are grouped by function, each with its own folder and entry file.
- **Navigation**: Tab navigation is handled in `app/(tabs)/_layout.tsx` and related files.

## Integration Points
- **Firebase**: All backend interactions are through `lib/firebase.tsx`.
- **External Libraries**: Key dependencies include Expo, React Navigation, NativeWind, and Firebase.

## Patterns & Examples
- **Custom Hooks**: See `components/useColorScheme.ts` for theming logic.
- **Reusable UI**: Example: `components/ui/balance-card/index.tsx` for card-style UI.
- **Data Flow**: Screens import data from `constants/data/` and pass props to UI components.

## Key Files & Directories
- `app/` — Screens and layouts
- `components/ui/` — Modular UI components
- `constants/` — Shared constants and data
- `lib/firebase.tsx` — Firebase integration
- `utils/` — Utility functions

---
_If any section is unclear or missing important project-specific details, please provide feedback to improve these instructions._
