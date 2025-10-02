import express from 'express';
import { sendCodeHandler } from './send-code';

const app = express();
// Render sets the PORT environment variable.
const port = process.env.PORT || 10000;

// FIX: The app.use(express.json()) call was causing a type error.
// The middleware is now applied directly to the route that needs it.

// Define the API route
app.post('/api/send-code', express.json(), sendCodeHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});