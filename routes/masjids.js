const express = require("express");
const router = express.Router();
const masjidService = require("../services/masjidService");
const emailService = require("../services/emailService");
const auth = require("../middleware/auth");
const Logger = require("../services/loggerService");

router.get("/:lat/:lng/:radius/:limit/:verified?", async (req, res) => {
    try {
        if (!(req.params.lng && req.params.lat)) {
            Logger.warn("the request does not contain latitude and/or longitude values")
            return res.status(402).send(`the request does not contain latitude and/or longitude values`);
        }
        else {
            Logger.info(`/:lat/:lng/:radius/:limit/:verified /:${req.params.lat}/:${req.params.lng}/:${req.params.radius}/:${req.params.limit}/:${req.params.verified}`)
            if (req.params.verified) {
                const verifiedMasjids = await masjidService.getVerifiedMasjids(req.params.lat, req.params.lng, req.params.radius, req.params.limit);
                if (verifiedMasjids.length == 0) return res.status(204).send("No masjids found");
                if (!verifiedMasjids) return res.status(402).send(`the Masjids with the request parameters could not be found`);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.status(200).send(verifiedMasjids);
            }
            else {
                let toInsert = [];
                const masjids = await masjidService.getMasjids(req.params.lat, req.params.lng, req.params.radius, req.params.limit);
                // if (masjids.length == 0) return res.status(204).send("No masjids found");
                if (!masjids) return res.status(402).send(`the Masjids with the request parameters could not be found`);
                res.status(200).send(masjids);
                masjids.forEach(element => {
                    if (element._masjidId == "xoxoxo") {
                        element._masjidId = "";
                        element.verified = false;
                        toInsert.push(element)
                    }
                });
                if (toInsert.length > 0) {
                    await masjidService.addMasjids(toInsert)
                }
            }
        }

    }
    catch (e) {
        res.status(500).send(`Error occured while retreiving masjids ${e}`);
    }

});

router.get("/details/:placeId", auth, async (req, res) => {
    try {
        const masjid = await masjidService.getMasjidByPlaceId(req.params.placeId);
        if (!masjid) return res.status(402).send(`the Masjid with the placeId could not be found`);
        res.status(200).send(JSON.stringify(masjid));
    }
    catch (e) {
        res.status(500).send(`Error occured while retreiving details for masjid ${e}`);
    }
});

router.post("/", auth, async (req, res) => {
    try {
        masjid = req.body.masjid;
        // console.log(req.body);
        const result = await masjidService.addMasjid(masjid);
        res.status(201).json(`{"created":"OK", "message":"Masjid added successfully", "details": ${JSON.stringify(result)}}`);
    }
    catch (e) {
        console.log(e);
        res.status(400).json(`{"created":"error", "message":"Masjid could not be created, please check error details", "details":${result}}`)
    }
});

router.put("/", auth, async (req, res) => {
    try {
        masjid = req.body.masjid;
        if (!masjid && !masjid._id)
            return res.status(400).send(`{"updated":"Bad request", "message":"Masjid could not be updated, please check error details", "details":"Masjid to updated is not defined bu _id and/or google place id, please check the masjid to be updated."}`)

        masjid.masjidCreatedon = Date.parse(masjid.masjidCreatedon)

        const result = await masjidService.updateMasjid(masjid);
        Logger.info(`Masjid with id ${masjid._id} was updated with new details,  "details": "Masjid was updated and the details of the masjid can be checked using v1/masjids/details/${result.masjidAddress.googlePlaceId}`);
        res.status(200).send(`{"updated":"OK", "message":"Masjid updated successfully"}`);

        const emailResult = await emailService.sendMail(req.body.type || "updateMasjid", result);
        if (!emailResult) {
            Logger.error(`Could not send email of type - ${req.body.type}`);
        }
    }
    catch (e) {
        Logger.error(e);
        res.status(400).send(`{"updated":"Error", "message":"Masjid could not be updated, please check error details", "details":${e}}`)
    }
})

router.get("/search", async (req, res) => {
    try {
        Logger.info(`search query called with search url-${req.originalUrl}`)
        if (req.originalUrl.indexOf('?') > -1) {
            const result = await masjidService.getSearchMasjids(req.query);
            const resultToSend = {
                code:200,
                status:'OK',
                data:result
            }
            return res.status(200).send(JSON.stringify(resultToSend))
        }
        else {
            return res.status(402).send(`the Masjids with the request parameters could not be found`);
        }
    } catch (e) {
        res.status(500).send(`Error occured while retreiving masjids - ${e}`);
    }
})
module.exports = router;