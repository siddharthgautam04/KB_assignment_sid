import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import auth from './routes/auth.routes';
import resources from './routes/resources.routes';
import bookings from './routes/bookings.routes';
import health from './routes/health.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use('/health', health);
app.use('/api/auth', auth);
app.use('/api/resources', resources);
app.use('/api/bookings', bookings);

app.use(errorMiddleware);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => console.log(`API http://localhost:${port}`));