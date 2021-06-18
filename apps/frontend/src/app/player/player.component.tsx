import React from 'react'
import { environment } from '../../environments/environment'
import io, { Socket } from 'socket.io-client'

import './player.scss'
import { PlayerProps } from './type/player.props'
import { PlayerConfig } from './player.config'

// eslint-disable-next-line
const JSMpeg = require('@cycjimmy/jsmpeg-player')

// Remove this shit
;(module as any).hot.invalidate = () => {
  window.location.reload()
}

export class Player extends React.Component<PlayerProps, Object> {
  // @ts-expect-error Ignore error bc this will be instantiate on didMount
  private socket: Socket

  private videoWrapperRef: HTMLDivElement | null = null
  private player: typeof JSMpeg.VideoElement

  private cameraEvents () {
    this.socket = io(environment.ws.cameraEvents, { transports: ['websocket'] })
    this.socket.on('connect', () => {
      this.socket.emit('subscribe', this.props.camera.name)
    })
    this.socket.on('isMotion', ({ isMotion, name }) => {
      if (this.props.camera.name === name) {
        this.props.isMoving(isMotion)
      }
    })
  }

  private getSize () {
    const { camera } = this.props
    if (!camera.rtsp.resolution) {
      return PlayerConfig.defaultSize
    }
    function getBetterSize (val: number) {
      const interval = 20
      return Math.floor(val / interval) * interval
    }
    return `${getBetterSize(camera.rtsp.resolution.width)}x${getBetterSize(camera.rtsp.resolution.height)}`
  }

  componentWillUnmount () {
    this.player?.destroy()
    this.socket?.disconnect()
  }

  shouldComponentUpdate (nextProps: PlayerProps) {
    return nextProps.camera.rtsp !== this.props.camera.rtsp
  }

  componentDidMount () {
    const url = `${environment.backend.proxy}/stream/camera?rtsp=${encodeURIComponent(this.props.camera.rtsp.url)}`
    this.player = new JSMpeg.VideoElement(this.videoWrapperRef, url)

    this.cameraEvents()
  }

  render () {
    return (
      <div className={`videoWrapper size-${this.getSize()}`} ref={videoWrapper => {
        this.videoWrapperRef = videoWrapper
      }}></div>
    )
  }
}
