import { RtspService } from '@aurora-solutions/onvif'
import { filter, map } from 'rxjs/operators'

const CONNECTED_STATUS = 1

interface StreamingsRtsp {
  users: WebSocket[]
}

export class RtspStreaming {
  private readonly streamings: Map<string, StreamingsRtsp> = new Map()

  private instantiateSocket (socket: WebSocket, rtspUrl: string) {
    this.streamings.set(rtspUrl, { users: [socket] })

    new RtspService()
      .getVideoBuffer({ input: rtspUrl })
      .pipe(
        filter(val => !!val),
        map(({ buffer }) => {
          const { users } = this.streamings.get(rtspUrl)
          return {
            buffer,
            users
          }
        }),
        filter(({ users }) => !!users.length)
      )
      .subscribe(({ buffer, users }) => {
        for (const user of users) {
          user.send(buffer)
        }
      })
  }

  addUsersToStreaming (socket: WebSocket, rtspUrl: string) {
    socket.onclose = () => {
      const stream = this.streamings.get(rtspUrl)
      stream.users = stream.users.filter(u => u.readyState === CONNECTED_STATUS)
    }

    const exists = this.streamings.get(rtspUrl)
    if (exists) {
      exists.users.push(socket)
      return
    }

    this.instantiateSocket(socket, rtspUrl)
  }
}
