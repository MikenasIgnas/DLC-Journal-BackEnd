import bodyparser    from 'body-parser'
import cors          from 'cors'
import express       from 'express'
import mongoose      from 'mongoose'

import authRouter    from './routes/authRoutes'
import companyRoutes from './routes/companyRoutes'
import mainRouter    from './routes/router'
import siteRoutes    from './routes/siteRoutes'
import usersRouter   from './routes/userRoutes'
import visitRouter   from './routes/visitRoutes'


mongoose.connect(process.env.MONGO_PATH)
  .then(() => {
    console.log('CONNECTED OK')
  }).catch(e => {
    console.log(e, 'CONNECTION ERROR')
  })

const app = express()

app.use(cors({
  origin:      process.env.CORS_ORIGIN,
  credentials: true,
  methods:     'GET,HEAD,PUT,PATCH,POST,DELETE',
}))

app.use(express.json())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.listen(process.env.SERVER_PORT)

app.use('/', mainRouter)
app.use('/auth', authRouter)
app.use('/company', companyRoutes)
app.use('/site', siteRoutes)
app.use('/user', usersRouter)
app.use('/visit', visitRouter)