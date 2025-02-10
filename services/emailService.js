const nodemailer = require("nodemailer");
const Logger = require('./loggerService');

let transporter = nodemailer.createTransport({
    host: 'mail.masjidnear.me',
    port: 25,
    rejectUnauthorized: false,
    auth: {
        user: process.env.email,
        pass: process.env.emailPassword
    },
    tls: {
        rejectUnauthorized: false
    },
    attachments: [{
        filename: 'bismillah.jpg',
        path: __dirname + '/images/bismillah.jpg',
        cid: 'bism'
    },
    {
        filename: 'logo.png',
        path: __dirname + '/images/logo.png',
        cid: 'logo'
    }]
});

var mailOptions = {
    from: process.env.email,
    to: 'saud@saudkhan.net',
    subject: 'Sending Email using Node.js',
    html: 'That was easy!'
};

function sendMail(type, user) {
    let headText = '';
    switch (type) {
        case 'verify':
            headText = 'Verify yourself'
            break;
        case 'verifyMasjid':
            headText = `You've verified a masjid`
            break;
        case 'updateMasjid':
            headText = `You've updated a masjid`
            break;
        case 'editTimes':
            headText = `You've edited the salah times of a masjid`
            break;
        default:
            break;
    }
    let htmlBody = '';
    let header = `<div style="margin-left:12px; margin-top:12px">
    <div style="padding:12px; text-align:center"><img src="https://api.masjidnear.me/assets/images/bismillah.png" alt="Bismillah"/></div>
    <div style="border:1px solid #CCC;padding:28px">
    <div style="display:inline-flex">
    <div><img src="https://masjidnear.me/public/assets/images/logo.png" alt="masjid near me"/></div>
    <div style="font-size:medium; font-weight:bold; padding-left:12px;align-items: flex-end;display: inline-flex;">${headText}</div>
    </div>
       <div>
          <hr>
       </div>`
    let footer = `<div style="margin-top:12px">
       <hr>
    </div>
    <div style="margin-top:12px;">
       <ul style="list-style:none;">
       <li style="line-height:2;font-weight:bold;letter-spacing:1px"><a href="https://masjidnear.me" target="_blank">masjidnear.me</a></li>
       <li style="letter-spacing:1px">Find the nearest Masjid | Find masjids by location</li>
       <li style="letter-spacing:1px">Anytime Anywhere</li>
       <li>Please view the complete <a href="https://masjidnear.me/Legal/Home" target="_blank">private policy</a?</li>
       <div style="display: flex;justify-content: space-between;width:20%;margin:0 auto;margin-top:24px">
        <div><a href="https://www.youtube.com/channel/UCtprr8S9fTT5rnZ4_ZF9_eQ" target="_blank"><img src="https://masjidnear.me/public/assets/images/smnu/y_24X24.png"></a></div>
        <div style="margin: 0px 12px 0px 12px;"><a href="https://www.youtube.com/channel/UCtprr8S9fTT5rnZ4_ZF9_eQ" target="_blank"><img src="https://masjidnear.me/public/assets/images/smnu/y_24X24.png"></a></div>
        <div><a href="https://www.youtube.com/channel/UCtprr8S9fTT5rnZ4_ZF9_eQ" target="_blank"><img src="https://masjidnear.me/public/assets/images/smnu/y_24X24.png"></a></div>
        </div>
        </div>
    </div></div>
    </div>`
    switch (type) {
        case 'verify':
            let url = `${process.env.verifyUrl}?code=${user.confirmCode}`
            htmlBody = `${header}
               <p>Hi ${user.userprofile.firstName},</p>
               <div>Verify yourself below to sign in to your masjidnear.me account for </div>
               <div style="margin-top:12px;margin-bottom:12px;color:#013220;text-decoration:underline">${user.userEmail}</div>
               <div style="padding:7px; background:#04AA6D;width:120px;text-align:center;border-radius:4px"><a href="${url}" style="color:#FFF;text-decoration:none;font-weight:bold">verify me</a></div>
               <div style="margin-top:12px;margin-bottom:12px">or, copy this url and paste in your browser:</div>
               <div>${url}</div>
               ${footer}
            `

            mailOptions.to = user.userEmail;
            mailOptions.subject = "مسجد" + " near me  - User Verification ";
            mailOptions.html = htmlBody;
            break;
        case 'verifyMasjid':
            htmlBody = `${header}
               <p>Hi There,</p>
               <div>You have verified </div>
               <div style="margin-top:12px;margin-bottom:12px;color:#013220;font-weight: bold; letter-spacing:1px">${user.masjidName}</div>
               <p>this will appear on the map of masjid near me and you can add/update the salaah times for this masjid</p>
               <p>Insha Allah, this will be helpful for others, and may Allah reward for this action.<br><br>Please continue to do the same<br><br>Jazakumullahu Khair.</p>
               ${footer}`

            mailOptions.to = user.masjidModifiedby;
            mailOptions.subject = "مسجد" + " near me  - User Verification ";
            mailOptions.html = htmlBody;
            break;
        case 'updateMasjid':
            htmlBody = `${header}
                <p>Hi There,</p>
                <div>You have updated the details of </div>
                <div style="margin-top:12px;margin-bottom:12px;color:#013220;font-weight: bold; letter-spacing:1px">${user.masjidName}</div>
                <p>Insha Allah, this will be helpful for others, and may Allah reward for this action.<br><br>Please continue to do the same<br><br>Jazakumullahu Khair.</p>
                ${footer}`

            mailOptions.to = user.masjidModifiedby;
            mailOptions.subject = "مسجد" + " near me  - User Verification ";
            mailOptions.html = htmlBody;
            break;
        case 'editTimes':
            htmlBody = `${header}
                <p>Hi There,</p>
                <div>You have updated the Salaah times of </div>
                <div style="margin-top:12px;margin-bottom:12px;color:#013220;font-weight: bold; letter-spacing:1px">${user.masjidName}</div>
                <p>Insha Allah, this will be helpful for others, and may Allah reward for this action.<br><br>Please continue to do the same<br><br>Jazakumullahu Khair.</p>
                ${footer}`

            mailOptions.to = user.masjidModifiedby;
            mailOptions.subject = "مسجد" + " near me  - User Verification ";
            mailOptions.html = htmlBody;
            break;
        default:
            break;
    }
    if (htmlBody.length > 0) {
        return new Promise((resolve, reject) => {
            try {
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        Logger.error(`Error occured while sending email. Error details - ${e}`)
                        resolve(false)
                    } else {
                        Logger.info(`${type} mail sent to ${user.userEmail || user.masjidModifiedby}. response-: ${info.response}`);
                        resolve(true)
                    }
                });
            } catch (error) {
                Logger.error(`Error occured while sending email. Error details - ${error}`)
                resolve(false)
            }
        })
    }
    else {
        return new Promise((resolve, reject) => {
            resolve(false)
        })
    }
}

module.exports = {
    sendMail
}