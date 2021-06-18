import { CameraList } from '@aurora-solutions/api-interface'

export interface PlayerProps {
  camera: CameraList
  isMoving: (isMotion: boolean) => void
}
