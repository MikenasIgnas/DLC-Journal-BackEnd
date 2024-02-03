import bodyparser    from 'body-parser'
import cors          from 'cors'
import express       from 'express'
import mongoose      from 'mongoose'

import authRouter    from './routes/authRoutes'
import companyRoutes from './routes/companyRoutes'
import mainRouter    from './routes/router'
import usersRouter   from './routes/userRoutes'


mongoose.connect(process.env.MONGO_PATH)
  .then(() => {
    console.log('CONNECTED OK')
  }).catch(e => {
    console.log(e, 'CONNECTION ERROR')
  })

const app = express()

app.use(cors({
  origin:      'http://localhost:3000',
  credentials: true,
  methods:     'GET,HEAD,PUT,PATCH,POST,DELETE',
}))

app.use(express.json())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.listen(4002)

app.use('/', mainRouter)
app.use('/auth', authRouter)
app.use('/company', companyRoutes)
app.use('/user', usersRouter)