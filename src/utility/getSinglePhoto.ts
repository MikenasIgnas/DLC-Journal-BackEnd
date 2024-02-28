import { IncludesPhoto } from '../types'

import readPhoto         from './readPhoto'


export default <T extends IncludesPhoto> (obj: T | null) => {
  if (obj?.photo) {
    try {
      const photo =  readPhoto(obj.photo)
      return photo
    } catch (error) {
      return ''
    }
  }
}