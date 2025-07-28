# Telegram Sentiment Analysis API

A simple API to analyze sentiment in Telegram groups with a beautiful frontend interface and secure login flow.

## Features

- 🔐 Secure login with phone number verification
- 📊 Real-time sentiment analysis of Telegram group messages
- 🎨 Modern web interface built with Next.js and Tailwind CSS
- 🔄 RESTful API with Express.js
- 📈 Detailed analytics including positive, negative, and neutral message percentages
- 👥 Track unique users and message counts
- ⚡ Fast and responsive UI
- 🛡️ Proper authentication flow with 2FA support

## Quick Start

### 1. Backend Setup

1. **Install dependencies:**
   ```bash
   cd cribblebot
   npm install
   ```

2. **Run setup (first time only):**
   ```bash
   npm run setup
   ```
   This will help you get your Telegram session string.

3. **Create environment file:**
   Create a `.env` file in the `cribblebot` directory:
   ```
   TELEGRAM_API_ID=your_api_id
   TELEGRAM_API_HASH=your_api_hash
   TELEGRAM_SESSION=your_session_string
   PORT=3001
   ```

4. **Start the backend:**
   ```bash
   npm start
   ```
   The API will be available at `http://localhost:3001`

### 2. Frontend Setup

1. **Install dependencies:**
   ```bash
   cd cribblebotfrontend/cribblebotfe
   npm install
   ```

2. **Start the frontend:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Enter your phone number (with country code, e.g., +91XXXXXXXXXX)
3. Enter the verification code sent to your Telegram
4. If you have 2FA enabled, enter your password
5. Select a Telegram group from the dropdown
6. Choose how many days to analyze (1-30)
7. Click "Analyze Sentiment"
8. View the results with detailed statistics

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/login` - Login with phone number
- `GET /api/groups` - Get available Telegram groups (requires authentication)
- `POST /api/analyze` - Analyze group sentiment (requires authentication)

### Login Request Body:
```json
{
  "phoneNumber": "+91XXXXXXXXXX"
}
```

### Analyze Request Body:
```json
{
  "groupIndex": 1,
  "days": 7
}
```

## Getting Telegram API Credentials

1. Go to https://my.telegram.org
2. Log in with your phone number
3. Create a new application
4. Copy the `api_id` and `api_hash`
5. Use these in your `.env` file

## Troubleshooting

### Common Issues:

1. **"Phone number is banned"**
   - Try using a different phone number
   - Make sure the number is active and not banned by Telegram
   - Use a number that hasn't been used for API access before

2. **"Failed to connect to API"**
   - Make sure the backend is running on port 3001
   - Check that CORS is properly configured
   - Verify your `.env` file exists and has correct values

3. **"Invalid verification code"**
   - Check your Telegram app for the code
   - Make sure you're entering the code correctly
   - Try requesting a new code

4. **"Failed to fetch groups"**
   - Make sure you're logged in first
   - Verify your session string is valid
   - Try logging out and logging in again

5. **"No messages found"**
   - The group might not have recent activity
   - You might not have access to message history
   - Try increasing the number of days to analyze

### Phone Number Format

- Always include the country code (e.g., +91 for India)
- Don't include spaces or special characters
- Example: `+919876543210`

## Development

### Backend Structure:
- `server.js` - Main Express server with API routes
- `setup.js` - Helper script for initial setup
- Uses Telegram API for authentication and message fetching
- Uses sentiment.js for sentiment analysis

### Frontend Structure:
- Next.js with TypeScript
- Tailwind CSS for styling
- React hooks for state management
- Fetch API for backend communication

## Security Notes

- Keep your Telegram API credentials secure
- Don't commit the `.env` file to version control
- The session string contains sensitive authentication data
- Use HTTPS in production
- Consider rate limiting for production use

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TELEGRAM_API_ID` | Your Telegram API ID | Yes |
| `TELEGRAM_API_HASH` | Your Telegram API Hash | Yes |
| `TELEGRAM_SESSION` | Your Telegram session string | Yes |
| `PORT` | Server port (default: 3001) | No |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License 