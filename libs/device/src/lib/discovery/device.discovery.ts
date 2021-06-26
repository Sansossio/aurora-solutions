import { Injectable } from '@nestjs/common'
import { defer, Observable, Subscriber } from 'rxjs'
import * as SerialPort from 'serialport'
import { Arduino } from '../arduino/arduino'
import { DeviceType } from '../device.type'
import { DeviceDiscoveryDto } from './device.discovery.dto'

const RELOAD_DEVICES_TIME = 10 * 1000 // 10s
const GET_TYPE_EVENT = 'GET_TYPE'

interface DeviceDiscoveryPorts {
  port: SerialPort.PortInfo
  player: Arduino
  com: string
}

@Injectable()
export class DeviceDiscovery {
  private readonly comFound: string[] = []

  private searchAvailablePorts (): Observable<DeviceDiscoveryPorts[]> {
    return defer(async () => {
      const ports = await SerialPort.list()
      const data = await Promise.all(ports.map(async port => {
        if (!this.isAValidPort(port)) {
          return
        }
        const player = new Arduino(port.path)
        await player.initConnection()

        this.comFound.push(port.path)

        return {
          com: port.path,
          port,
          player
        }
      }))

      return data.filter(d => !!d)
    })
  }

  private isAValidPort (port: SerialPort.PortInfo) {
    return port.manufacturer.toLowerCase().includes('arduino') && !this.comFound.find(c => c === port.path)
  }

  private getType (type: string): DeviceType {
    if (Object.keys(DeviceType).includes(type)) {
      return type as DeviceType
    }
    return DeviceType.UNKNOW
  }

  private searchDevices (subscriber: Subscriber<DeviceDiscoveryDto>) {
    this.searchAvailablePorts().subscribe((ports) => {
      for (const port of ports) {
        void port.player.write(GET_TYPE_EVENT)

        const sub = port
          .player
          .getEvents()
          .subscribe((data) => {
            if (typeof data === 'string') {
              return
            }
            subscriber.next({
              com: port.com,
              type: this.getType(data.type),
              player: port.player
            })
            sub.unsubscribe()
          })
      }
    })
  }

  discover (): Observable<DeviceDiscoveryDto> {
    return new Observable((subscriber) => {
      this.searchDevices(subscriber)
      setInterval(() => this.searchDevices(subscriber), RELOAD_DEVICES_TIME)
    })
  }
}
