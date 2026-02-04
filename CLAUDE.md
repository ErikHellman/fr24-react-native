# CLAUDE.md

> **Note:** This file must be kept in sync with AGENTS.md. Any changes made here should also be reflected in AGENTS.md.

## Overview
This is a proof-of-concept app that demonstrates using React Native to implement a Flightradar24-style application across Android, iOS, and web.

## Key Tech
- React Native
- @Flightradar24-API.yaml containing the OpenAPI spec for Flightradar24 API
- react-native-maps for Google Maps display

## Core Functionality
- Display a Google Map.
- Fetch full live flights information for all flights within the current map view bounds (two GPS coordinates).

## Notes
- See the Flightradar24 SDK examples for usage patterns: https://github.com/Flightradar24/fr24api-sdk-js/blob/HEAD/examples.js
