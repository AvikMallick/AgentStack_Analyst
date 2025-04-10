# AgStack Frontend

A React application for interacting with the AgStack backend. This frontend provides interfaces for managing database connections and running queries through a chat interface.

## Features

- **Connections Page**: Add, view, and delete database connections
- **Chat Page**: Create conversations with database queries
- **Integration**: Works with the AgStack FastAPI backend

## Installation

1. Make sure you have Node.js installed
2. Install dependencies:

```bash
npm install
```

## Development

Run the development server:

```bash
npm run dev
```

This will start the server on port 3015: http://localhost:3015

## Building for Production

Build the app:

```bash
npm run build
```

## Project Structure

- `src/components/`: UI components
  - `common/`: Reusable UI components
  - `connections/`: Components for the Connections page
  - `chat/`: Components for the Chat page
  - `layout/`: Layout components like sidebars and headers
- `src/services/`: API services
- `src/pages/`: Main page components

## Backend Integration

This frontend is designed to work with the AgStack FastAPI backend running on port 8016.

## Technologies Used

- React
- React Router
- Tailwind CSS
- Axios
