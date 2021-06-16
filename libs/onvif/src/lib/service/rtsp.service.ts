import { Injectable, Logger } from '@nestjs/common'
import { spawn } from 'child_process'
import { Observable, of } from 'rxjs'
import { filter, map, mergeMap, skipWhile } from 'rxjs/operators'
import { ConnectRtspDto } from './dto/connect.rtsp.dto'

const DEFAULT_FFMPEG_CMD = 'ffmpeg'
const LOGGER_CONTEXT = 'RtspSubscriber'

@Injectable()
export class RtspService {
  private readonly ffmpegCmd: string = DEFAULT_FFMPEG_CMD
  private readonly logger = new Logger(LOGGER_CONTEXT)

  private connectToServer (args: string[], server: string, cmd: string = this.ffmpegCmd) {
    this.logger.log(`Trying connect to server: ${server}`)
    let connected = false
    return new Observable<{ buffer?: Buffer, error: boolean, disconnected?: boolean }>((subscribe) => {
      const command = spawn(cmd, args)
      command.stdout.on('data', (data) => {
        if (!connected) {
          this.logger.log(`Connected to server: ${server}`)
        }
        connected = true

        subscribe.next({ buffer: data, error: false })
      })

      command.stderr.on('data', data => {
        subscribe.next({ error: true, buffer: data })
      })
      command.on('error', () => {
        subscribe.next({ error: true })
      })
      command.on('close', () => {
        if (cmd === this.ffmpegCmd) {
          Logger.warn(`Closed command: "${[cmd, ...args].join(' ')}"`)
        }
        subscribe.next({ error: false, disconnected: true })
      })
    })
  }

  getVideoBuffer (config: ConnectRtspDto): Observable<Buffer> {
    const {
      input: url,
      quality,
      rate = 30,
      resolution
    } = config
    const args = [
      '-loglevel', 'quiet',
      '-i', url,
      '-r', rate.toString(),
      ...(quality !== undefined ? ['-q:v', quality.toString()] : []),
      ...(resolution ? ['-s', resolution] : []),
      '-f', 'mpegts',
      '-codec:v', 'mpeg1video',
      '-update', '1',
      '-'
    ]
    return this.connectToServer(args, config.input)
      .pipe(
        skipWhile((data) => {
          if (!data.buffer) {
            return false
          }

          if (data.buffer.length <= 1) {
            return
          }

          return false
        }),
        filter(val => !!val),
        mergeMap((data) => {
          if (data.error) {
            return this.getVideoBuffer(config)
          }
          return of(data)
        }),
        map((data) => data.buffer as Buffer)
      )
  }

  getVideoResolution (input: string): Observable<{ width: number, height: number } | null> {
    const args = [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height',
      '-of', 'csv=s=x:p=0',
      input
    ]
    const cmd = 'ffprobe'
    return this.connectToServer(args, input, cmd)
      .pipe(
        map((data) => {
          if (!data.buffer || data.error) {
            return null
          }
          const resolution = data.buffer.toString().trim().split('x').filter(val => !!val)
          if (resolution.length !== 2) {
            return null
          }
          return {
            width: +resolution[0],
            height: +resolution[1]
          }
        })
      )
  }
}
