import React, { useEffect, useRef } from 'react'
import { environment } from '../../environments/environment'
import { CameraList } from '@aurora-solutions/api-interface'

import './camera.scss'

// eslint-disable-next-line
const JSMpeg = require('@cycjimmy/jsmpeg-player')

// Remove this shit
;(module as any).hot.invalidate = () => {
  window.location.reload()
}

export function Camera ({ camera }: { camera: CameraList }) {
  const { proxy } = environment.backend
  const videoWrapper = useRef<any>(null)

  let player: typeof JSMpeg.VideoElement

  useEffect(() => {
    if (!player) {
      const url = `${proxy}/stream/camera?rtsp=${encodeURIComponent(camera.rtsp.url)}`
      // eslint-disable-next-line
      player = new JSMpeg.VideoElement(videoWrapper.current, url)
    }
    return () => {
      player.destroy()
    }
  })

  return (
    <div>
      <p>Camera: {camera.name}</p>
      <div className='videoWrapper size-100x100' ref={videoWrapper}></div>
    </div>
  )
}
