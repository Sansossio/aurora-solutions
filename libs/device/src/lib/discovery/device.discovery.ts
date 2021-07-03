import { Injectable, Logger } from '@nestjs/common'
import { Observable, Subscriber } from 'rxjs'
import { timeout } from 'rxjs/operators'
import * as SerialPort from 'serialport'
import { Arduino } from '../arduino/arduino'
import { DeviceType } from '../device.type'
import { DeviceDiscoveryDto } from './device.discovery.dto'

const RELOAD_DEVICES_TIME = 10 * 1000 // 10s
const DEVICE_RESPONSE_TIMEOUT = 10 * 1000 // 10s response timeout
const GET_TYPE_EVENT = 'GET_TYPE'

const LOGGER_CONTEXT = 'DeviceDiscovery'

interface DeviceDiscoveryPorts {
  port: SerialPort.PortInfo
  player: Arduino
  com: string
}

@Injectable()
export class DeviceDiscovery {
  private readonly logger = new Logger(LOGGER_CONTEXT)
  private devices: DeviceDiscoveryDto[] = []

  private async searchAvailablePorts (): Promise<DeviceDiscoveryPorts[]> {
    const ports = await SerialPort.list()
    const data = await Promise.all(ports.map(async port => {
      if (!this.isAValidPort(port) || !!this.devices.find(dv => dv.com === port.path)) {
        return
      }
      const player = new Arduino(port.path)
      await player.initConnection()

      return {
        com: port.path,
        port,
        player
      }
    }))

    return data.filter(d => !!d)
  }

  private isAValidPort (port: SerialPort.PortInfo) {
    return port.manufacturer.toLowerCase().includes('arduino')
  }

  private getType (data: string | { type: DeviceType }): DeviceType {
    if (typeof data !== 'string' && Object.values(DeviceType).includes(data.type)) {
      return data.type
    }
    return DeviceType.UNKNOW
  }

  private clearDevices () {
    this.devices = this.devices.filter(d => !d.player.isDisconnectedPort())
    return this.devices
  }

  private async searchDevices (subscriber: Subscriber<DeviceDiscoveryDto[]>) {
    this.clearDevices()
    const availablePorts = await this.searchAvailablePorts()

    subscriber.next(this.devices)

    for (const port of availablePorts) {
      void port.player.write(GET_TYPE_EVENT)
      const sub = port
        .player
        .getEvents()
        .pipe(
          timeout(DEVICE_RESPONSE_TIMEOUT)
        )
        .subscribe(
          (data) => {
            const device = {
              com: port.com,
              type: this.getType(data),
              player: port.player
            }

            subscriber.next(this.devices)
            sub.unsubscribe()

            this.devices.push(device)

            this.logger.log(`New device "${device.type}" registered (Port: ${device.com})`)
          },
          // Unsubscribe from any error
          () => {
            sub.unsubscribe()
          }
        )
    }
    setTimeout(async () => this.searchDevices(subscriber), RELOAD_DEVICES_TIME)
  }

  discover (): Observable<DeviceDiscoveryDto[]> {
    return new Observable((subscriber) => {
      void this.searchDevices(subscriber)
    })
  }
}
