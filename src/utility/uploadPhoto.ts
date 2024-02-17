import multer from 'multer'


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, (process.env.IMG_PATH))
  },
  filename: function (req, file, cb) {
    const extArray = file.mimetype.split('/')
    const extension = extArray[extArray.length - 1]

    cb(null, Date.now() + '.' + extension)
  },
})


export const upload = multer({ storage: storage })