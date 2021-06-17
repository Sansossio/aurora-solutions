import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets'
import { CamerasService } from '../service/cameras.service'
import { Socket, Server } from 'socket.io'

@WebSocketGateway({ namespace: '/cameras' })
export class CamerasEvents {
  @WebSocketServer()
  private readonly server: Server

  constructor (
    private readonly cameraService: CamerasService
  ) {
    void this.motionSensorEvent()
  }

  private getCameraRoomName (camera: string) {
    return `camera-events-${camera}`
  }

  private motionSensorEvent () {
    for (const camera of this.cameraService.getCameras()) {
      if (!camera.player) {
        continue
      }

      camera
        .player
        .motionSensor()
        .subscribe((isMotion) => {
          this.server.to(
            this.getCameraRoomName(camera.name)
          ).emit('isMotion', { isMotion, name: camera.name })
        })
    }
  }

  @SubscribeMessage('subscribe')
  async subscribeTo (
  @MessageBody() camera: string,
    @ConnectedSocket() client: Socket
  ) {
    void client.join(this.getCameraRoomName(camera))
  }
}