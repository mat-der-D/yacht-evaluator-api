import { Hono } from 'hono'
import { cors } from 'hono/cors'
import calculateScoreRoute from './routes/calculate-score'
import evaluateRoute from './routes/evaluate'

const app = new Hono()

// CORS設定
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  })
)

app.get('/api/v1', (c) => {
  return c.json({ status: 'ok' })
})

app.route('/api/v1', evaluateRoute)
app.route('/api/v1', calculateScoreRoute)

export default app
