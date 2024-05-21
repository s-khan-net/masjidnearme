(function ($) {
    $.fn.flmnu = function (options) {
        var defaults = {
            width: 250,
            toggleMargin: 30,
            items: [],
            float: 'left'
        }
        options = $.extend(defaults, options);

        //getting days
        var d = new Date();
        var weekday = new Array(7);
        weekday[0] = "Sunday";
        weekday[1] = "Monday";
        weekday[2] = "Tuesday";
        weekday[3] = "Wednesday";
        weekday[4] = "Thursday";
        weekday[5] = "Friday";
        weekday[6] = "Saturday";
        var n = weekday[d.getDay()];

        $(this).html('');
        var elemntId = this[0].id;

        if (options.float == 'left')
            $(this).attr('style', 'width:' + options.width + 'px;float:left;margin-top: 60px;');
        else
            $(this).attr('style', 'width:' + options.width + 'px;right:0;margin-top: 60px;');
        $(this).addClass('flmnu');

        $(this).append('<div class="flmnuTimes"></div>');
        if (options.float == 'left')
            $(this).append('<div class="flmnuHeader noselect" id="flmnuHeader">Masjids near you  <span id="toggleIcon" class="glyphicon glyphicon-chevron-left" style="float:right"></span></div>');
        else
            $(this).append('<div class="flmnuHeader noselect" id="flmnuHeader">Masjids near you  <span id="toggleIcon" class="glyphicon glyphicon-chevron-left" style="float:left"></span></div>');
        //$(this).append('<div id="flmnuContentDiv">');
        $(this).append('<ul id="flmnuNav">');

        for (var i = 0; i < options.items.length; i++) {
            var idnum = Number(i) + 1;
            var ustyle = !options.items[i].verified ? 'color:#777' : ''
            var linktext = options.items[i].masjidName;
            var placeid = '';
            if (options.items[i].masjidTimings != undefined) {
                var s = ' ~ zuhr : ' + options.items[i].masjidTimings.zuhr;
                if (n == 'Friday') {
                    s = ' ~ jumah : ' + options.items[i].masjidTimings.jumah;
                }
                if (options.float == 'left')
                    $('#flmnuNav').append('<li><div id="flmnulnk_' + idnum + '" data-times="fajr : ' + options.items[i].masjidTimings.fajr + s + ' ~ asr : ' + options.items[i].masjidTimings.asr + ' ~ maghrib : ' + options.items[i].masjidTimings.maghrib + ' ~ isha : ' + options.items[i].masjidTimings.isha + '" data-name="' + linktext + '" style="' + ustyle + '">' + linktext + '<span id="flmnulnkArr" class="glyphicon glyphicon-circle-arrow-right" style="float:right"></span></div></li>');
                else
                    $('#flmnuNav').append('<li><div id="flmnulnk_' + idnum + '" data-times="fajr : ' + options.items[i].masjidTimings.fajr + s + ' ~ asr : ' + options.items[i].masjidTimings.asr + ' ~ maghrib : ' + options.items[i].masjidTimings.maghrib + ' ~ isha : ' + options.items[i].masjidTimings.isha + '" data-name="' + linktext + '"  style="' + ustyle + ':><span style="float:right">' + linktext + '<span id="flmnulnkArr" class="glyphicon glyphicon-circle-arrow-left" style="float:left"></span></div></li>');
            }
            else {
                $('#flmnuNav').append('<li><div id="flmnulnk_' + idnum + '" data-name="' + linktext + '" data-placeid="' + placeid + '" >' + linktext + '<span id="flmnulnkArr" class=" glyphicon glyphicon-circle-arrow-right" style="float:right;' + ustyle + '"></span></div></li>');
            }
        }
        $(this).append('</ul>');
        //$(this).append('</div>');

        $('#flmnuHeader').click(function () {
            if (options.float == 'left') {
                if ($('#' + elemntId).css('margin-left') == '-' + (options.width - options.toggleMargin) + 'px') {
                    // $('#' + elemntId).attr('style', 'margin-left:0px;width:' + options.width + 'px;margin-top:8px;');
                    $('#' + elemntId).animate({ 'marginLeft': '0px' }, 500);
                    //  $('#' + elemntId).attr('style', ';width:' + options.width + 'px');
                    $('#toggleIcon').removeClass('glyphicon-chevron-right');
                    $('#toggleIcon').addClass('glyphicon-chevron-left');
                }
                else {
                    // $('#' + elemntId).attr('style', 'margin-left:-' + (options.width - options.toggleMargin) + 'px;width:' + options.width + 'px;margin-top:8px;');
                    $('#' + elemntId).animate({ 'margin-left': '-' + (options.width - options.toggleMargin) + 'px' }, 500);
                    $('#toggleIcon').removeClass('glyphicon-chevron-left');
                    $('#toggleIcon').addClass('glyphicon-chevron-right');
                }
            }
            else {
                if ($('#' + elemntId).css('right') == '-' + (options.width - options.toggleMargin) + 'px') {
                    // $('#' + elemntId).attr('style', 'margin-left:0px;width:' + options.width + 'px;margin-top:8px;');
                    $('#' + elemntId).animate({ 'right': '0px' }, 500);
                    //  $('#' + elemntId).attr('style', ';width:' + options.width + 'px');
                    $('#toggleIcon').removeClass('glyphicon-chevron-left');
                    $('#toggleIcon').addClass('glyphicon-chevron-right');
                }
                else {
                    // $('#' + elemntId).attr('style', 'margin-left:-' + (options.width - options.toggleMargin) + 'px;width:' + options.width + 'px;margin-top:8px;');
                    $('#' + elemntId).animate({ 'right': '-' + (options.width - options.toggleMargin) + 'px' }, 500);
                    $('#toggleIcon').removeClass('glyphicon-chevron-right');
                    $('#toggleIcon').addClass('glyphicon-chevron-left');
                }
            }

        });

        $('[id^="flmnulnk_"]').mousemove(function (e) {
            var t = $(this).data('times');
            var times
            if (t)
                times = $(this).data('times').split('~');
            else
                times = undefined;
            var name = $(this).data('name');
            var div = '';
            if (options.float == 'left') {
                if ($('#' + elemntId).css('margin-left') == '-' + (options.width - options.toggleMargin) + 'px') {
                    div = div + '<div style="border-bottom:1px solid lightgreen">' + name + '</div>';
                }
            }
            if (options.float == 'right') {
                if ($('#' + elemntId).css('right') == '-' + (options.width - options.toggleMargin) + 'px') {
                    div = div + '<div style="border-bottom:1px solid lightgreen">' + name + '</div>';
                }
            }
            if (times != undefined) {
                for (var i = 0; i < times.length; i++) {
                    div = div + '<div>' + times[i] + '</div>';
                }
            }
            else {
                div = div + '<div><br>No times salaah times available<br>&nbsp;</div>';
            }
            $('.flmnuTimes').html(div);
            var position = $(this).position();
            //console.log(position.top + ' ' + position.left + ' ' + $('#' + elemntId).css('margin-left'));
            if (Number(window.innerWidth) > 768) {
                if (options.float == 'left') {
                    if ($('#' + elemntId).css('margin-left') != '0px')
                        $('.flmnuTimes').attr('style', 'top:' + position.top + 'px;left:' + (position.left + options.width - 3) + 'px;display:block;');
                    else
                        $('.flmnuTimes').attr('style', 'top:' + position.top + 'px;left:' + (position.left + options.width - 1) + 'px;display:block;');
                }

                if (options.float == 'right') {
                    if ($('#' + elemntId).css('right') != '0px')
                        $('.flmnuTimes').attr('style', 'top:' + position.top + 'px;left:' + (position.left - (options.width / 2) - 14) + 'px;display:block;');
                    else
                        $('.flmnuTimes').attr('style', 'top:' + position.top + 'px;left:' + (position.left - (options.width / 2) - 16) + 'px;display:block;');
                }
            }
        });
        $('#' + elemntId).mouseout(function (e) {
            $('.flmnuTimes').html('');
            $('.flmnuTimes').attr('style', 'display:none;');
        });

        $('[id^="flmnulnk_"]').click(function (e) {
            if (Number(window.innerWidth) < 768) {
                // hideMobileMnu();
                if ($('#' + elemntId).css('margin-left') == '0px') {
                    $('#flmnuHeader').trigger('click');
                }
            }
            var idMarker = Number($(this).attr('id').split('_')[1]) - 1;
            if (markers != undefined) {
                let t = markers[idMarker];
                map.flyTo(t._latlng, 16)
                t.togglePopup()
            }

        });
        return this;
    }
}(jQuery));