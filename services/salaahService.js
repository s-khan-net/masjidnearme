const got = require('got');
const geoTz = require('geo-tz');
const moment = require('moment-timezone');

async function getTimes(lat, lng, method, school) {

    try {
        const d = new Date(moment().tz(geoTz(lat, lng)[0]).format());

        var unixTimestamp = d.getTime() / 1000
        let Uri = `http://api.aladhan.com/v1/timings/${unixTimestamp}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`;
        // console.log(Uri);
        const response = await got(Uri);

        let timingsobj = JSON.parse(response.body);
        console.log(timingsobj)
        let active = '';
        console.log(d);
        // var d2 = new Date(2001,7,14,4,58)
        var d2 = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Number(timingsobj.data.timings.Fajr.split(':')[0]), Number(timingsobj.data.timings.Fajr.split(':')[1]));
        console.log(d.getFullYear(), d.getMonth(), d.getDate(), Number(timingsobj.data.timings.Fajr.split(':')[0]), Number(timingsobj.data.timings.Fajr.split(':')[1]), d.getSeconds(), d.getMilliseconds(), d2);
        times = {
            "salaahtimes": timingsobj.data.timings,
            "gregorian": timingsobj.data.date.gregorian,
            "hijri": timingsobj.data.date.hijri
        }

        return times;
    }
    catch (e) { console.log(e) }

}

module.exports = {
    getTimes
}