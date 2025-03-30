# Police 102 Mobile App

A React Native mobile application that connects citizens with police services, enables emergency reporting, and provides safety resources.

## Features

- **Emergency Reporting**: Quick access to emergency services with location tracking
- **Map View**: Visualize nearby police stations and reported incidents
- **Silent Reports**: Submit discreet reports in unsafe situations
- **Missing Persons**: Report and view information about missing persons
- **Scam Alerts**: Access information about common scams and report suspicious activity
- **Chat System**: Direct communication with police officers
- **User Profiles**: Manage personal information and report history
- **Notifications**: Receive updates on reports and safety alerts

## Tech Stack

- React Native with Expo framework
- TypeScript for type safety
- Expo Router for navigation
- React Native Maps for location features
- Expo Location for device positioning
- Axios for API requests
- Expo Notifications for push notifications

## Prerequisites

- Node.js (LTS version recommended)
- npm or yarn package manager
- Expo CLI
- iOS Simulator or Android Emulator (optional for local testing)
- Expo Go app on physical device (for testing without emulators)

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/police102-mobile.git
   cd police102-mobile
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   - Create `.env` file based on `.env.example`
   - Configure API keys for Google Maps

## Running the App

Start the development server:
```bash
npx expo start
```

This will display a QR code and options to run the app on:
- iOS Simulator
- Android Emulator
- Physical device via Expo Go app

## Development Commands

```bash
# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web

# Run tests
npm test

# Lint code
npm run lint
```

## Project Structure

- `/app`: Main application code with file-based routing
  - `/(tabs)`: Main tab screens (home, emergency, map, etc.)
  - `/modals`: Modal screens
  - `/models`: Data models
  - `/services`: Service integrations
- `/components`: Reusable UI components
- `/context`: React context providers
- `/constants`: App constants and configuration
- `/hooks`: Custom React hooks
- `/assets`: Images, fonts, and other static assets

## Building for Production

1. Configure app.json for production builds
2. Generate builds using Expo EAS:
   ```bash
   npx eas build --platform ios
   npx eas build --platform android
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Contact

Your Organization - [website](https://yourorganization.com) - email@example.com
