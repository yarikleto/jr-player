import { SAVE_MUSIC } from '../constants/music'

const DEFAULT_STATE: any = {
  meta: {
    path: null,
  },
  music: [],
}

export function music(state = DEFAULT_STATE, action: any) {
  switch(action.type) {
    case SAVE_MUSIC:
      return Object.assign({}, state, action.payload)
    default:
      return state
  }
}


