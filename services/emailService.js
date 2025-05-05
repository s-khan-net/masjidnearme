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
        case 'welcome':
            headText = 'Welcome to Masjid Near Me';
            break;
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
       <li style="line-height:2;font-weight:bold;letter-spacing:1px"><a href="https://masjidnear.me" target="_blank"><img src="https://masjidnear.me/public/assets/images/logo.png" alt="masjid near me"/></a></li>
       <li style="letter-spacing:1px">Find the nearest Masjid | Find masjids by location</li>
       <li style="letter-spacing:1px">Anytime Anywhere</li>
       <li>Find the <a href="https://api.masjidnear.me/legal" target="_blank">private policy</a?</li>
       <div style="display: flex;justify-content: space-between;width:20%;margin:0 auto;margin-top:24px">
        <div><a href="https://www.youtube.com/channel/UCtprr8S9fTT5rnZ4_ZF9_eQ" target="_blank"><img src="https://masjidnear.me/public/assets/images/smnu/y_24X24.png"></a></div>
        <div style="margin: 0px 12px 0px 12px;"><a href="https://www.youtube.com/channel/UCtprr8S9fTT5rnZ4_ZF9_eQ" target="_blank"><img src="https://masjidnear.me/public/assets/images/smnu/y_24X24.png"></a></div>
        <div><a href="https://www.youtube.com/channel/UCtprr8S9fTT5rnZ4_ZF9_eQ" target="_blank"><img src="https://masjidnear.me/public/assets/images/smnu/y_24X24.png"></a></div>
        </div>
        </div>
    </div></div>
    </div>`
    switch (type) {
        case 'welcome':
            htmlBody = `${header}
            <p>Hi ${user.userprofile.firstName},</p>
            <div>You have successfully registered with us</div>
            <div>
            <p>
            Please use masjid near me to find masjids near your location. You can view the masjids on a map, and also get the details of the masjid, salaah times, and other details.
            </p>
            <p>You can login to the <a href="https://masjidnear.me" target="_blank">مسجد near me </a> using the email and password you used to register with us.</p>
            <p> Please verify as many masjids as you can and help others and may Allah reward you efforts. &nbsp;Jazakallahu
            khairan</p>
            </div>
            ${footer}
            `
            mailOptions.to = user.userEmail;
            mailOptions.subject = "Welcome to " + "مسجد" + " near me ";
            mailOptions.html = htmlBody;
            break;
        case 'delete':
            htmlBody = `${header}
            <p>Hi ${user.userprofile.firstName},</p>
            <div>We are sorry to see you go.</div>
            <div>We have deleted your account with email - ${user.userEmail}</div>
            <div>The android app and the web app will work as before, but you will not be able to login to the app.</div>
            <div>Please use <a href="https://masjidnear.me" target="_blank">مسجد near me </a> to find masjids near your location. You can view the masjids on a map, and also get the details of the masjid, salaah times, and other details.</div>
             ${footer}
            `

            mailOptions.to = user.userEmail;
            mailOptions.subject = "مسجد" + " near me  - User Account Deletion ";
            mailOptions.html = htmlBody;
            break;
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
               <p>Hi ${user.userprofile.firstName},</p>
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
                <p>Hi ${user.userprofile.firstName},</p>
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
                <p>Hi ${user.userprofile.firstName},</p>
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
                        reject(false)
                    } else {
                        Logger.info(`${type} mail sent to ${user.userEmail || user.masjidModifiedby}. response-: ${info.response}`);
                        resolve(true)
                    }
                });
            } catch (error) {
                Logger.error(`Error occured while sending email. Error details - ${error}`)
                reject(false)
            }
        })
    }
    else {
        return new Promise((resolve, reject) => {
            reject(false)
        })
    }
}

module.exports = {
    sendMail
}