import { Injectable, Logger } from '@nestjs/common'
import { Observable, Subscriber } from 'rxjs'
import * as SerialPort from 'serialport'
import { Arduino } from '../arduino/arduino'
import { DeviceType } from '../device.type'
import { DeviceDiscoveryDto } from './device.discovery.dto'

const RELOAD_DEVICES_TIME = 10 * 1000 // 10s
const GET_TYPE_EVENT = 'GET_TYPE'

const LOGGER_CONTEXT = 'DEVICE_DISCOVERY'

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

  private getType (type: string): DeviceType {
    if (Object.keys(DeviceType).includes(type)) {
      return type as DeviceType
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
        .subscribe((data) => {
          if (typeof data === 'string') {
            return
          }

          const device = {
            com: port.com,
            type: this.getType(data.type),
            player: port.player
          }

          subscriber.next(this.devices)
          sub.unsubscribe()

          this.devices.push(device)

          this.logger.log(`New device "${device.type}" registered (COM: ${device.com})`)
        })
    }
    setTimeout(async () => this.searchDevices(subscriber), RELOAD_DEVICES_TIME)
  }

  discover (): Observable<DeviceDiscoveryDto[]> {
    return new Observable((subscriber) => {
      void this.searchDevices(subscriber)
    })
  }
}
