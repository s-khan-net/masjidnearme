const express = require('express');
const router = express.Router();
const salaahService = require('../services/salaahService');


router.get('/:lat/:lng/:method/:school', async (req, res) => {
    try {
        const times = await salaahService.getTimes(req.params.lat, req.params.lng, req.params.method, req.params.school);
        res.status(200).send(times);
    }
    catch (e) { }
});

module.exports = router;