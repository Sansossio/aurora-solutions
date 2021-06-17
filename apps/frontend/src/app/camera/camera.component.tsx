import React, { useEffect, useState } from 'react'
import { CameraList } from '@aurora-solutions/api-interface'
import { Player } from '../player/player.component'
import io from 'socket.io-client'

import './camera.scss'

const DEFAULT_SIZE = '800x600'

export function Camera ({ camera }: { camera: CameraList }) {
  const [isMotion, setIsMotion] = useState(false)

  function getSize () {
    if (!camera.rtsp.resolution) {
      return DEFAULT_SIZE
    }
    function getBetterSize (val: number) {
      const interval = 20
      return Math.floor(val / interval) * interval
    }
    return `${getBetterSize(camera.rtsp.resolution.width)}x${getBetterSize(camera.rtsp.resolution.height)}`
  }

  useEffect(() => {
    const socket = io('http://localhost:3333/cameras', { transports: ['websocket'] })
    socket.on('connect', () => {
      socket.emit('subscribe', camera.name)
    })
    socket.on('isMotion', ({ isMotion, name }) => {
      if (camera.name === name) {
        setIsMotion(isMotion)
      }
    })
    return () => {
      socket.disconnect()
    }
  })

  return (
    <div>
      <p>Camera: {camera.name}</p>
      <p>Is <b>{!isMotion && 'not'}</b> moving</p>
      <Player key={camera.rtsp.url} rtspUrl={camera.rtsp.url} size={getSize()} />
    </div>
  )
}
