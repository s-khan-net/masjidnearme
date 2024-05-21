
function showInfo(masjid,index) {
    if($('#infoWidgetBtn')!=undefined)
        if ($('#infoWidgetBtn').data('widget-state') == 'closed') {
            toggleInfoWidget();
        }
    if (masjid != undefined) {
        if (masjid.masjidName.indexOf('ChI') < 0) {
            var contentStr = ''
            contentStr = contentStr + '<div id="infoWidgetBtn" class="infoWidgetBtn" data-widget-state="open" onclick="toggleInfoWidget()" ></div>';
            contentStr = contentStr + '<div class="widgetContainer" style="padding:0px">';
            // contentStr = contentStr + '<div class="row" >'; //style="width:318px"
            contentStr = contentStr + '<div class="row" style="padding-left:12px;text-align:center"><div class="col-xs-8"><b>' + masjid.masjidName + '</b>&nbsp;&nbsp;&nbsp;' + masjid.Distance + 'Km&nbsp;&nbsp;&nbsp;</div>';
            contentStr = contentStr + '<div class="col-xs-4"><button  onclick=calculateAndDisplayRoute(' + masjid.masjidLocation.coordinates[1] + ',' + masjid.masjidLocation.coordinates[0] + '); title="Directions" style="cursor:pointer"><span class="glyphicon glyphicon-send"></span></button>';
            
            contentStr = contentStr + '</div></div>'
            contentStr = contentStr + '<div class="row" style="padding-left:16px">';
            if (masjid.masjidTimings != undefined) {
                contentStr = contentStr + '<div class="col-xs-3" style="display:inline-block;font-weight:600;padding-right:1px">';
                contentStr = contentStr + '<div style="padding-left:8px">fajr: ' + masjid.masjidTimings.fajr + '</div>';
                contentStr = contentStr + '<div style="padding-left:7px">zuhr: ' + masjid.masjidTimings.zuhr + '</div>';
                contentStr = contentStr + '<div style="padding-left:8px">asr : ' + masjid.masjidTimings.asr + '</div>';
                contentStr = contentStr + '</div>';
                contentStr = contentStr + '<div class="col-xs-4" style="display:inline-block;font-weight:600;padding-right:1px">';
                contentStr = contentStr + '<div>maghrib: ' + masjid.masjidTimings.maghrib + '</div>';
                contentStr = contentStr + '<div>isha  : ' + masjid.masjidTimings.isha + '</div>';
                contentStr = contentStr + '<div>jumah: ' + masjid.masjidTimings.jumah + '</div>';
                contentStr = contentStr + '</div>';
            }
            else {
                if (!masjid.verified) {
                    contentStr = contentStr + '<div>Not verified</div>';
                }
                else {
                    contentStr = contentStr + '<div>Salaah timings not found.</div>';
                }
            }
            if (masjid.masjidAddress != undefined) {
                if (masjid.masjidAddress.description) {
                    contentStr = contentStr + '' + masjid.masjidAddress.description + ', ';
                }
                //else {
                    if (masjid.masjidAddress.street)
                        contentStr = contentStr + '' + masjid.masjidAddress.street + ', ';
                    if (masjid.masjidAddress.city)
                        contentStr = contentStr + '' + masjid.masjidAddress.city + ', ';
                    if (masjid.masjidAddress.state)
                        contentStr = contentStr + '' + masjid.masjidAddress.state + ', ';
                    if (masjid.masjidAddress.zipcode)
                        contentStr = contentStr + '' + masjid.masjidAddress.zipcode + ', ';
                    contentStr = contentStr + '' + masjid.masjidAddress.country + '';
                //}
            }
            else {
                contentStr = contentStr + 'Address not available';
            }

            contentStr = contentStr + '</div>';
            contentStr = contentStr + '</div>';

            $('#infoWidget').html(contentStr);
        }
    }
    else {
        $('#infoWidget').html('');
    }
    $('#infoWidget').css('left', function () {
        return ($(window).width() - $(this).width()) / 2
    });
}
$(window).on('resize', function () {
    $('#infoWidget').css('left', function () {
        return ($(window).width() - $(this).width()) / 2
    });
});
function toggleInfoWidget() {
    if (Number(window.innerWidth) < 768) {
        hideMobileMnu();
       // window.map.setZoom(14);
    }
    if ($('#infoWidgetBtn').data('widget-state') == 'open') {
        //  $('#timingsWidget').css('margin-top', '-' + ($('#timingsWidget').height() -11) + 'px');
        $('#infoWidget').animate({ 'marginBottom': '-' + ($('#infoWidget').height() - 11) + 'px' }, 1000);
        $('#infoWidgetBtn').data('widget-state', 'closed');
    }
    else {
        // $('#timingsWidget').css('margin-top', '0px');
        $('#infoWidget').animate({ 'marginBottom': '0px' }, 1000);
        $('#infoWidgetBtn').data('widget-state', 'open');
    }
}