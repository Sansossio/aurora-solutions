import { Logger } from '@nestjs/common'
import { promisify } from 'util'
import * as SerialPort from 'serialport'
import { delay as delayCb } from '@aurora-solutions/utils'
import { Observable, of } from 'rxjs'
import { delay, mergeMap } from 'rxjs/operators'

const LOGS_CONTEXT = 'Arduino'
const CONNECTION_DELAY = 2000
const DEFAULT_BRAUDRATE = 115200
const MAX_RECONNECT_TRIES = 5

export class Arduino {
  private readonly logger = new Logger(`${LOGS_CONTEXT}-${this.serialPort}`)
  private readonly parser = new SerialPort.parsers.Readline({ delimiter: '\n' })
  private events: Observable<any>
  private reconnectTries = 0
  private port: SerialPort

  constructor (
    private readonly serialPort: string,
    private readonly baudRate: number = DEFAULT_BRAUDRATE
  ) {}

  private openSerialPortEvents (): Observable<any> {
    if (!this.port?.isOpen) {
      return of()
        .pipe(
          delay(CONNECTION_DELAY),
          mergeMap(() => this.getEvents())
        )
    }

    return new Observable((subscriber) => {
      this.parser.on('data', (data) => {
        const val: string = data.toString()

        try {
          subscriber.next(JSON.parse(val))
        } catch (e) {
          subscriber.next(val)
        }
      })
    })
  }

  private async reconnect () {
    this.logger.warn('Connection closed, trying restart connection')

    if (this.isDisconnectedPort()) {
      this.logger.warn('The device has reached the maximum number of reconnection attempts, it will disconnect')
      return
    }
    this.reconnectTries++

    try {
      await promisify(this.port.close.bind(this.port))()
    } catch (e) {}

    this.port = null

    setTimeout(
      () => {
        void this.initConnection()
      },
      CONNECTION_DELAY
    )
  }

  isDisconnectedPort () {
    return !this.port?.isOpen && this.reconnectTries >= MAX_RECONNECT_TRIES
  }

  async initConnection (): Promise<void> {
    return new Promise((resolve) => {
      if (this.port?.isOpen) {
        resolve()
        return
      }

      this.port = new SerialPort(this.serialPort, { baudRate: this.baudRate })
      this.port.pipe(this.parser)

      this.port.on('open', () => {
        this.logger.log('Connection open')
        this.reconnectTries = 0

        setTimeout(
          () => {
            this.events = this.openSerialPortEvents()
            resolve()
          },
          CONNECTION_DELAY
        )
      })

      this.port.on('error', async (e) => {
        this.logger.error(e)
        if (e.message?.includes('Access denied')) {
          this.reconnectTries = MAX_RECONNECT_TRIES
        }
        void this.reconnect()
      })

      this.port.on('close', () => {
        void this.reconnect()
      })
    })
  }

  async write (message: string) {
    delayCb(() => {
      this.port?.write(`${message}\n`)
    })
  }

  getEvents (): Observable<any> {
    return this.events
  }
}
