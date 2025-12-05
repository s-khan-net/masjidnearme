const { Masjid } = require('../models/masjid');
const { Hit } = require('../models/hits');
const got = require('got');
const Logger = require('./loggerService');
const _ = require('lodash')
require('dotenv').config()

async function checkIfCoordinatesAvaillable(lat, lng, rad) {
    //check if exact coordinates are available
    Logger.info(`checking if coordinates - ${lat},${lng} are available`)
    let res = false
    try {
        let d = new Date();
        d.setDate(d.getDate() - 45);
        let filter = {
            $and:
                [{
                    hitLocation: {
                        $near: {
                            $maxDistance: 1000,
                            $geometry: {
                                type: "Point",
                                coordinates: [lng, lat]
                            }
                        }
                    }
                },
                {
                    hitOn: {
                        $gte: d
                    }
                }]
        }
        const coordinates = await Hit.find(filter);
        if (coordinates && coordinates.length > 0) {
            if (coordinates[0].searchRadius && coordinates[0].searchRadius >= rad) {
                Logger.info(`coordinates found with sufficient search radius - ${JSON.stringify(coordinates)}`)
                res = true;
            }
            else {
                Logger.info(`coordinates found but with insufficient search radius - ${JSON.stringify(coordinates)}`)
                res = false;
                await Hit.deleteMany(filter)
                insertNewHit(lat, lng, rad);
            }
        }
        else {
            Logger.info(`hits not found, hence inserting new hit - ${lat},${lng} `)
            insertNewHit(lat, lng, rad);
            res = false;
        }
        return res;
    }
    catch (e) {
        Logger.error(`Error occured when checking hits. Error details - ${e}`)
        return false;
    }
}

function calcDays(d1, d2) {
    //Get the Timestamp
    const date1_time_stamp = d1.getTime();
    const date2_time_stamp = d2.getTime();
    let calc;

    //Check which timestamp is greater
    if (date1_time_stamp > date2_time_stamp) {
        calc = new Date(date1_time_stamp - date2_time_stamp);
    } else {
        calc = new Date(date2_time_stamp - date1_time_stamp);
    }

    //Retrieve the date, month and year
    const calcFormatTmp = calc.getDate() + '-' + (calc.getMonth() + 1) + '-' + calc.getFullYear();
    //Convert to an array and store
    const calcFormat = calcFormatTmp.split("-");
    //Subtract each member of our array from the default date
    const days_passed = Number(Math.abs(calcFormat[0]) - 1);
    const months_passed = Number(Math.abs(calcFormat[1]) - 1);
    const years_passed = Number(Math.abs(calcFormat[2]) - 1970);

    //Convert to days and sum together
    const total_days = (years_passed * 365) + (months_passed * 30.417) + days_passed;

    return total_days;
}
async function insertNewHit(lat, lng, rad) {
    try {
        const hit = new Hit({
            hitLocation: {
                type: "Point",
                coordinates: [Number(lng), Number(lat)]
            },
            hitOn: Date.now(),
            ip: '',
            searchRadius: rad
        });
        await Hit.create(hit);
    }
    catch (e) {
        throw new Error(e)
    }
}

