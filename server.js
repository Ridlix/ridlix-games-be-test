const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const ridlixGameTokenRouter = require('./routes/ridlixGameToken');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(morgan('dev'));
app.use(helmet());

// This is only for local development and easy testing
// You can remove this in production
app.use(
	cors({
		origin: '*', // Allow any origin to make requests
		credentials: true,
	})
);

app.use('', ridlixGameTokenRouter);

// Health check route
app.get('/health', (req, res) => {
	res.status(200).json({ status: 'OK', message: 'Server is running' });
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
	process.error('Unhandled Rejection', {
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
