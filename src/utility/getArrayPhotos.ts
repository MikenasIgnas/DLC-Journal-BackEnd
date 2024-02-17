import { IncludesPhoto } from '../types'

import readPhoto         from './readPhoto'


export default <T extends IncludesPhoto>(arr: T[]) => {
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index]

    if (element?.photo) {
      element.photo = readPhoto(element.photo)
    }
  }
}