import express from 'express';
import resizeOnDemand from './routes/resizeOnDemand';
import resizeWithCache from './routes/resizeWithCache';

const app = express();
const port = 3000;

// Routes
app.use('/api/on-demand', resizeOnDemand);
app.use('/api/images', resizeWithCache); // GET /api/images?filename=&width=&height=

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${port}`);
});

export default app;