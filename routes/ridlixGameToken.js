// Server-side code (Node.js/Express)
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Your Ridlix Game credentials (store in environment variables)
const RIDLIX_API_KEY = 'key_20b2124905c556af9e61ee40c529133d';
const RIDLIX_CLIENT_ID = 'client_3908689ddacb5fa7';
const RIDLIX_API_URL = 'https://games.ridlix.com/api';

// Support both GET and POST methods
router.get('/api/ridlix-game-token', handleRidlixGameTokenRequest);
router.post('/api/ridlix-game-token', handleRidlixGameTokenRequest);

async function handleRidlixGameTokenRequest(req, res) {
	try {
		// Get gameId from either query params (GET) or request body (POST)
		const gameId = req.method === 'GET' ? req.query.gameId : req.body.gameId;

		if (!gameId) {
			return res.status(400).json({ error: 'Game ID is required' });
		}

		// Multiple ways to determine origin (with fallbacks)
		let origin = '';

		// 1. Check the Origin header first (most reliable for cross-origin requests)
		if (req.headers.origin) {
			origin = req.headers.origin;
		}
		// 2. Check if it was provided in the request body (our custom fallback)
		else if (req.method === 'POST' && req.body.clientOrigin) {
			origin = req.body.clientOrigin;
		}
		// 3. Try to extract from Referer header
		else if (req.headers.referer) {
			try {
				const refererUrl = new URL(req.headers.referer);
				origin = refererUrl.origin;
			} catch (e) {}
		}

		// Request token from Ridlix API
		const response = await fetch(`${RIDLIX_API_URL}/sessions/token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': RIDLIX_API_KEY,
				Origin: origin, // Forward the origin header
			},
			body: JSON.stringify({
				clientId: RIDLIX_CLIENT_ID,
				gameId: gameId,
				origin: origin, // Also include in request body
			}),
		});

		const data = await response.json();

		if (data.status !== 'success') {
			return res
				.status(400)
				.json({ error: data.message || 'Failed to get token' });
		}

		// Return token and embed URL to client
		res.status(200).json({
			token: data.data.token,
			embedUrl: data.data.embedUrl,
		});
	} catch (error) {
		res.status(500).json({ error: 'Failed to get game token' });
	}
}

module.exports = router;
