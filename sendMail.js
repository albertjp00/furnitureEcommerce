const nodemailer= require("nodemailer")

require("dotenv").config()

const transporter = nodemailer.createTransport({
    service:"gmail",
    host : "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });



    // send mail with defined transport object
    const mailOptions = {
      from: {
        name: 'Me',
        address:process.env.SMTP_MAIL
      }, // sender address
      to: "albertjpaul@gmail.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?.......", // plain text body
      html: "<b>Hello world?</b>", // html body
      
    };

    const sendMail = async() => {
        try{
            const a = await transporter.sendMail(mailOptions)
            console.log("Email sent");
            // console.log(a);
        }catch(error)
        {
            console.log(error.message);
        }
    }

    sendMail(transporter,mailOptions)