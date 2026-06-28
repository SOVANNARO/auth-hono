import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './routes/auth'
import userRoutes from './routes/users'

type Bindings = { DB: D1Database; JWT_SECRET: string }
type Variables = { userId: number; userEmail: string }

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use('/*', cors())

app.route('/auth', auth)
app.route('/users', userRoutes)

app.get('/', (c) => c.json({ message: 'Auth API' }))

export default app
