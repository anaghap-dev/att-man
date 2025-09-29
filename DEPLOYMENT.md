# Deployment Guide for Attendance Management System

## Render Deployment

This fullstack application is configured for deployment on Render with two services:

### Frontend (React App)
- **Service Name**: att-man-frontend
- **Build Command**: `cd client && npm install && npm run build && npm install -g serve`
- **Start Command**: `serve -s client/build -p $PORT`
- **Port**: 3000

### Backend (Express API)
- **Service Name**: att-man-backend
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`
- **Port**: 10000

## Manual Deployment Steps

1. **Connect your Git repository** to Render
2. **Create two web services** using the `render.yaml` configuration
3. **Deploy both services** - they will auto-deploy on git pushes

## Alternative: Single Service Deployment

If you prefer to deploy as a single service with the backend serving the frontend:

1. Create one web service on Render
2. Use these settings:
   - **Build Command**: `npm run install:all && npm run build:client`
   - **Start Command**: `npm run start:server`
   - **Port**: Use PORT environment variable

## Environment Variables

The configuration automatically handles:
- `PORT` environment variable for both services
- Node.js version >=18 requirement
- Static file serving for the React build

## Project Structure
```
att-man/
├── client/          # React frontend
├── server/          # Express backend
├── package.json     # Root package.json with workspace config
└── render.yaml      # Render deployment configuration
```