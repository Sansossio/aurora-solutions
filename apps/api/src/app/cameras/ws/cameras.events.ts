import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets'

import { MotionSensorEvents } from '@aurora-solutions/events'
import { Socket, Server } from 'socket.io'

@WebSocketGateway({ namespace: '/cameras' })
export class CamerasEvents {
  @WebSocketServer()
  private readonly server: Server

  constructor (
    private readonly motionEvents: MotionSensorEvents
  ) {
    void this.motionSensorEvent()
  }

  private getCameraRoomName (camera: string) {
    return `camera-events-${camera}`
  }

  private motionSensorEvent () {
    this.motionEvents
      .listen()
      .subscribe(
        ({ camera: name, isMotion }) => {
          // Send to ws channel
          this.server.to(this.getCameraRoomName(name))
            .emit('isMotion', { isMotion, name: name })
        }
      )
  }

  @SubscribeMessage('subscribe')
  async subscribeTo (
  @MessageBody() camera: string,
    @ConnectedSocket() client: Socket
  ) {
    void client.join(this.getCameraRoomName(camera))
  }
}
