import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets'
import { CamerasService } from '../service/cameras.service'
import { Socket, Server } from 'socket.io'
import * as SerialPort from 'serialport'
import { Logger } from '@nestjs/common'
import { delay } from '@aurora-solutions/utils'

const LOGS_CONTEXT = 'CamerasEvents'

@WebSocketGateway({ namespace: '/cameras' })
export class CamerasEvents {
  private readonly logger = new Logger(LOGS_CONTEXT)
  private readonly arduino = new SerialPort('COM3', { baudRate: 9600 })
  @WebSocketServer()
  private readonly server: Server

  constructor (
    private readonly cameraService: CamerasService
  ) {
    void this.motionSensorEvent()
    void this.initArduino()
  }

  private initArduino () {
    this.arduino.pipe(new SerialPort.parsers.Readline({ delimiter: '\n' }))
    this.arduino.on('open', () => {
      this.logger.log('Arduino conection open')
    })
  }

  private getCameraRoomName (camera: string) {
    return `camera-events-${camera}`
  }

  private sendMessageToArduino (msg: string) {
    delay(() => {
      this.arduino.write(`${msg}\n`)
    })
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
          // Send to arduino screen
          let arduinoMessage = ''
          if (isMotion) {
            arduinoMessage = 'Moving detected'
          }
          this.sendMessageToArduino(arduinoMessage)
          // Send to browser
          this.server.to(this.getCameraRoomName(camera.name))
            .emit('isMotion', { isMotion, name: camera.name })
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
