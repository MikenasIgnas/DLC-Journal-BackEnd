import { createTransport }        from 'nodemailer'

import { convertUTCtoLocalTime }  from '../../helpers'
import { Guest }                  from '../../types'

interface EmailBody {
    companyName:        string | undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    companyEmployees:   any[] | undefined
    scheduledVisitTime: Date | undefined
    guests:             Guest[] | undefined
    carPlates:          string[] | undefined
}

export default async ({
  carPlates,
  companyEmployees,
  companyName,
  guests,
  scheduledVisitTime,
}: EmailBody) => {
  const imagePath         = 'src/Images/signatureLogo.png'

  const convertedDateTime = convertUTCtoLocalTime(scheduledVisitTime)

  const sendEmail = (mailAddress: string) => {
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
        to:          mailAddress,
        subject:     `${companyName}  ${convertedDateTime}`,
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
                  <span>Vizitas į DATAINN</span>
                  <p>Klientas: ${companyName}</p>
                  <p>Data/Laikas: ${convertedDateTime}</p>
                  <p>` +
                    // eslint-disable-next-line max-len
                    `Įmonės atstovai: ${companyEmployees?.map((el) =>`${el.name} ${el.lastname}<br>`).join('')}` +
                  '</p>' +
                  // eslint-disable-next-line max-len
                  `${guests && guests?.length > 0 ? `<p>Palyda: ${guests.map((el) => `${el.name} - ${el.company}<br>`).join('')}</p>` : ''}` +
                  // eslint-disable-next-line max-len
                  `${carPlates && carPlates?.length > 0 ? `<p>Automobilių Nr.: ${carPlates.map((el) => `${el}<br>`).join('')}</p>` : ''}` +
                `</div>
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
  sendEmail(process.env.RECIPIENT_ADDRESS)
  sendEmail(process.env.CARBON_COPY_ADDRESS)
}