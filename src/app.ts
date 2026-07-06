import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorMiddleware, notFoundHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import creditsRoutes from './routes/credits.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy.' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/credits', creditsRoutes);

app.use(notFoundHandler);
app.use(errorMiddleware);

export default app;
