import React, { useEffect, useRef } from 'react'
import { environment } from '../../environments/environment'

import './camera.scss'

// eslint-disable-next-line
const JSMpeg = require('@cycjimmy/jsmpeg-player')

export function Camera ({ camera }: { camera: any }) {
  const { proxy } = environment.backend
  const videoWrapper = useRef<any>(null)

  useEffect(() => {
    const url = `${proxy}/stream/camera?rtsp=${encodeURIComponent(camera.rtspUrl)}`
    void new JSMpeg.VideoElement(videoWrapper.current, url)
  })

  return (
    <div>
      <p>Camera: {camera.name}</p>
      {/* <canvas id={canvasIdCamera}></canvas> */}
      <div className='videoWrapper' ref={videoWrapper}></div>
    </div>
  )
}
