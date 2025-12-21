import { Hono } from 'hono'
import calculateScore from './routes/calculate-score'
import evaluate from './routes/evaluate'

const app = new Hono()

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

app.route('/evaluate', evaluate)
app.route('/calculate-score', calculateScore)

export default app
