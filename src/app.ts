import { Hono } from 'hono'
import calculateScoreRoute from './routes/calculate-score'
import evaluateRoute from './routes/evaluate'

const app = new Hono()

app.get('/api/v1', (c) => {
  return c.json({ status: 'ok' })
})

app.route('/api/v1', evaluateRoute)
app.route('/api/v1', calculateScoreRoute)

export default app
