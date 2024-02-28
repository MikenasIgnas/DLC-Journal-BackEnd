import fs from 'fs'


export default async (filePath: string) => {
  const img = await fs.promises.readFile(filePath)

  return 'data:image/png;base64,' + Buffer.from(img).toString('base64')
}
