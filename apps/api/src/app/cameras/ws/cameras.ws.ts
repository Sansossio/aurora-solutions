import { WebSocketGateway, SubscribeMessage, ConnectedSocket } from '@nestjs/websockets'
import { GET_CAMERAS_PROVIDER_KEY, InstancedCamera } from '@aurora-solutions/onvif'
import { Inject } from '@nestjs/common'

@WebSocketGateway({})
export class CamerasWS {
  constructor (
    @Inject(GET_CAMERAS_PROVIDER_KEY)
    private readonly cameras: InstancedCamera[]
  ) {}

  @SubscribeMessage('message')
  handle (
  @ConnectedSocket() client
  ) {
    this.cameras[0].player.getVideoBuffer()
      .subscribe((data) => {
        client.send(data.buffer)
      })
  }
}
