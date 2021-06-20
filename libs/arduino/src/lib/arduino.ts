import { Logger } from '@nestjs/common'
import * as SerialPort from 'serialport'
import { delay, delayPromise } from '@aurora-solutions/utils'

const LOGS_CONTEXT = 'Arduino'
const CONNECTION_DELAY = 2000

export class Arduino {
  private readonly logger = new Logger(LOGS_CONTEXT)
  private arduino: SerialPort
  private connected = false

  constructor (
    private readonly serialPort: string
  ) {
    this.initConnection()
  }

  private initConnection () {
    this.arduino = new SerialPort(this.serialPort, { baudRate: 9600 })

    this.arduino.on('open', () => {
      this.logger.log(`Connected to port "${this.serialPort}"`)
      this.connected = true
    })

    this.arduino.on('error', (e) => {
      this.logger.error(e)
    })

    this.arduino.on('error', () => {
      this.logger.warn('Connection closed, trying restart connection')
      this.connected = false
      this.arduino.close(() => {
        setTimeout(() => this.initConnection(), CONNECTION_DELAY)
      })
    })
  }

  async write (message: string) {
    while (!this.connected) {
      await delayPromise(CONNECTION_DELAY)
    }

    delay(() => {
      this.arduino.write(`${message}\n`)
    })
  }
}
