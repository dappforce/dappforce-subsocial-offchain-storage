import express from 'express'
import cors from 'cors'
import { expressApiLog as log } from '../connections/loggers'
import timeout from 'connect-timeout'
import { reqTimeoutSecs } from './config'
import { corsAllowedList, isAllCorsAllowed, port } from '../env'
import { createV1Routes } from './routes'

require('dotenv').config()

const app = express()

const corsOpts = function (req: express.Request, callback) {
  const corsOptions = { origin: false }

  if (
    isAllCorsAllowed ||
    req.method === 'GET' ||
    corsAllowedList.indexOf(req.header('Origin')) !== -1
  ) {
    corsOptions.origin = true // reflect (enable) the requested origin in the CORS response
  }

  callback(null, corsOptions) // callback expects two parameters: error and options
}

app.use(cors(corsOpts))

function haltOnTimedout(req: express.Request, _res: express.Response, next) {
  if (!req.timedout) next()
}

app.use(timeout(`${reqTimeoutSecs}s`))
app.use(haltOnTimedout)

app.use('/v1', createV1Routes())

export const startHttpServer = async () => {
  // const ssl = await loadSSL()
  app.listen(port, async () => {
    log.info(`HTTP server started on port ${port}`)
  })
}
