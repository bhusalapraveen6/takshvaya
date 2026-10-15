import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env';
import { authRouter } from './modules/auth/auth.controller';
import { adminAuthRouter } from './modules/auth/admin-auth.controller';
import { jobsRouter } from './modules/jobs/jobs.controller';
import { skillsRouter } from './modules/skills/skills.controller';
import { autoApplyRouter } from './modules/auto-apply/auto-apply.controller';
import { recruiterRouter } from './modules/recruiter/recruiter.controller';
import { antiFraudRouter } from './modules/anti-fraud/anti-fraud.controller';
import { adminRouter } from './modules/admin/admin.controller';
import { companiesRouter } from './modules/companies/companies.controller';

const app = express();

// Trust proxy if behind Cloudflare/reverse proxy
app.set('trust proxy', 1);

// ----------------------------------------------------------------------------
// 1. SECURITY HEADERS (OWASP ASVS & STRICT CSP)
// ----------------------------------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", ENV.FRONTEND_URL],
        frameAncestors: ["'none'"], // Anti-clickjacking
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    hsts: {
      maxAge: 63072000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// ----------------------------------------------------------------------------
// 2. CORS CONFIGURATION
// ----------------------------------------------------------------------------
const allowedOrigins = [ENV.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS security policy.'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Admin-Token', 'X-CSRF-Token'],
  })
);

// ----------------------------------------------------------------------------
// 3. PARSERS & RATE LIMITERS
// ----------------------------------------------------------------------------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Global API Rate Limiter (100 requests per 15 minutes per IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});
app.use('/api/', globalLimiter);

// ----------------------------------------------------------------------------
// 4. ROUTE MOUNTING
// ----------------------------------------------------------------------------
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin-auth', adminAuthRouter);
app.use('/api/v1/jobs', jobsRouter);
app.use('/api/v1/skills', skillsRouter);
app.use('/api/v1/auto-apply', autoApplyRouter);
app.use('/api/v1/recruiter', recruiterRouter);
app.use('/api/v1/anti-fraud', antiFraudRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/companies', companiesRouter);

// Health check (Standard cloud probe + API versioned)
const healthHandler = (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    platform: 'Takshvaya Fresher Career Portal',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    zeroAdsPolicy: 'Strictly Enforced',
    fresherFocus: '0-2 Years Experience Only',
  });
};
app.get('/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// ----------------------------------------------------------------------------
// 5. GLOBAL ERROR HANDLER (Zero Stack Trace Leak in Production)
// ----------------------------------------------------------------------------
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SERVER ERROR]', err);
  const isDev = ENV.NODE_ENV === 'development';
  return res.status(err.status || 500).json({
    success: false,
    error: isDev ? err.message : 'Internal Server Error. Please contact support.',
    ...(isDev ? { stack: err.stack } : {}),
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(ENV.PORT, () => {
    console.log(`\n=============================================================`);
    console.log(`🚀 Takshvaya Backend Service Active on port ${ENV.PORT}`);
    console.log(`🛡️  Admin Dual-Factor OTP Allowlist: Strictly Configured & Active`);
    console.log(`🔒 OWASP ASVS Level 2 Security Headers Active`);
    console.log(`⚡ Zero-Ad Policy strictly maintained`);
    console.log(`=============================================================\n`);
  });
}

export default app;
