const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const ridlixGameTokenRouter = require('./routes/ridlixGameToken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Configure Helmet with custom CSP settings
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
				scriptSrcAttr: ["'unsafe-inline'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				imgSrc: ["'self'", 'data:'],
				connectSrc: [
					"'self'",
					'http://localhost:*',
					'https://games.ridlix.com',
				],
				frameSrc: ["'self'", 'https://games.ridlix.com'],
				fontSrc: ["'self'", 'data:'],
				objectSrc: ["'none'"],
				mediaSrc: ["'self'"],
				childSrc: ["'self'", 'https://games.ridlix.com'],
			},
		},
	})
);

// This is only for local development and easy testing
// You can remove this in production
app.use(
	cors({
		origin: '*', // Allow any origin to make requests
		credentials: true,
	})
);

// Define Angular app path
const angularAppPath = path.join(__dirname, 'public/browser');

// API routes should come before static files
app.use('', ridlixGameTokenRouter);

// Health check route
app.get('/health', (req, res) => {
	res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Serve static files BEFORE the catch-all route
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(
	express.static(angularAppPath, {
		setHeaders: (res, path) => {
			if (path.endsWith('.js')) {
				res.set('Content-Type', 'application/javascript');
			} else if (path.endsWith('.mjs')) {
				res.set('Content-Type', 'application/javascript');
			} else if (path.endsWith('.css')) {
				res.set('Content-Type', 'text/css');
			}
		},
	})
);

// Catch-all route for Angular app AFTER static files
app.use((req, res, next) => {
	// Skip for API routes
	if (req.url.startsWith('/api')) {
		return next();
	}
	res.sendFile(path.join(angularAppPath, 'index.html'));
});

app.listen(PORT, () =>
	console.info(`Server running on http://localhost:${PORT}`)
);

// Error handling middleware
app.use((err, req, res, next) => {
	console.error('Unhandled error', { error: err.message, stack: err.stack });
	res.status(500).json({
		status: 'error',
		message: 'Internal server error',
	});
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
	console.error('Unhandled Rejection', {
		error: err.message,
		stack: err.stack,
	});
	// Don't crash the server for unhandled rejections
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception', { error: err.message, stack: err.stack });
	process.exit(1);
});
