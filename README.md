#  Express + Winston + New Relic — Logging Setup

A clean, production-ready Node.js/TypeScript server using **Express** for routing, **Winston** for structured logging, and **New Relic** for APM (Application Performance Monitoring).

---

##  Project Structure

```
project-root/
├── src/
│   └── index.ts          # Main entry point
├── logs/
│   ├── error.log         # Auto-generated: error-level logs only
│   └── combined.log      # Auto-generated: all log levels
├── newrelic.js           # New Relic config file
├── package.json
├── tsconfig.json
└── README.md
```

---

##  Getting Started

### 1. Clone & Install Dependencies

```bash
git clone <your-repo-url>
cd <your-project-folder>
npm install
```

### 2. Install Required Packages

```bash
npm install express winston newrelic
npm install -D typescript ts-node @types/express @types/node
```

### 3. Run the Server

```bash
# Development (with ts-node)
npx ts-node src/index.ts

# Or if you have a start script in package.json
npm start
```

Server will start at: `http://localhost:3000`

---

##  Dependencies

| Package     | Version  | Purpose                                      |
|-------------|----------|----------------------------------------------|
| `express`   | ^4.x     | HTTP server and routing framework            |
| `winston`   | ^3.x     | Structured, levelled logging library         |
| `newrelic`  | ^11.x    | APM agent — performance & error monitoring   |
| `typescript`| ^5.x     | Type-safe JavaScript (dev dependency)        |
| `ts-node`   | ^10.x    | Run TypeScript directly without compiling    |

---

##  Core Concepts

### What is Winston?

**Winston** is a logging library for Node.js. Instead of using raw `console.log`, Winston gives you:

- **Log Levels** — categorize messages by severity
- **Formats** — shape how log messages look (JSON, timestamps, colors)
- **Transports** — choose where logs go (file, console, cloud services)

---

### Log Levels (Severity Order)

Winston uses a priority hierarchy. Setting a level means **only that level and above** will be logged:

```
error (0)  ← most severe
warn  (1)
info  (2)  ← default in this project
http  (3)
debug (4)
silly (5)  ← least severe
```

**Example:** If `level: 'info'` is set, then `error`, `warn`, and `info` messages pass through. `debug` and `silly` are silently dropped.

---

### What are Transports?

A **transport** is an output destination for your logs. You can have multiple transports simultaneously — the same log message goes to all of them at once.

| Transport                                          | Output Destination        |
|----------------------------------------------------|---------------------------|
| `new winston.transports.Console()`                 | Your terminal / stdout    |
| `new winston.transports.File({ filename: '...' })` | A log file on disk        |

In this project we use **3 transports**:

1. `error.log` — stores only `error`-level logs (easy to grep in production)
2. `combined.log` — stores every log level
3. `Console` — prints to your terminal during development

---

### What is the Format Pipeline?

`winston.format.combine(...)` chains formatters in sequence. Each one transforms the log object before passing it to the next:

```
Raw log message
      ↓
  timestamp()     → adds { timestamp: "2024-01-15T10:30:00.000Z" }
      ↓
    json()         → serializes entire object as a JSON string
      ↓
 Written to transport
```

---

### What is New Relic?

**New Relic** is an APM (Application Performance Monitoring) tool. Unlike Winston (which you control manually), New Relic works as a **background agent** that automatically:

- Tracks HTTP request throughput and response times
- Captures unhandled errors and exceptions
- Monitors memory usage, CPU, and event loop lag
- Traces slow database queries and external API calls
- Sends everything to New Relic's cloud dashboard

>  **Important:** `import 'newrelic'` must be the **very first line** in your entry file — before Express, Winston, or anything else. The agent needs to instrument Node's module system before any other module loads.

---

## 🔧 Configuration

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### `newrelic.js` (required in project root)

```js
'use strict';

exports.config = {
  app_name: ['My Express App'],
  license_key: 'YOUR_NEW_RELIC_LICENSE_KEY_HERE',
  logging: {
    level: 'info'
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'response.headers.set-cookie'
    ]
  }
};
```

> Get your license key from: [https://one.newrelic.com](https://one.newrelic.com) → Account Settings → API Keys

---

##  Full Source Code

### `src/index.ts`

```typescript
import 'newrelic';
import express from 'express';
import winston from 'winston';

// ── Logger Setup ──────────────────────────────────────────────────────────────
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

// ── Express App ───────────────────────────────────────────────────────────────
const app = express();

// Middleware: log every incoming request
app.use((req, res, next) => {
  logger.info('Incoming request', { method: req.method, url: req.url });
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  logger.info('Root route hit');
  res.json({ message: 'Hello from GET endpoint' });
});

app.get('/error-demo', (req, res) => {
  logger.error('Something went wrong', { route: '/error-demo' });
  res.status(500).json({ error: 'Internal server error' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { message: err.message, url: req.url });
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(3000, () => {
  logger.info('Server running on port 3000');
});
```

---

##  API Endpoints

| Method | Endpoint      | Description                                  |
|--------|---------------|----------------------------------------------|
| GET    | `/`           | Returns a hello message, logs `info`         |
| GET    | `/error-demo` | Simulates an error, logs `error` level       |

---

##  Log Output Examples

### Console output (pretty, colorized)

```
{"level":"info","message":"Server running on port 3000","timestamp":"2024-01-15T10:30:00.000Z"}
{"level":"info","message":"Incoming request","method":"GET","url":"/","timestamp":"2024-01-15T10:30:05.123Z"}
{"level":"info","message":"Root route hit","timestamp":"2024-01-15T10:30:05.125Z"}
```

### `error.log` (only error-level entries)

```json
{"level":"error","message":"Something went wrong","route":"/error-demo","timestamp":"2024-01-15T10:31:00.000Z"}
```

### `combined.log` (everything)

```json
{"level":"info","message":"Server running on port 3000","timestamp":"2024-01-15T10:30:00.000Z"}
{"level":"info","message":"Incoming request","method":"GET","url":"/","timestamp":"2024-01-15T10:30:05.123Z"}
{"level":"error","message":"Something went wrong","route":"/error-demo","timestamp":"2024-01-15T10:31:00.000Z"}
```

---

##  How It All Flows Together

```
Your Code
   │
   │  logger.info("msg", { extra: data })
   ▼
Winston Logger
   │
   ├── Level Check  →  Is this level ≥ 'info'? If not, drop it.
   │
   ├── Format       →  timestamp() → json()
   │
   └── Transports (all run in parallel)
         ├── error.log    (only errors)
         ├── combined.log (everything)
         └── Console      (everything, to terminal)

New Relic Agent (running silently in background)
   └── Auto-captures HTTP metrics, errors, traces → New Relic Dashboard
```

---

##  Common Issues

### Logs not appearing?
- Check your `level` in `createLogger`. If set to `'silent'`, nothing logs.
- Make sure the `logs/` folder exists, or Winston will throw a write error.

### New Relic not reporting?
- Confirm `newrelic.js` is in the **project root** (not inside `src/`).
- Ensure `import 'newrelic'` is the **first line** of your entry file.
- Verify your license key is correct.

### TypeScript errors on error handler?
- The 4-argument error handler `(err, req, res, next)` needs `@types/express` installed.

---

##  Quick Reference

```bash
# Install all deps at once
npm install express winston newrelic && npm install -D typescript ts-node @types/express @types/node

# Run in dev
npx ts-node src/index.ts

# Test routes
curl http://localhost:3000/
curl http://localhost:3000/error-demo

# Watch logs in real time
tail -f combined.log
tail -f error.log
```

---