async function getRadarMasjids(lat, lng, rad, limit) {
    var apikey = process.env.googleApiKey;
    var Uri = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${rad}&type=mosque&key=${apikey}`;
    Logger.info(`in radar call with url- ${Uri}`);

    try {
        const response = await got(Uri);
        // console.log(response.body)
        let resObj = JSON.parse(response.body);
        if (resObj['results'].length == 0) {
            Logger.error(`recieved error form places api with url - ${uri}, And error message - ${resObj['error_message']}`)
            throw new Error(resObj['status']);
        }
        var masjids = [];
        resObj['results'].forEach(element => {
            let masjid = {
                _masjidId: 'xoxoxo',
                masjidName: element['name'],
                masjidAddress: {
                    description: element['vicinity'],
                    street: '',
                    zipcode: '',
                    country: '',
                    state: '',
                    city: '',
                    locality: '',
                    phone: '',
                    googlePlaceId: element['place_id']
                },
                masjidLocation: {
                    coordinates: [element['geometry'].location.lng, element['geometry'].location.lat],
                    type: "Point"
                },
                masjidTimings: {
                    fajr: '',
                    zuhr: '',
                    asr: '',
                    maghrib: '',
                    isha: '',
                    jumah: ''
                },
                masjidCreatedby: 'saudkhan03@outlook.com',
                masjidModifiedby: 'saudkhan03@outlook.com',
                masjidCreatedon: Date.now(),
                masjidModifiedon: Date.now(),
                masjidPic: '',
                Distance: '',
                notMasjid: false,
            };
            masjids.push(masjid);
        });
        if (limit > 20) {

            let nextPageUri = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${rad}&type=mosque&key=${apikey}&pagetoken=${resObj['next_page_token']}`;
            Logger.info(`next page url - ${nextPageUri} calles`)
            const newPageResponse = await got(nextPageUri);
            let resObj = JSON.parse(newPageResponse.body);
            resObj['results'].forEach(element => {
                let masjid = {
                    _masjidId: 'xoxoxo',
                    masjidName: element['name'],
                    masjidAddress: {
                        description: element['vicinity'],
                        street: '',
                        zipcode: '',
                        country: '',
                        state: '',
                        city: '',
                        locality: '',
                        phone: '',
                        googlePlaceId: element['place_id']
                    },
                    masjidLocation: {
                        coordinates: [element['geometry'].location.lng, element['geometry'].location.lat],
                        type: "Point"
                    },
                    masjidTimings: {
                        fajr: '',
                        zuhr: '',
                        asr: '',
                        maghrib: '',
                        isha: '',
                        jumah: ''
                    },
                    masjidCreatedby: 'saudkhan03@outlook.com',
                    masjidModifiedby: 'saudkhan03@outlook.com',
                    masjidCreatedon: Date.now(),
                    masjidModifiedon: Date.now(),
                    masjidPic: '',
                    Distance: '',
                    notMasjid: false,
                };
                masjids.push(masjid);
            });
        }

        return masjids;
    } catch (e) {
        Logger.error(`Error occured in radar masjids. Error details - ${e}`)
        return []
        //=> 'Internal server error ...'
    }
}

