const emailConfig = require('../config/emails');
const nodemailer = require('nodemailer');
const fs= require('fs');
const util = require('util');
const ejs= require('ejs');




let transport = nodemailer.createTransport({
    host : emailConfig.host,
    port : emailConfig.port,
    auth: {
        user : emailConfig.user,
        pass: emailConfig.pass
    }
});

// Utilizar templates de Handlebars


exports.enviarEmail = async (opciones) => {

    console.log(opciones);
    const archivo = __dirname+ `/../views/emails/${opciones.archivo}.ejs`;
    const compilado = ejs.compile(fs.readFileSync(archivo, 'utf8'));
    const html = compilado({url: opciones.url});

    const opcionesEmail = {
        from:'Meeti <noreply@devjobs.com',
        to: opciones.usuario.email,
        subject : opciones.subject, 
        html
    }

    const sendMail = util.promisify(transport.sendMail, transport);
    return sendMail.call(transport, opcionesEmail);
 
}