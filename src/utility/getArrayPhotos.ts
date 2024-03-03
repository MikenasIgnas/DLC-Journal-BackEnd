import { IncludesPhoto } from '../types'
import readPhoto from './readPhoto'

export default async<T extends IncludesPhoto>(arr: T[]) => {
  const newArr = []
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index]

    if (element?.photo) {
      try {
        const photo = await readPhoto(element.photo)
        newArr.push({...element, photo})
      } catch (error) {
        newArr.push({...element, photo: ''})
      }
    } else {
      newArr.push(element)
    }
  }
  return newArr
}