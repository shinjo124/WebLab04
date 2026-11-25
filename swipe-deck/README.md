# swipe-deck

Run `npm install`, then `npm run dev`. Use `npm run build`, `npm run lint`, and `npm test` for checks.

## API and seed

Copy the repository-root `.env.example` to `.env` and set `MONGODB_URI` to your MongoDB database. Run `npm run seed` to upsert ten sample profiles; running it again updates the same seed records without deleting other profiles. Run `npm run server` to start the API on port 3000 (or set `PORT`).

- `GET /api/health`: server health check.
- `GET /api/profiles`: list profiles.
- `POST /api/swipe`: send JSON such as `{"profileId":"507f1f77bcf86cd799439011","direction":"right"}`. Use an existing profile ID and `left`, `right`, or `up` for direction. The endpoint returns 201 on success, 400 for invalid input, and 404 for an unknown profile.

The frontend loads profiles from the API through the Vite proxy on port 3000. Like scores +10; Pass and Super score -5. Undo restores the most recent card. Swipes are saved through the API before advancing. The frontend history and score are held in memory and reset on reload. Undo restores the card locally; it does not delete the saved swipe record.

Focus the deck and use Left, Right, Up, or Backspace to undo. Drag at least 50 pixels left, right, or up on the card to swipe. Save failures leave the current card available for retry.