async function getVerifiedMasjids(lat, lng, rad, limit) {
    try {
        Logger.info(`retreiving verified masjids called with lat-${lat} lng-${lng} radius-${rad}`)
        const verifiedMasjids = await Masjid.find({
            masjidLocation: {
                $near: {
                    $maxDistance: rad || 2000,
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    }
                }
            }
        });
        return verifiedMasjids;
    }
    catch (e) {
        Logger.error(`Error occured while getting verified masjids. Error details - ${e}`)
        return [];
    }

}
async function getMasjidsByCoordinates(lat, lng, rad) {
    try {
        Logger.info(`retreiving verified masjids called with lat-${lat} lng-${lng} radius-${rad}`)
        const verifiedMasjids = await Masjid.find({
            masjidLocation: {
                $near: {
                    $maxDistance: rad || 2000,
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    }
                }
            }
        }, 'masjidName masjidAddress masjidLocation masjidTimings');
        return verifiedMasjids;
    }
    catch (e) {
        Logger.error(`Error occured while getting verified masjids. Error details - ${e}`)
        return [];
    }

}
async function getSearchMasjids(query) {
    let res = { metaData: '', masjids: [], message: '', errorDetails: '' }
    try {
        if (query.lat && query.lng) {
            if (query.lat && query.lng) {
                res.masjids = await getMasjidsByCoordinates(query.lat, query.lng, query.rad)
                res.metaData = query.radius || query.rad ? `{lat:${query.lat}, lng:${query.lng}, radius:${query.radius || query.rad}}` : `{lat:${query.lat}, lng:${query.lng}}`
            }
            if (res.masjids.length == 0) {
                res.message = 'Could not retrive masjids for the search query'
            }
            else {
                res.message = `Got ${res.masjids.length} masjids for the search query`
            }
        }
        else if (query.city) {
            if (query.city?.length > 0) {
                res.masjids = await getMasjidsByCity(query.city)
                res.metaData = `{city:${query.city}}`
            }
            if (res.masjids.length == 0) {
                res.message = 'Could not retrive masjids for the search query'
            }
            else {
                res.message = `Got ${res.masjids.length} masjids for the search query`
            }
        }
        else if (query.name) {
            if (query.name?.length > 0) {
                res.masjids = await getMasjidsByMasjidName(query.name)
                res.metaData = `{name:${query.name}}`
            }
            if (res.masjids.length == 0) {
                res.message = 'Could not retrive masjids for the search query'
            }
            else {
                res.message = `Got ${res.masjids.length} masjids for the search query`
            }
        }
    } catch (e) {
        res.metaData = '';
        res.masjids = [];
        res.message = 'Could not retrive masjids for the search query'
        res.errorDetails = e
    }
    finally {
        return res
    }
}
async function getMasjidsByCity(city) {
    try {
        Logger.info(`retreiving verified masjids called with city-${city}`)
        let regex = new RegExp(city, "i");
        const verifiedMasjids = await Masjid.find({ "masjidAddress.city": regex, notMasjid: false }, 'masjidName masjidAddress masjidLocation masjidTimings');
        return verifiedMasjids;
    }
    catch (e) {
        Logger.error(`Error occured while getting verified masjids. Error details - ${e}`)
        return [];
    }
}
async function getMasjidsByMasjidName(name) {
    try {
        Logger.info(`retreiving verified masjids called with masjidName-${name}`)
        let regex = new RegExp(name, "i");
        const verifiedMasjids = await Masjid.find({ masjidName: regex, verified: true, notMasjid: false }, 'masjidName masjidAddress masjidLocation masjidTimings');
        return verifiedMasjids;
    }
    catch (e) {
        Logger.error(`Error occured while getting verified masjids. Error details - ${e}`)
        return [];
    }
}
async function getMasjids(lat, lng, rad, limit) {
    var verifiedmasjids = await getVerifiedMasjids(lat, lng, rad, limit);
    const check = await checkIfCoordinatesAvaillable(lat, lng, rad);
    let masjids = [];
    if (check) {
        verifiedmasjids.forEach(element => {
            element.Distance = distance(lat, lng, element.masjidLocation.coordinates[1], element.masjidLocation.coordinates[0]);
            if (!element.notMasjid)
                masjids.push(element);
        });
    }
    else {
        var radarmasjids = await getRadarMasjids(lat, lng, rad, limit);
        let moved = [];
        const union = [...new Set([...radarmasjids, ...verifiedmasjids])];
        for (let i = 0; i < union.length; i++) {
            for (let j = 0; j < union.length; j++) {
                if (moved.indexOf(j) == -1) {
                    if (union[i].masjidAddress.googlePlaceId == union[j].masjidAddress.googlePlaceId) {
                        if (union[j]._masjidId != 'xoxoxo') {
                            moved.push(i);
                            moved.push(j);
                            if (!union[j].notMasjid) {
                                /** calculating distance is not a server thing anymore.... */
                                // union[j].distance = distance(lat, lng, union[j].masjidLocation.coordinates[1], union[j].masjidLocation.coordinates[0])
                                masjids.push(union[j]);
                            }
                        }
                    }
                }
            }
        }
        for (let i = 0; i < union.length; i++) {
            if (moved.indexOf(i) == -1 && union[i]._masjidId == 'xoxoxo') {
                /** calculating distance is not a server thing anymore.... */
                // union[i].Distance = distance(lat, lng, union[i].masjidLocation.coordinates[1], union[i].masjidLocation.coordinates[0])
                masjids.push(union[i]);
            }
        }
        Logger.info(`radar: ${radarmasjids.length}, verified: ${verifiedmasjids.length}, common: ${masjids.length}`);
    }
    return masjids;
}

async function addMasjid(masjid) {
    try {
        return await Masjid.create(masjid);
    }
    catch (e) {
        Logger.error(`Error occured while adding masjid - ${JSON.stringify(masjid)}. Error details - ${e}`)
    }
}

