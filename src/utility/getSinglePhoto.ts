import { IncludesPhoto } from '../types'

import readPhoto         from './readPhoto'


export default <T extends IncludesPhoto>(obj: T | null) => {
  if (obj?.photo) {
    obj.photo = readPhoto(obj.photo)
  }
}