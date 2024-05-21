(function ($) {
    $.fn.timings = function (options) {
        var defaults = {
            latitude: 52.4533811,
            longitude: -1.92811,
            method: 2,
            today: '15-04-2023',
            school: 1
        }
        options = $.extend(defaults, options);
        var elementId = this[0].id;
        loadTimes(this);

        function loadTimes(p) {
            $('#' + elementId).html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;getting salaah times...&nbsp;&nbsp;&nbsp;&nbsp;')
            $('#' + elementId).addClass('timings-container')
            $.ajax({
                type: "GET",
                url: `https://api.aladhan.com/v1/timings/${options.today}?latitude=${options.latitude}&longitude=${options.longitude}&method=${options.method}&school=${options.school}`,
                crossDomain: true,
                cache: false,
                dataType: 'JSON',
                success: function (data) {
                    let times = data.data.timings
                    delete times.Sunrise;
                    delete times.Sunset;
                    delete times.Imsak;
                    delete times.Firstthird;
                    delete times.Lastthird;
                    delete times.Midnight;
                    let date = `${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`
                    let val = []
                    Object.keys(times).forEach((key, index) => {
                        val.push({ "name": key, "val": times[key] });
                    })
                    buildhtml(val, date);
                },
                error: function (errordata) {
                    if (errordata.state() == 'rejected' && errordata.readyState == 0) {
                        $('#' + elementId).html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Error loading Salaah times&nbsp;&nbsp;&nbsp;&nbsp;')
                    }
                    else {
                        $('#' + elementId).html('')
                    }
                }
            });
        }
        function buildhtml(times, date) {
            let sTimes = '';
            let maghrib = times.filter(e => { return e.name == 'Maghrib' })[0].val
            times.forEach(element => {
                sTimes += `<div class="stb">${element.name}<br>${element.val}</div>`
            });
            $('#' + elementId).html(`<div class="widgetContainer"><div id="timesObject" style="display:none">${maghrib}</div><div class="load">${date}</div><div>${sTimes}</div></div>`)
            // console.log(times)
        }
    }
}(jQuery));