async function addMasjids(masjids) {
    try {
        return await Masjid.insertMany(masjids);
    }
    catch (e) {
        Logger.error(`Error occured while adding masjids - ${JSON.stringify(masjids)}. Error details - ${e}`)
    }
}

async function updateMasjidWithVerifyFld(masjidId) {
    try {
        return Masjid.updateOne({ _id: masjidId },
            { $set: { verified: true } }, { upsert: true }
        )
    }
    catch (e) {
        Logger.error(`Error occured while updating masjid with id - ${masjidId}. Error details - ${e}`)
    }
}

async function getMasjidByPlaceId(placeId) {
    let masjid = await searchMasjidByPlaceId(placeId)
    if (masjid && masjid.masjidAddress.state && masjid.masjidAddress.country) {
        return masjid;
    }
    else {
        var apikey = process.env.googleApiKey;
        var Uri = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apikey}`;
        try {
            const response = await got(Uri);
            // console.log(response.body);
            let resObj = JSON.parse(response.body);
            if (!resObj.result) {
                throw new Error('Result not retrieved');
            }
            masjid.masjidModifiedon = Date.now()
            let element = resObj.result;

            element.address_components.forEach(comp => {
                let t = comp.types[0];
                switch (t) {
                    case "premise":
                        masjid.masjidAddress.street = comp.short_name;
                        break;
                    case "neighborhood":
                        masjid.masjidAddress.street += comp.short_name;
                        break;
                    case "administrative_area_level_2":
                        masjid.masjidAddress.city = comp.short_name;
                        break;
                    case "sublocality_level_1":
                        masjid.masjidAddress.locality = comp.short_name;
                        break;
                    case "locality":
                        masjid.masjidAddress.locality = masjid.masjidAddress.locality.Length > 1 ? `${masjid.masjidAddress.locality}, ${comp.short_name}` : masjid.masjidAddress.locality = comp.short_name;
                        break;
                    case "administrative_area_level_1":
                        masjid.masjidAddress.state = comp.long_name;
                        break;
                    case "country":
                        masjid.masjidAddress.country = comp.long_name;
                        break;
                    case "postal_code":
                        masjid.masjidAddress.zipcode = comp.long_name;
                        break;
                }
            });

            const result = await updateMasjid(masjid);

            if (result) {
                //send the updated result - masjid with a new _id
                return result;
            }
            else {
                Logger.error(`Error occured while updating masjid - getMasjidByPlaceId. Error details - ${result}`);
                return null;
            }
        } catch (error) {
            Logger.error(`Error occured while getting masjid details from googlePlaceIs - getMasjidByPlaceId. Error details - ${e}`);
            return null;
        }
    }
}

async function searchMasjidByPlaceId(place_id) {
    try {
        return await Masjid.findOne({ "masjidAddress.googlePlaceId": place_id });
    }
    catch (e) {
        Logger.error(`Error occured while getting user with user email - ${email} in getUserByEmail. Error details - ${e}`)
        return null;
    }
}

async function updateMasjid(masjid) {
    try {
        if (masjid._id) {
            masjid.masjidModifiedon = Date.now();
            const filter = { _id: masjid._id };
            const update = { ...masjid };
            return Masjid.findOneAndUpdate(filter, update, {
                new: true
            })
        }
        else {
            throw new Error('Masjid _id is not defined');
        }
    }
    catch (e) {
        Logger.error(`Error occured while updating masjid  - ${JSON.stringify(masjid)}. Error details - ${e}`)
    }
}

function distance(lat1, lon1, lat2, lon2, unit = 'K') {
    var radlat1 = Math.PI * Number(lat1) / 180
    var radlat2 = Math.PI * lat2 / 180
    var theta = Number(lon1) - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist
}

module.exports = {
    checkIfCoordinatesAvaillable,
    getVerifiedMasjids,
    // getRadarMasjids,
    getMasjids,
    getSearchMasjids,
    getMasjidByPlaceId,
    addMasjid,
    addMasjids,
    updateMasjid,
    updateMasjidWithVerifyFld
};