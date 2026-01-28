# 🏋️ Gym Tracker PWA

A Progressive Web App to track your gym attendance with an interactive calendar and workout playlists.

## Features

- 📅 **Interactive Calendar** - View all gym days highlighted on the calendar
- 💪 **Quick Log** - One-tap button to log gym attendance for today
- 🎵 **Workout Playlists** - Create and manage custom workout playlists
- 🏋️ **Exercise Builder** - Add exercises with weight, reps, and sets to each playlist
- ✏️ **Edit Workouts** - Modify exercise details anytime
- 📱 **Install to Home Screen** - Works as a native-like app on iPhone
- 💾 **Data Persistence** - All data saved locally to your device
- ✨ **Minimalist Design** - Clean, Apple-inspired interface

## Installation on iPhone

1. Open Safari on your iPhone
2. Navigate to your deployed GitHub Pages URL
3. Tap the Share button (square with arrow pointing up)
4. Scroll down and tap "Add to Home Screen"
5. Tap "Add" in the top right
6. The app icon will appear on your home screen!

## Deployment to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name your repository (e.g., `gym-tracker`)
4. Make it public
5. Click "Create repository"

### Step 2: Upload Your Files

You have two options:

#### Option A: Using GitHub Web Interface (Easiest)

1. In your new repository, click "uploading an existing file"
2. Drag and drop these files:
   - `index.html`
   - `gym-tracker.jsx`
   - `manifest.json`
   - `service-worker.js`
   - `icon-192.png`
   - `icon-512.png`
3. Click "Commit changes"

#### Option B: Using Git Command Line

```bash
# Navigate to the directory with your files
cd /path/to/your/files

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR-USERNAME/gym-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. In your repository, click "Settings"
2. Scroll down to "Pages" in the left sidebar
3. Under "Source", select "Deploy from a branch"
4. Under "Branch", select "main" and "/ (root)"
5. Click "Save"
6. Wait a few minutes for deployment
7. Your app will be available at: `https://YOUR-USERNAME.github.io/gym-tracker/`

### Step 4: Configure for Subdirectory (If Needed)

If your app is not at the root of your GitHub Pages (e.g., `username.github.io/gym-tracker/`), you may need to update the paths in your files:

In `index.html`, update the script import:
```javascript
// Change this line if needed
import App from './gym-tracker.jsx';
```

## File Structure

```
gym-tracker/
├── index.html          # Main HTML file
├── gym-tracker.jsx     # React component
├── manifest.json       # PWA manifest
├── service-worker.js   # Service worker for offline support
├── icon-192.png        # App icon (192x192)
├── icon-512.png        # App icon (512x512)
└── README.md          # This file
```

## Usage

### Logging a Gym Visit

1. Click the "Log Workout" button
2. Select a workout playlist from the modal
3. The current date will be highlighted on the calendar

### Managing Playlists

**Create a new playlist:**
1. Click "Log Workout"
2. Scroll down in the modal
3. Type a new playlist name
4. Click "Create Playlist"

**Edit a playlist:**
1. Click "Log Workout"
2. Click the pencil icon next to any playlist
3. Add, edit, or remove exercises

**Delete a playlist:**
1. Click "Log Workout"
2. Click the trash icon next to the playlist you want to delete
3. Confirm deletion

### Building Workouts

**Add an exercise to a playlist:**
1. Open the playlist editor (pencil icon)
2. Enter the exercise name (e.g., "Bench Press")
3. Fill in weight, reps, and sets (optional)
4. Click "Add Exercise"

**Edit an exercise:**
1. Open the playlist editor
2. Click on any field to edit it directly
3. Changes save automatically

**Delete an exercise:**
1. Open the playlist editor
2. Click the trash icon next to the exercise

### Viewing Your Progress

- The calendar automatically highlights all days you've logged
- View your total gym sessions at the bottom of the app
- Navigate between months using the arrow buttons

## Technical Details

- Built with React 18
- Uses browser localStorage for data persistence
- Progressive Web App (PWA) with offline support
- No build step required - runs directly in the browser
- Mobile-optimized with touch-friendly UI

## Customization

### Colors

The app uses a minimalist, Apple-inspired color scheme:
- Background: `#f5f5f7` (light gray)
- Primary: `#1d1d1f` (near black)
- Borders: `#d2d2d7` (light gray)
- Text: `#86868b` (medium gray for secondary text)

To customize colors, edit the values in `gym-tracker.jsx`.

### Fonts

The app uses the system font stack for a native feel:
- `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

This automatically uses San Francisco on iOS/macOS, Segoe UI on Windows, etc.

## Troubleshooting

### App not installing on iPhone
- Make sure you're using Safari (not Chrome or Firefox)
- Check that the app is served over HTTPS (GitHub Pages uses HTTPS by default)
- Try hard-refreshing the page (hold refresh button)

### Data not saving
- Check browser console for errors
- Ensure localStorage is enabled in your browser
- Try clearing cache and reloading

### Icons not showing
- Verify `icon-192.png` and `icon-512.png` are uploaded
- Check the browser console for 404 errors
- Ensure paths in `manifest.json` are correct

## License

Free to use and modify for personal projects!

## Support

For issues or questions, create an issue in your GitHub repository or modify the code to fit your needs.

---

Made with 💪 for tracking gym gains!
