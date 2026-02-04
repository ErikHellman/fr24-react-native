# AGENTS.md

> **Note:** This file must be kept in sync with CLAUDE.md. Any changes made here should also be reflected in CLAUDE.md.

## Overview

This is a proof-of-concept app that demonstrates using React Native to implement a Flightradar24-style application across Android, iOS, and web.

## Project Structure

```
fr24-react-native/
├── src/
│   ├── index.ts                 # Entry point
│   ├── App.tsx                  # Main application component (737 lines)
│   └── api/
│       └── fr24.ts              # Flightradar24 API integration (204 lines)
├── assets/
│   ├── a380.png                 # Flight marker icon
│   ├── airports.json            # Global airport database (1000+ airports)
│   ├── icon.png                 # App icon
│   ├── adaptive-icon.png        # Android adaptive icon
│   ├── splash-icon.png          # Splash screen icon
│   └── favicon.png              # Web favicon
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
└── Flightradar24-API.yaml       # OpenAPI specification (3,547 lines)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React Native 0.81.5 |
| Web Support | react-native-web 0.21.0 |
| Maps | react-native-maps + Google Maps |
| Language | TypeScript 5.9.2 |
| Runtime | Expo 54.0.33 |
| Target Platforms | iOS, Android, Web |
| API | Flightradar24 REST API |

## Key Dependencies

- **expo** ~54.0.33 - Cross-platform framework
- **react** 19.1.0 - UI library
- **react-native** 0.81.5 - Mobile framework
- **react-native-maps** 1.20.1 - Google Maps integration
- **react-native-web** ^0.21.0 - Web platform support

## Core Functionality

### Map Display
- Interactive Google Maps with region tracking
- Initial region centered on San Francisco (37.7749°N, -122.4194°W)

### Flight Tracking
- Real-time flight position markers with aircraft icon
- Rotation based on track heading
- Displays altitude and ground speed
- Auto-refresh every 10 seconds
- Request cancellation via AbortController

### Airport Search
- Fuzzy search across name, city, country, IATA, and ICAO codes
- Unicode normalization for accent-insensitive matching
- Relevance-based scoring algorithm
- Top 5 results displayed

### Bottom Sheet
- Three states: collapsed, half, full
- 22 flight data fields when expanded
- Animated transitions (220ms)

## API Integration

**Base URL:** `https://fr24api.flightradar24.com`

### Implemented Endpoints
- `GET /api/live/flight-positions/full` - Flight data by bounds or airport
- `GET /api/static/airports/{code}/full` - Airport details

### Flight Data Fields
fr24_id, flight, callsign, lat, lon, track, alt, gspeed, vspeed, squawk, timestamp, source, hex, type, reg, painted_as, operating_as, orig_iata, orig_icao, dest_iata, dest_icao, eta

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_FR24_API_KEY` | Flightradar24 API authentication token (required) |

## Build Commands

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on Web
```

## Platform Configuration

- **iOS Bundle ID:** `se.hellsoft.fr24`
- **Android Package:** `se.hellsoft.fr24`
- **New Architecture:** Enabled

## UI Theme

- Dark theme with glass-morphism effects
- Primary accent: #7ed9ff (cyan)
- Background: #0e1217 (dark gray)

## Notes

- See the Flightradar24 SDK examples for usage patterns: https://github.com/Flightradar24/fr24api-sdk-js/blob/HEAD/examples.js
- Full API documentation in `Flightradar24-API.yaml`
