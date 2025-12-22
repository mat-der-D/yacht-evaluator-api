import { Hono } from 'hono'
import calculateScoreRoute from './routes/calculate-score'
import evaluateRoute from './routes/evaluate'

const app = new Hono()

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

app.route('/evaluate', evaluateRoute)
app.route('/calculate-score', calculateScoreRoute)

export default app
