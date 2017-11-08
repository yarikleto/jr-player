import { SAVE_MUSIC } from '../constants/music'

export function saveMusic(music: any) {
  return {
    type: SAVE_MUSIC,
    payload: music,
  }
}