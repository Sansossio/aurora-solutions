import * as express from 'express'
import * as expressWs from 'express-ws'
import * as dotenv from 'dotenv'
import { RtspStreaming } from './app/service/rtsp-streaming'

dotenv.config({ path: './apps/rtsp-proxy/.env' })

const app = express()
const { app: appWs } = expressWs(app)

const streamingCacheProxy = new RtspStreaming()

appWs.ws('/stream/camera', (ws, req) => {
  const url = req.query.rtsp?.toString()
  streamingCacheProxy.addUsersToStreaming(ws as any, url)
})

const port = +process.env.APP_PORT || 3001

const server = app.listen(port, () => {
  console.log(`RTSP Proxy listening at http://localhost:${port}`)
})

server.on('error', console.error)
