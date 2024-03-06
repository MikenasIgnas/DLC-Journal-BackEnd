
export default () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'

  const getRandomChar = (string: string) => {
    return string[Math.floor(Math.random() * string.length)]
  }

  const randomLetters = getRandomChar(letters) + getRandomChar(letters)
  const randomNumbers = getRandomChar(numbers) + getRandomChar(numbers)

  const combined = randomLetters + randomNumbers

  const shuffled = combined.split('').sort(() => 0.5 - Math.random()).join('')

  return shuffled
}