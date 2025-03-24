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
            return res.send(`the request does not contain latitude and/or longitude values`).status(402);
        }
        else {
            Logger.info(`/:lat/:lng/:radius/:limit/:verified /:${req.params.lat}/:${req.params.lng}/:${req.params.radius}/:${req.params.limit}/:${req.params.verified}`)
            if (req.params.verified) {
                const verifiedMasjids = await masjidService.getVerifiedMasjids(req.params.lat, req.params.lng, req.params.radius, req.params.limit);
                if (verifiedMasjids.length == 0) return res.status(204).send("No masjids found");
                if (!verifiedMasjids) return res.status(402).send(`the Masjids with the request parameters could not be found`);
                res.send(verifiedMasjids).status(200)
            }
            else {
                let toInsert = [];
                const masjids = await masjidService.getMasjids(req.params.lat, req.params.lng, req.params.radius, req.params.limit);
                // if (masjids.length == 0) return res.status(204).send("No masjids found");
                if (!masjids) return res.send(`the Masjids with the request parameters could not be found`).status(402);
                res.send(masjids).status(200)
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
        res.send(`Error occured while retreiving masjids ${e}`).status(500);
    }

});

router.get("/details/:placeId", auth, async (req, res) => {
    try {
        const masjid = await masjidService.getMasjidByPlaceId(req.params.placeId);
        if (!masjid) return res.status(402).send(`the Masjid with the placeId could not be found`);
        res.send(JSON.stringify(masjid)).status(200);
    }
    catch (e) {
        res.send(`Error occured while retreiving details for masjid ${e}`).status(500);
    }
});

router.post("/", auth, async (req, res) => {
    try {
        masjid = req.body.masjid;
        // console.log(req.body);
        const result = await masjidService.addMasjid(masjid);
        res.json(`{"created":"OK", "message":"Masjid added successfully", "details": ${JSON.stringify(result)}}`).status(201);
    }
    catch (e) {
        console.log(e);
        res.json(`{"created":"error", "message":"Masjid could not be created, please check error details", "details":${result}}`).status(400)
    }
});

router.put("/", auth, async (req, res) => {
    try {
        masjid = req.body.masjid;
        if (!masjid && !masjid._id)
            return res.send(`{"updated":"Bad request", "message":"Masjid could not be updated, please check error details", "details":"Masjid to updated is not defined bu _id and/or google place id, please check the masjid to be updated."}`).status(400)

        masjid.masjidCreatedon = Date.parse(masjid.masjidCreatedon)

        const result = await masjidService.updateMasjid(masjid);
        Logger.info(`Masjid with id ${masjid._id} was updated with new details,  "details": "Masjid was updated and the details of the masjid can be checked using v1/masjids/details/${result.masjidAddress.googlePlaceId}`);
        res.send(`{"updated":"true", "message":"Masjid updated successfully"}`).status(200);

        const emailResult = await emailService.sendMail(req.body.type || "updateMasjid", result);
        if (!emailResult) {
            Logger.error(`Could not send email of type - ${req.body.type}`);
        }
    }
    catch (e) {
        Logger.error(e);
        res.send(`{"updated":"false", "message":"Masjid could not be updated, please check error details", "details":${e}}`).status(400)
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
            return res.send(JSON.stringify(resultToSend)).status(200)
        }
        else {
            return res.send(`the Masjids with the request parameters could not be found`).status(402);
        }
    } catch (e) {
        res.send(`Error occured while retreiving masjids - ${e}`).status(500);
    }
})
module.exports = router;