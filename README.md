# Daily Habit Tracker

A mobile-optimized habit tracking web application built with React, Vite, TailwindCSS, and Appwrite.

## Features

- **User Authentication**: Sign in / sign up with Google (Appwrite OAuth)
- **Daily Tasks**: Create and complete daily tasks with progress tracking
- **Habit Tracking**: Track habits with streaks and completion history
- **Future Tasks**: Plan tasks with deadlines and track completion
- **Profile**: View statistics, achievements, and overall progress

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: TailwindCSS
- **Backend**: Appwrite (Authentication & Database)
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Date Handling**: date-fns

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Appwrite

1. Create an account at [appwrite.io](https://appwrite.io)
2. Create a new project
3. Enable the **Google** OAuth provider in your project
4. Add your app URL to the OAuth redirect allowlist in Appwrite (for dev: `http://localhost:5173`, for prod: your deployed domain)
4. Create a database with the following collections:
   - `daily_tasks` (attributes: userId, title, completed, date, createdAt)
   - `habits` (attributes: userId, name, streak, createdAt)
   - `habit_logs` (attributes: habitId, userId, date, completedAt)
   - `future_tasks` (attributes: userId, title, deadline, completed, createdAt)

5. Update the `.env` file with your Appwrite credentials:
   ```
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your-project-id
   VITE_APPWRITE_DATABASE_ID=your-database-id
   VITE_APPWRITE_DAILY_TASKS_COLLECTION_ID=daily_tasks
   VITE_APPWRITE_HABITS_COLLECTION_ID=habits
   VITE_APPWRITE_HABIT_LOGS_COLLECTION_ID=habit_logs
   VITE_APPWRITE_FUTURE_TASKS_COLLECTION_ID=future_tasks
   # Optional: force OAuth return URLs (otherwise uses window.location.origin)
   VITE_APP_URL=http://localhost:5173
   ```

### 3. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Mobile Optimization

The application is designed with a mobile-first approach:
- Responsive design that works on all screen sizes
- Touch-friendly buttons and inputs
- Optimized for mobile browsers
- Clean, modern UI with glass-morphism effects

## Database Schema

### daily_tasks
- userId (string): User ID
- title (string): Task title
- completed (boolean): Completion status
- date (string): Date in YYYY-MM-DD format
- createdAt (string): ISO timestamp

### habits
- userId (string): User ID
- name (string): Habit name
- streak (number): Current streak count
- createdAt (string): ISO timestamp

### habit_logs
- habitId (string): Habit ID
- userId (string): User ID
- date (string): Date in YYYY-MM-DD format
- completedAt (string): ISO timestamp

### future_tasks
- userId (string): User ID
- title (string): Task title
- deadline (string): Date in YYYY-MM-DD format
- completed (boolean): Completion status
- createdAt (string): ISO timestamp

## Features Breakdown

### 1. Authentication
- Google OAuth (Appwrite)
- Session management
- Logout functionality

### 2. Daily Tasks
- Create daily tasks
- Mark tasks as complete/incomplete
- Delete tasks
- Progress bar showing daily completion
- Tasks reset daily (filtered by date)

### 3. Habit Tracking
- Create multiple habits
- Track habit completion daily
- View habit streaks
- Detailed habit view with completion history
- Delete habits

### 4. Future Tasks
- Create tasks with deadlines
- Mark tasks as complete/incomplete
- View overdue tasks
- Delete tasks
- Sorted by deadline

### 5. Profile
- View user information
- Statistics dashboard
- Achievement badges
- Overall progress overview

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.
