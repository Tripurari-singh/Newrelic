// import 'newrelic';
// import express from "express";

// const app = express();

// app.get("/" , (req , res) => {
//     console.log("Route Hit !")
//     res.json({
//         message : "Hello From Get Endpoint"
//     })
// })

// app.listen(3000 , () => {
//     console.log("App is Listening On Port 3000")
// })


// import winston from "winston";
// const logger = winston.createLogger({
//     level : 'info',
//     format : winston.format.combine(
//         winston.format.timestamp(),
//         winston.format.json(),
//         winston.format.prettyPrint()
//     ),
//     transports : [
//         new winston.transports.File({ filename : 'error.log',level : 'error' }),
//         new winston.transports.File({ filename : 'combined.log' }),
//         new winston.transports.Console()
//     ]
// })





import 'newrelic';
import express from 'express';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});

const app = express();

// Request logger middleware
app.use((req, res, next) => {
  logger.info('Incoming request', { method: req.method, url: req.url });
  next();
});

// Routes
app.get('/', (req, res) => {
  logger.info('Root route hit');
  res.json({ message: 'Hello from GET endpoint' });
});

app.get('/error-demo', (req, res) => {
  logger.error('Something went wrong', { route: '/error-demo' });
  res.status(500).json({ error: 'Internal server error' });
});

// Global error handler
app.use((err : any, req : any, res : any, next : any) => {
  logger.error('Unhandled error', { message: err.message, url: req.url });
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(3000, () => {
  logger.info('Server running on port 3000');
});