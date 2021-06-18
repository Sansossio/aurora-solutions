import React, { useState } from 'react'
import { CameraList } from '@aurora-solutions/api-interface'
import { Player } from '../player/player.component'

export function Camera ({ camera }: { camera: CameraList }) {
  const [isMotion, setIsMotion] = useState(false)

  return (
    <div>
      <p>Camera: {camera.name}</p>
      <p>Is <b>{!isMotion && 'not'}</b> moving</p>
      <Player key={camera.rtsp.url} camera={camera} isMoving={setIsMotion} />
    </div>
  )
}
