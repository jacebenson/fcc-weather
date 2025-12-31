# Weather App

A simple weather application that shows current weather conditions based on your location.

## Features

- 🌍 Automatic geolocation detection
- 📍 Manual location input when geolocation fails
- ⛅ Current weather with temperature, humidity, wind
- 🌅 Sunrise/sunset times
- 🌙 Moon phase information
- 💾 Saves your location preference in localStorage

## Development

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run start

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
├── src/               # Source files
│   ├── index.html    # Main HTML file
│   ├── custom.js     # JavaScript logic
│   ├── custom.css    # Styles
│   └── favicon.ico   # Favicon
├── public/           # Built files (generated, not committed)
├── vite.config.js    # Vite configuration
└── netlify.toml      # Netlify deployment config
```

## Deployment

### Netlify

This project is configured for Netlify deployment:

1. **Build command**: `npm run build`
2. **Publish directory**: `public`

The `netlify.toml` file is already configured with these settings.

### Manual Deployment

Run `npm run build` and upload the contents of the `public/` folder to any static hosting service.

## Troubleshooting

### Location Not Working

If geolocation fails (Google API rate limit 429), the app will:
1. Prompt you to enter your city manually
2. Save your preference for future visits
3. Access the site via `http://127.0.0.1:3000` instead of `localhost` for better geolocation compatibility

### Port Already in Use

Vite will automatically try the next available port if 3000 is in use (3001, 3002, etc.)

## APIs Used

- **Weather Data**: FreeCodeCamp Weather Proxy API
- **Geolocation**: Browser Geolocation API (Google services)
- **Geocoding**: OpenStreetMap Nominatim API (for manual location input)

## License

ISC
