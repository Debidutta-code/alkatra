import express, { Express } from 'express';
import Routes from './route';

const app: Express = express();

app.use(express.json({ limit: '10mb' }));

app.use('/api', Routes);

export default app;