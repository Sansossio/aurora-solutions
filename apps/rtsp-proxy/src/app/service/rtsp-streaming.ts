import { RtspService } from '@aurora-solutions/onvif'
import { filter, map } from 'rxjs/operators'

const CONNECTED_STATUS = 1

export class RtspStreaming {
  private users: { socket: WebSocket, rtspUrl: string }[] = []
  private readonly streamings: string[] = []

  private getUsersSubscribedToStream (rtspUrl: string) {
    // Remove unconnected users
    this.users = this.users.filter(u => u.socket.readyState === CONNECTED_STATUS)

    return this.users.filter((u) => {
      return u.rtspUrl === rtspUrl
    })
  }

  private instantiateSocket (rtspUrl: string) {
    this.streamings.push(rtspUrl)
    new RtspService()
      .getVideoBuffer({ input: rtspUrl })
      .pipe(
        map(({ buffer }) => {
          return {
            buffer,
            users: this.getUsersSubscribedToStream(rtspUrl)
          }
        }),
        filter(data => !!data.users.length)
      )
      .subscribe(({ buffer, users }) => {
        for (const user of users) {
          user.socket.send(buffer)
        }
      })
  }

  addUsersToStreaming (socket: WebSocket, rtspUrl: string) {
    this.users.push({ socket, rtspUrl })
    if (!this.streamings.includes(rtspUrl)) {
      this.instantiateSocket(rtspUrl)
    }
  }
}
