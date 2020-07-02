"use strict";
require('dotenv').config()

const nodemailer = require("nodemailer");
const readline = require('readline');
const fs = require('fs');

const readFile = (filename, encoding) => {
  try {
    return fs.readFileSync(filename).toString(encoding);
  }
  catch (e) {
    return null;
  }
};

const textBody=readFile("mail.txt","utf8")
const htmlBody=readFile("mail.html","utf8")

const readInterface = readline.createInterface({
    input: fs.createReadStream(process.argv[2]),
//    output: process.stdout,
//    console: false
});

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT),
  secure: (process.env.MAIL_SECURE === 'true'), // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER, // generated ethereal user
    pass: process.env.MAIL_PASSWORD, // generated ethereal password
  },
});

async function main() {
  for await (const line of readInterface) {
    sendMail(line).catch((err) => {
      console.log(err)
      fs.appendFile('error.txt', line + "\n", function (err) {
        if (err) throw err;
        console.log(line + " " + err)
      });
    });
    await sleep(process.env.DELAY)
  }
}

function sleep(ms){
  return new Promise(resolve=>{
    setTimeout(resolve,ms)
  })
}


async function sendMail(mailTo) {
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Gamzix" <sales@gamzix.com>', // sender address
    to: mailTo, // list of receivers
    subject: "Go Wild test mail", // Subject line
    text: textBody, // plain text body
    html: htmlBody, // html body
  })

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  fs.appendFile('success.txt', mailTo + "\n", function (err) {
    if (err) throw err;
    console.log("SUCCESS: " + mailTo + " - " + info.messageId + "\n");
  });
}

main()
