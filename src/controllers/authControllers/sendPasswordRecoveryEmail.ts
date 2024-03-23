import { createTransport } from 'nodemailer'

interface EmailBody {
  email: string
  token: string
}


export default async ({ email, token }: EmailBody) => {
  const imagePath = 'src/Images/signatureLogo.png'

  const urlPath = process.env.PASSWORD_RECOVERY_PAGE_PATH

  return new Promise((resolve, reject) => {
    const transporter = createTransport({
      host:   process.env.SMTP_ADDRESS,
      port:   process.env.SMTP_PORT,
      secure: false,
      auth:   {
        user: '',
        pass: '',
      },
    })

    const mail_configs = {
      from:        process.env.SENDER_ADDRESS,
      to:          email,
      subject:     'Slaptažodžio atstatymas',
      attachments: [{
        filename: 'signatureLogo.png',
        path:     imagePath,
        cid:      'unique@nodemailer.com',
      }],
      html:
      `<!DOCTYPE html>
        <html lang="en" >
          <head>
            <meta charset="UTF-8">
          </head>
          <body>
            <div style="font-family: Helvetica,Arial,sans-serif;overflow:auto;line-height:2">
              <div style="margin:50px auto;width:70%;padding:20px 0">
                <p style="font-size:1.1em">Sveiki, </p>
                <div>Atkurti slaptažodį galite su šia 
                <a href="${urlPath}?token=${token}">nuoroda</a>
                </div>
                </div>
              <div style="margin:50px auto;width:70%;padding:20px 0">
                <img src="cid:unique@nodemailer.com"/>
                <p style="font-size: 10px">Pagarbiai,</p>
                <p style="font-size: 10px">Monitoringo centras</p>
                <p style="font-size: 10px">
              UAB Duomenų logistikos centras  |  A. Juozapavičiaus g. 13  |  LT-09311 Vilnius
                </p>
                <p style="font-size: 10px">Mob. +370 618 44 445;  +370 674 44 455 |</p>
                <p style="font-size: 10px">El.paštas noc@datalogistics.lt</p>
                <p style="font-size: 10px">www.datalogistics.lt</p>
              </div>
            </div>
          </body>
        </html>`,
    }

    transporter.sendMail(mail_configs, function (error) {
      if (error) {
        return reject({ message: 'An error has occurred' })
      }
      return resolve({ message: 'Email sent successfully' })
    })
  })
}