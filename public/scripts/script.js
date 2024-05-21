var map
var markers = [];
var basePath = 'http://localhost:8300/v1/'
var locMarker;
$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
    $('.clockpicker').clockpicker();
    checkInitStuff();
    $('#btnRegister').click(function (e) {
        if (e) {
            e.preventDefault()
        }
        signUp();
    });
    $('#btnSignIn').click(function (e) {
        if (e) {
            e.preventDefault()
        }
        signIn();
    });
    $('#btnLoc').click(function (e) {
        if (e) {
            e.preventDefault()
        }
        showLoc();
    });
    $('#btnLogin').click(function (e) {
        if (e) {
            e.preventDefault()
        }
        showLogin();
    });
    $('#navUserSettings').click(function (e) {
        if (e) {
            e.preventDefault()
        }
        showSettings();
    });
    $('#navUserProfile').click(function (e) {
        if (e) {
            e.preventDefault()
        }
        showProfile();
    });
    $('#navUserLogOut').click(function (e) {
        if (e) {
            e.preventDefault()
        }
        signOut('You have signed out successfully.')
    });
    $('#btnUpdateMasjid').click(function (e) {
        if (e) {
            e.preventDefault()
        }
        updateMasjid()
    });
    $('#btnSaveSettings').click(function (e) {
        if (e) {
            e.preventDefault()
        }
        saveSettings()
    })
    $('#btnSaveProfile').click(function (e) {
        if (e) {
            e.preventDefault()
        }
        saveProfile()
    })
    $('#btnSendVerification').click(function (e) {
        if (e) {
            e.preventDefault()
        }
        sendVerfificationEmail();
    });
    $('#btnVerifyMasjid').click(function (e) {
        if (e) {
            e.preventDefault()
        }
        if ($('#editMasjidMasjidName').html().indexOf('Verify') > -1) {
            verifyMasjid()
        }
        else {
            updateMasjid()
        }
    });
    $('#btnUpdateSalaahTimes').click(function (e) {
        if (e) {
            e.preventDefault()
        }
        updateMasjid()
    });
    $('#chkIsNotMasjid').click(function (e) {
        // if (e) {
        //     e.preventDefault()
        // }
        if ($('#chkIsNotMasjid').is(':checked')) {
            $('#notMasjidMessage').show()
        }
        else {
            $('#notMasjidMessage').hide();
        }
    })
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('scripts/sw.js');
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showerror);
    }
});
//#region iniit methods
function checkInitStuff() {
    checkUserLoggedIn();
}
function checkUserLoggedIn(user) {
    if (user) {
        setLoginUi(user);
    }
    else {
        let token = sessionStorage.getItem('token')
        if (token) {
            getUserByToken(token)
        }
        else {
            signOut();
        }
    }
}
function getUserByToken(token, settings, profile) {
    $.ajax({
        method: 'POST',
        url: `${basePath}auth/verify`,
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify({
            token: token
        }),
        success: function (data) {
            if (data && data.user) {
                try {
                    setLoginUi(data.user);
                    if (settings) {
                        let userObj = {
                            user: data.user
                        }
                        userObj.user.settings = settings;
                        updateSettings(userObj)
                    }
                    if (profile) {
                        let userObj = {
                            user: data.user
                        }
                        userObj.user.userprofile = profile;
                        updateSettings(userObj)
                    }
                } catch (error) {
                    signOut('An <b>fatal error</b> has occured after signing you in<br>We had to sign you out. Please try refreshing the page');
                }
            }
            else {
                signOut();
            }
        },
        error: function (errordata) {
            if (errordata.state() == 'rejected' && errordata.readyState == 0) {
                // showAlert('Looks like we could not connect to the server/database at this time<br> Please try again later');
            }
            else {
                signOut()
            }
        }
    })
}
function setLoginUi(user) {
    try {
        if (user && user.userprofile) {
            $('#lilogin').hide();
            $('#liUser').show();
            $('#btnLoginUser').prop('title', user.userprofile.firstName);
            $('#userRole').text(atob(user.role.roleName))

            sessionStorage.removeItem('userEmail')
            sessionStorage.removeItem('userSettings')
            sessionStorage.removeItem('userProfile')

            sessionStorage.setItem('userEmail', user.userEmail)
            sessionStorage.setItem('userSettings', btoa(JSON.stringify(user.settings)))
            sessionStorage.setItem('userProfile', btoa(JSON.stringify(user.userprofile)))
        }
        else {
            throw new Error('User not defined')
        }
    } catch (error) {
        throw error;
    }

}

function signOut(msg) {
    try {
        $('#lilogin').show();
        $('#liUser').hide();
        $('#btnLoginUser').prop('title', '');
        $('#userRole').text('');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userEmail');
        sessionStorage.removeItem('userSettings');
        sessionStorage.removeItem('userProfile');
        showAlert(msg, 5000);
        clearMarkers(true)
    } catch (error) {
        showAlert('There was an error while trying to sing out.')
    }

}

function initSalaahTimes() {
    let maslak = 1
    let calcMethod = 2;
    if (sessionStorage.getItem('userSettings')) {
        let settings = JSON.parse(atob(sessionStorage.getItem('userSettings')))
        if (settings) {
            maslak = settings.school;
            calcMethod = settings.calcMethod;
        }
    }
    let d = new Date();
    let t = d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear()
    let coords = locMarker?._latlng;
    if (coords) {
        $('#timings').timings({
            latitude: coords.lat,
            longitude: coords.lng,
            method: calcMethod,
            today: t,
            school: maslak
        });
    }
}

function showPosition(position) {
    $('#mnu').flmnu({
        items: []
    });
    map = L.map('map', { zoomControl: false }).setView([position.coords.latitude, position.coords.longitude], 16);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    map.on('click', onMapClick);
    //define options
    let iconOptions = {
        title: 'you are here',
        draggable: true,
        riseOnHover: true
    }

    //pass the options to marker
    locMarker = new L.Marker([position.coords.latitude, position.coords.longitude], iconOptions);
    locMarker.addTo(map);
    locMarker.bindPopup('You are here')
    locMarker.on('dragend', function (e) {
        clearMarkers();
        var coords = e.target.getLatLng();
        initSalaahTimes();
        getMasjids(coords.lat, coords.lng, 2000)
        map.flyTo({ lat: coords.lat, lng: coords.lng }, 16)
    });
    initSalaahTimes();
    getMasjids(position.coords.latitude, position.coords.longitude, 2000)
}

//#endregion
function onMapClick(e) {
    $('#shareMnu').hide()
}
function showerror(error) {
    $('#loader').hide();
    showLoc();
}
function getMasjids(lt, ln, radius) {
    $('#loader').show();
    $.ajax({
        type: "GET",
        url: `${basePath}masjids/${lt}/${ln}/${radius}/13`,
        crossDomain: true,
        cache: true,
        dataType: 'JSON',
        success: function (data) {
            if (data) {
                // console.log('data', data);
                data.forEach(masjid => {
                    var redMarker = L.AwesomeMarkers.icon({
                        icon: 'glyphicon glyphicon-map-marker',
                        markerColor: 'green'
                    });
                    let iconOptions = {
                        icon: redMarker,
                        title: masjid.masjidName,
                        iconSize: [50, 50],
                        masjid: masjid
                    }

                    var marker = L.marker([masjid.masjidLocation.coordinates[1], masjid.masjidLocation.coordinates[0]], iconOptions);
                    marker.addTo(map);
                    marker.bindPopup(getInfo(masjid))
                    markers.push(marker)
                });
                //initialize the menu
                $('#mnu').flmnu({
                    items: data,
                });
                //add the slimscroll
                if (Number(window.innerHeight - 60) <= $('#mnu').height()) {
                    $('#flmnuNav').slimScroll({
                        height: window.innerHeight - 84,
                        position: 'left'
                    });
                }
            }
            if (data && data.length == 0) {
                $('#loader').hide();
                $('#mnu').flmnu({
                    items: [],
                });
                showAlert('No masjids found', 3000)
            }
        },
        complete: function (data) {
            $('#loader').hide();
        },
        error: function (errordata) {
            showAlert('Looks like we could not connect to the server/database at this time<br> Please try again later');
        }
    });

}

function clearMarkers(refresh) {
    for (var i = 0; i < markers.length; i++) {
        if (map.hasLayer(markers[i])) {
            map.removeLayer(markers[i]);
        }
    }
    $('#mnu').flmnu({
        items: []
    });
    markers = [];
    if (refresh) {
        let coords = locMarker?._latlng;
        if (coords) {
            initSalaahTimes()
            getMasjids(coords.lat, coords.lng, 2000)
        }
    }
}

function getInfo(masjid) {
    const maghrib = $('#timesObject').text();
    const role = btoa($('#userRole').text())
    var contentStr = '<div class="row" >';
    contentStr = contentStr + '<div class="col-xs-11 masjid-info-popup-header" title="' + masjid.masjidName + '"><b>' + masjid.masjidName + '</b></div>';
    contentStr = contentStr + '<div class="col-xs-1" style="margin-left:-5px"><a onmouseover=showShare(event) title="Share" style="cursor:pointer"><span class="glyphicon glyphicon-share"></span></a></div>';
    $('#shareMnu').html('<ul id="flmnuNav" onmouseout="$("#shareMnu").hide()"><li><div onclick=shareMasjid("fb","' + masjid.masjidName?.replace(/ /g, '_') + '","' + masjid.masjidAddress.description?.replace(/ /g, '_') + '","' + masjid.masjidAddress?.googlePlaceId + '")><img src="./assets/images/smnu/fb_24X24.png" alt="FB"/></div></li><li><div onclick=shareMasjid("tw","' + masjid.masjidName.replace(/ /g, '_') + '","' + masjid.masjidAddress.description?.replace(/ /g, '_') + '","' + masjid.masjidAddress.googlePlaceId + '")><img src="./assets/images/smnu/tw_24X24.png" alt="TW"/></div></li><li><div onclick=shareMasjid("em","' + masjid.masjidName.replace(/ /g, '_') + '","' + masjid.masjidAddress.description?.replace(/ /g, '_') + '","' + masjid.masjidAddress.googlePlaceId + '")><img src="./assets/images/smnu/em_24X24.png" alt="Email"/></div></li></ul>');
    contentStr = contentStr + '</div>'
    contentStr = contentStr + '<div class="row" >'
    contentStr = contentStr + '<div class="col-xs-7" style="padding-left: 19px;;border-right:1px solid #CCC;font-weight: 300; font-size: 13px;">';
    // contentStr = contentStr + '<b>' + masjid.masjidName + '</b></br>';
    if (masjid.masjidAddress != undefined) {
        if (masjid.masjidAddress.description)
            contentStr = contentStr + '' + masjid.masjidAddress.description + ', ';
        if (masjid.masjidAddress.street)
            contentStr = contentStr + '' + masjid.masjidAddress.street + ', ';
        if (masjid.masjidAddress.locality)
            contentStr = contentStr + '' + masjid.masjidAddress.locality + ', ';
        if (masjid.masjidAddress.city)
            contentStr = contentStr + '' + masjid.masjidAddress.city + ', ';
        if (masjid.masjidAddress.state)
            contentStr = contentStr + '' + masjid.masjidAddress.state + ', ';
        if (masjid.masjidAddress.zipcode)
            contentStr = contentStr + '' + masjid.masjidAddress.zipcode + ', ';
        contentStr = contentStr + '' + masjid.masjidAddress.country + '<br>';
        if (masjid.masjidAddress.phone)
            contentStr = contentStr + 'ph: ' + masjid.masjidAddress.phone;
        if (masjid.masjidAddress.description?.indexOf('http') > -1) {
            contentStr = contentStr + '<br><a href="http' + masjid.masjidAddress.description.split('http')[1] + '" target="_blank">Website</a> ';
        }
    }
    else {
        contentStr = contentStr + 'Masjid Address not available';
    }
    contentStr = contentStr + '</div>';
    contentStr = contentStr + '<div class="col-xs-5" style="padding-right: 2px;">';
    contentStr = contentStr + '<div class="infoWTimes row">';
    if (masjid.masjidTimings != undefined && masjid.verified) {
        var f, z, a, m, i, j;
        f = masjid.masjidTimings.fajr == '' ? '-' : masjid.masjidTimings.fajr;
        z = masjid.masjidTimings.zuhr == '' ? '-' : masjid.masjidTimings.zuhr;
        a = masjid.masjidTimings.asr == '' ? '-' : masjid.masjidTimings.asr;
        m = maghrib || '-';
        i = masjid.masjidTimings.isha == '' ? '-' : masjid.masjidTimings.isha;
        j = masjid.masjidTimings.jumah == '' ? '-' : masjid.masjidTimings.jumah;
        contentStr = contentStr + '<div class="col-xs-5">FAJR</div><div class="col-xs-7" style="text-align:left"> ' + f + '</div>';
        contentStr = contentStr + '<div class="col-xs-5">ZUHR</div><div class="col-xs-7" style="text-align:left"> ' + z + '</div>';
        contentStr = contentStr + '<div class="col-xs-5">ASR</div><div class="col-xs-7" style="text-align:left"> ' + a + '</div>';
        contentStr = contentStr + '<div class="col-xs-5">MAGHRIB</div><div class="col-xs-7" style="text-align:left"> ' + m + '</div>';
        contentStr = contentStr + '<div class="col-xs-5">ISHA</div><div class="col-xs-7" style="text-align:left"> ' + i + '</div>';
        contentStr = contentStr + '<div class="col-xs-5">JUMAH</div><div class="col-xs-7" style="text-align:left"> ' + j + '</div>';
        if (role == 'admin' || role == 'edit' || role == 'edittimes') {
            contentStr = contentStr + '<div class="col-xs-12 infoWTimes " style="padding: 8px 0px;"><button style="width:80% !important; float:left" onclick = showEditTimes(\'' + masjid.masjidAddress.googlePlaceId + '\')>Edit salaah times</button></div>';
        }
    }
    else {
        contentStr = contentStr + '<div class="col-xs-10" style="text-align:left"> Timings not available</div>';
    }
    contentStr = contentStr + '</div>';
    contentStr = contentStr + '</div>';
    contentStr = contentStr + '</div>';

    if (role == 'admin' || role == 'edit') {
        if (masjid.verified) {
            contentStr = contentStr + '<div class="row" style="padding-top:4px;text-align:center"><div class="col-xs-12 infoWTimes " ><button style="width:36px" onclick = showEditMasjid(\'' + masjid.masjidAddress.googlePlaceId + '\')>Edit</button> the details of this masjid</div></div>';
        }
        else {
            contentStr = contentStr + '<div class="row" style="padding-top:4px;text-align:center"><div class="col-xs-12 infoWTimes " ><button style="width:36px" onclick = showEditMasjid(\'' + masjid.masjidAddress.googlePlaceId + '\')>Verify</button> this masjid</div></div>';
        }
    }
    else if (role == 'edittimes') { //showEditTimes
        if (masjid.verified) {
            contentStr = contentStr + '<div class="row" style="padding-top:4px;text-align:center"><div class="col-xs-12 infoWTimes " ><button style="width:36px" onclick = showEditTimes(\'' + masjid.masjidId + '\')>Edit</button> the salaah times of this masjid</div></div>';
        }
        else {
            contentStr = contentStr + '<div class="row" style="padding-top:4px;text-align:center"><div class="col-xs-12 infoWTimes">This masjid is not verified.</div></div>';
        }
    }
    else if (role == 'default') {
        contentStr = contentStr + '<div class="row" style="padding-top:4px;text-align:center"><div class="col-xs-12 infoWTimes">you do not have permissions to edit this masjid</div></div>';
    }
    else {
        contentStr = contentStr + '<div class="row" style="padding-top:4px;text-align:center;font-weight: 300;font-size: 13px;"><div class="col-xs-12 infoWTimes">Please <button  style="width:64px" onclick = showLogin()>Sign in</button> to edit this masjid</div></div>';
    }

    return contentStr
}

//#region sign in show hide
$('#btnReg').click(function () {
    $('#loginFrm').prop('hidden', true);
    $('#registerFrm').prop('hidden', false);
    $('#loginModalTitle').html('Sign Up');
});
$('#btnlogin').click(function () {
    $('#loginFrm').prop('hidden', false);
    $('#registerFrm').prop('hidden', true);
    $('#loginModalTitle').html('Sign In');
});
$('#btnForgotPwd').click(function () {
    $('#loginContent').html('');
    $('#loginModal').modal('hide');
    showForgotPwd();
});
//#endregion

//#region  sign in & sign up methods
function signIn() {
    $('#loader').show();
    let res = { valid: true, errorMessage: '' }
    var user = {
        "user": {
            "userEmail": $('#userEmail')[0].value.trim(),
            "userPassword": $('#userPwd')[0].value.trim()
        }
    };
    if (!user.user.userEmail || !user.user.userPassword) {
        res.valid = false;
        res.errorMessage = 'User details are incomplete'
    }
    else if (!validateEmailFormat(user.user.userEmail)) {
        res.valid = false;
        res.errorMessage = 'Invalid email!'
    }
    if (!res.valid) {
        showSignError(res);
        return;
    }
    $.ajax({
        type: 'POST',
        url: `${basePath}auth`,
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify(user),
        success: function (data, status, request) {
            let token = request.getResponseHeader('x-auth-token')
            if (token) {
                showAlert(data.message, 5000);
                //store the token in cookie
                $.cookie('token', token);
                //store the token in session
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('userEmail', data.user.userEmail)
                sessionStorage.setItem('userSettings', btoa(JSON.stringify(data.user.settings)))
                sessionStorage.setItem('userProfile', btoa(JSON.stringify(data.user.userprofile)))
                checkUserLoggedIn(data.user);
                clearMarkers(true);
            }
            else
                showAlert('Authorizaton did not come through, <br>Please try again later <br>If this problem persists, please contact our support.')
            $('#userEmail').html('')
            $('#loginModal').modal('hide');
        },
        complete: function (data) {
            $('#loader').hide();
        },
        error: function (errordata) {
            if (errordata.state() == 'rejected' && errordata.readyState == 0)
                showAlert('Looks like we could not connect to the server/database at this time<br> Please try again later');
            else {
                if (errordata.responseJSON.verificationCode && errordata.responseJSON.userEmail) {
                    showSendVerification(errordata.responseJSON.message, errordata.responseJSON.verificationCode, errordata.responseJSON.userEmail)
                }
                else {
                    showAlert(errordata.responseJSON.message);
                }

            }
            $('#loginModal').modal('hide');
        }
    })
}
function signUp(e) {
    $('#loader').show();
    let id = Math.floor((Math.random() * 100000000000000000) + 1);
    let user = {
        "user": {
            "userId": id,
            "userEmail": $('#regUserEmail')[0].value.trim(),
            "userPassword": $('#regUserPwd')[0].value.trim(),
            "userprofile": {
                "firstName": $('#firstName')[0].value.trim(),
                "lastName": $('#lastName')[0].value.trim()
            }
        }
    };
    const res = validateUser(user.user);
    if (!res.valid) {
        showSignError(res);
        return;
    }
    $.ajax({
        type: 'POST',
        url: `${basePath}users`,
        contentType: 'application/json',
        dataType: "json",
        processData: false,
        data: JSON.stringify(user),
        success: function (data, status) {
            // alert("Data: " + JSON.stringify(data) + "\nStatus: " + status);
            showAlert(JSON.parse(data).message);
            $('#loginModal').modal('hide');
        },
        complete: function (data) {
            $('#loader').hide();
        },
        error: function (errordata) {
            if (errordata.state() == 'rejected' && errordata.readyState == 0)
                showAlert('Looks like we could not connect to the server/database at this time<br> Please try again later');
            else
                showAlert(JSON.parse(errordata.responseJSON).message);
            $('#loginModal').modal('hide');
        }
    });
}
function showSignError(res) {
    $('#validationMsg').prop('hidden', false);
    $('#validationMsg').text(res.errorMessage);
    setTimeout(() => {
        $('#validationMsg').text('');
        $('#validationMsg').prop('hidden', true);
    }, 3000);
}

function validateUser(user) {
    let res = { valid: true, errorMessage: '' }
    if (!user.userEmail || !user.userPassword || !user.userprofile.firstName || !user.userprofile.lastName) {
        res.valid = false;
        res.errorMessage = 'User details are incomplete'
    }
    else {
        if (!validateEmailFormat(user.userEmail)) {
            res.valid = false;
            res.errorMessage = 'Invalid email!'
        }
        else if (user.userPassword != $('#regComparePassword')[0].value.trim()) {
            res.valid = false;
            res.errorMessage = 'Passwords do not match'
        }
        else {
            res = validatePassword(user.userPassword)
        }
    }
    return res;
}
function validateEmailFormat(email) {
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (email.match(mailformat)) {
        return true;
    }
    else {
        return false;
    }
}
function validatePassword(p) {
    let errors = [];
    let res = { valid: true, errorMessage: '' }
    if (p.length < 6) {
        errors.push("Your password must be at least 6 characters");
    }
    if (p.search(/[a-z]/i) < 0) {
        errors.push("Your password must contain at least one letter.");
    }
    if (p.search(/[0-9]/) < 0) {
        errors.push("Your password must contain at least one digit.");
    }
    if (errors.length > 0) {
        res.errorMessage = errors.join("\n");
        res.valid = false;
    }
    return res;
}
//#endregion

//#region popups!
function showLogin() {
    $("#loginModal").modal({
        backdrop: "static"
    });
}
function showLoc() {
    $("#locModal").modal({
        backdrop: "static"
    });
    $('#locTitle').html('Set your location');
    $('#txtLocation').focus();
}
function showSendVerification(msg, confirmCode, userEmail) {
    $("#sendVerificationModal").modal({
        backdrop: "static"
    });
    $('#sendVerificationMessage').html(msg)
    $('#confirmCode').text(confirmCode)
    $('#email').text(userEmail)
}
function showEditMasjid(googlePlaceId) {
    closeAllPopups();
    $('#editMasjidModal').modal({
        backdrop: "static"
    })
    markers.forEach(m => {
        if (m.options.masjid.masjidAddress.googlePlaceId == googlePlaceId) {
            showMasjidDetails(m.options.masjid);
        }
    });
}
function showEditTimes(googlePlaceId) {
    closeAllPopups();
    $('#editTimesModal').modal({
        backdrop: "static"
    })
    markers.forEach(m => {
        if (m.options.masjid.masjidAddress.googlePlaceId == googlePlaceId) {
            showEditSalaahTimes(m.options.masjid);
        }
    });
}
function showSettings() {
    if (sessionStorage.getItem('userSettings')) {
        let settings = JSON.parse(atob(sessionStorage.getItem('userSettings')))
        if (settings?.school == 1)
            $("input[name='school'][value='1']").prop('checked', true);
        else
            $("input[name='school'][value='0']").prop('checked', true);
        $('#calcMethod').val(settings?.calcMethod);
        $('#searchRadius').val(settings?.radius)
        closeAllPopups();
        $('#settingsModal').modal({
            backdrop: "static"
        })
    }
    else {
        signOut();
    }
}
function showProfile() {
    if (sessionStorage.getItem('userProfile') && sessionStorage.getItem('userEmail')) {
        let profile = JSON.parse(atob(sessionStorage.getItem('userProfile')));
        $('#userProfile_userEmail').val(sessionStorage.getItem('userEmail'))
        $('#userProfile_firstName').val(profile.firstName);
        $('#userProfile_lastName').val(profile.lastName);
        $('#userProfile_userPhone').val(profile.phone);
        $('#role_roleName').val(btoa($('#userRole').text()));
        closeAllPopups();
        $('#profileModal').modal({
            backdrop: "static"
        })
    }
    else {
        signOut();
    }
}

function closeAllPopups() {
    $('.modal').modal('hide');
}
//#endregion

//#region share
function shareMasjid(s, name, desc, placeId) {
    var u = 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id=' + placeId;
    u = encodeURI(u);
    name = name.replace(/_/g, ' ');
    desc = desc.replace(/_/g, ' ')
    $('#shareMnu').hide();
    switch (s) {
        case 'fb':
            fbShare(u, name, desc, '', 520, 350);
            break;
        case 'g+':
            gplus(u, name, desc, '', 520, 350);
            break;
        case 'tw':
            twitter(u, name, desc, '', 520, 350);
            break;
        case 'em':
            sendmail(u, name, desc, '', 520, 350);
            break;
    }
}
function showShare(e) {
    var left = e.clientX + "px";
    var top = e.clientY + "px";
    $('#shareMnu').css('left', left);
    $('#shareMnu').css('top', top);

    $('#shareMnu').toggle();
    return false;
}
function fbShare(url, title, descr, image, winWidth, winHeight) {
    var winTop = (screen.height / 2) - (winHeight / 2);
    var winLeft = (screen.width / 2) - (winWidth / 2);
    window.open('http://www.facebook.com/sharer.php?s=100&p[title]=' + title + '&p[summary]=' + descr + '&p[url]=' + url + '&p[images][0]=' + image, 'Share on facebook', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
}
function gplus(url, title, descr, image, winWidth, winHeight) {
    var winTop = (screen.height / 2) - (winHeight / 2);
    var winLeft = (screen.width / 2) - (winWidth / 2);
    window.open(
        'https://plus.google.com/share?url=' + url,
        'Share on google',
        'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=400,height=450'
    ).focus();
    return false;
}
function twitter(url, title, descr, image, winWidth, winHeight) {
    var winTop = (screen.height / 2) - (winHeight / 2);
    var winLeft = (screen.width / 2) - (winWidth / 2);
    window.open(
        'http://twitter.com/share?text=' + title + '&url=' + url + '&hashtags=#masjidnearme',
        'Share on twitter',
        'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=400,height=450'
    ).focus();
    return false;
}
function sendmail(url, title, descr, image, winWidth, winHeight) {
    //url = url.replace(/&/g, '&amp;');
    window.location.href = "mailto:?subject=Sharing '" + title + "' from masjid near me&body=Click on the link to open google maps and locate '" + title + "' -> " + url + "";
    return false;
}
//#endregion

//#region error display
function showerr(exep) {
    $('#errorDiv').html(exep.split('<br>')[0]);
    $('.alert').css('top', $(document).height() / 3 + 'px');
    $('.alert').css('left', ($(window).width() - $('.alert').width()) / 2 + 'px');
    $('.alert').show();
}
function showAlert(msg, delay) {
    if (msg) {
        $('#loader').hide();
        $('#alertMsg').html('<a class="close" onclick=$("#alertMsg").html("").hide()>&times;</a>' + msg);
        $('#alertMsg').addClass('alert alert-masjid fade in')
        $('#alertMsg').prop('style', 'position: absolute; z-index: 9999;top: 32%;left: calc(40% + 42px);max-width: 395px;');
        if (delay)
            $('#alertMsg').delay(delay).fadeOut();
    }
}
//#endregion

function sendVerfificationEmail() {
    $('#loader').show();
    let confirmCode = $('#confirmCode').text()
    let email = $('#email').text()

    if (confirmCode && email) {
        $.ajax({
            method: 'POST',
            url: `${basePath}auth/send`,
            contentType: 'application/json',
            dataType: "json",
            data: JSON.stringify({ confirmCode: confirmCode, userEmail: email }),
            success: function (data, status) {
                $('#loader').hide();
                $('#sendVerificationModal').modal('hide');
                showAlert(data.message, 5000)
            },
            error: function (errordata) {
                if (errordata.state() == 'rejected' && errordata.readyState == 0)
                    showAlert('Looks like we could not connect to the server/database at this time<br> Please try again later');
                else
                    showAlert(errordata.responseJSON.message);
                $('#loader').hide();
                $('#sendVerificationModal').modal('hide');

            }
        })
    }

}
//#region  helper functions
// Helper function to store OAuth 2 Cookie
function setCookie(name, value) {
    let maxAge = `;max-age=${12 * 60 * 60}`; // Expire cookie at 12 hours
    document.cookie =
        name + "=" + value + maxAge + ";path=/" + ";SameSite=Lax" + ";Secure";
}

// Helper function to get cookie value from key
function getCookie(name) {
    let value = "; " + document.cookie;
    let parts = value.split(`; ${name}=`);
    if (parts.length == 2) return parts.pop().split(";").shift();
}
//#endregion

//#region masjid methods
function showMasjidDetails(masjid) {
    if (!sessionStorage.getItem('token')) {
        throw new Error('User not logged in.')
    }
    if (masjid.verified) {
        $('#btnVerifyMasjid').hide();
        $('#btnUpdateMasjid').show();
        $('#editMasjidMasjidName').html(`Editing ${masjid.masjidName}`)
        $('#txtMasjidName').val(masjid.masjidName).prop('readonly', false)
        $('#verifyMessage').hide();
        $('#chkIsNotMasjid').prop('checked', masjid.notMasjid)
        $('#notMasjidMessage').hide();
        $('#masjidId').text(masjid.masjidAddress.googlePlaceId)
        $.each(masjid.masjidAddress, function (name, value) {
            $(`#${name}`).val(value).prop('readonly', false)
        })
    }
    else if (masjid.masjidAddress.city && masjid.masjidAddress.country) {
        $('#btnVerifyMasjid').show();
        $('#btnUpdateMasjid').hide();
        $('#editMasjidMasjidName').html(`Verify ${masjid.masjidName}`)
        $('#txtMasjidName').val(masjid.masjidName).prop('readonly', true)
        $('#verifyMessage').show();
        $('#chkIsNotMasjid').prop('checked', false)
        $('#notMasjidMessage').hide();
        $('#masjidId').text(masjid.masjidAddress.googlePlaceId)
        $.each(masjid.masjidAddress, function (name, value) {
            $(`#${name}`).val(value).prop('readonly', true)
        })
    }
    else {
        $('#btnVerifyMasjid').show();
        $('#btnUpdateMasjid').hide();
        $('#editMasjidMasjidName').html(`Verify ${masjid.masjidName}`)
        $('#txtMasjidName').val(masjid.masjidName).prop('readonly', true)
        $('#verifyMessage').show();
        $('#chkIsNotMasjid').val(masjid.notMasjid)
        $('#loader').show();
        //call details
        $.ajax({
            method: 'GET',
            url: `${basePath}masjids/details/${masjid.masjidAddress.googlePlaceId}`,
            headers: {
                "x-auth-token": sessionStorage.getItem('token'),
            },
            success: function (data) {
                const masjid = JSON.parse(data)
                $('#masjidId').text(masjid.masjidAddress.googlePlaceId);
                $.each(masjid.masjidAddress, function (name, value) {
                    $(`#${name}`).val(value).prop('readonly', true)
                })
                $('#loader').hide();
            },
            error: function (errordata) {
                $('#loader').hide();
                if (errordata.state() == 'rejected' && errordata.readyState == 0)
                    showAlert('Looks like we could not connect to the server/database at this time<br> Please try again later');
                else {
                    closeAllPopups()
                    showAlert(errordata.responseJSON.message);
                }
            }
        })
    }
}
function showEditSalaahTimes(masjid) {
    if (!sessionStorage.getItem('token')) {
        throw new Error('User not logged in.')
    }
    $('#editMasjidMasjidName').html(`Editing Salaah tmes for ${masjid.masjidName}`)
    $('#masjidId').text(masjid.masjidAddress.googlePlaceId);
    $.each(masjid.masjidTimings, function (name, value) {
        $(`#${name}Val`).val(value)
    })

}
function updateMasjid() {
    if (!sessionStorage.getItem('token')) {
        throw new Error('User not logged in.')
    }
    let masjid = {}
    markers.forEach(m => {
        if (m.options.masjid.masjidAddress.googlePlaceId == $('#masjidId').text()) {
            masjid = m.options.masjid
        }
    });
    $('#loader').show();
    let type = "updateMasjid";
    //update masjid object
    if ($('#editMasjidModal').is(':visible')) {
        masjid.masjidName = $('#txtMasjidName').val();
        masjid.notMasjid = $('#chkIsNotMasjid').is(':checked')
        masjid.masjidAddress.description = $('#description').val();
        masjid.masjidAddress.street = $('#street').val();
        masjid.masjidAddress.zipcode = $('#zipcode').val();
        masjid.masjidAddress.country = $('#country').val();
        masjid.masjidAddress.state = $('#state').val();
        masjid.masjidAddress.city = $('#city').val();
        masjid.masjidAddress.locality = $('#locality').val();
        masjid.masjidAddress.phone = $('#phone').val();
    }
    if ($('#editTimesModal').is(':visible')) {
        type = "editTimes";
        masjid.masjidTimings.fajr = $('#fajrVal').val();
        masjid.masjidTimings.zuhr = $('#zuhrVal').val();
        masjid.masjidTimings.asr = $('#asrVal').val();
        masjid.masjidTimings.maghrib = $('#maghribVal').val();
        masjid.masjidTimings.isha = $('#ishaVal').val();
        masjid.masjidTimings.jumah = $('#jumahVal').val();
    }
    masjid.masjidModifiedby = sessionStorage.getItem('userEmail')
    let masjidObj = {
        masjid: masjid,
        type: type
    }
    $.ajax({
        method: 'PUT',
        url: `${basePath}masjids`,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(masjidObj),
        headers: {
            "x-auth-token": sessionStorage.getItem('token'),
        },
        success: function (data) {
            $('#loader').hide();
            closeAllPopups();
            showAlert(data.message, 5000);
            clearMarkers(true)
        },
        error: function (errordata) {
            $('#loader').hide();
            if (errordata.state() == 'rejected' && errordata.readyState == 0)
                showAlert('Looks like we could not connect to the server/database at this time<br> Please try again later');
            else {
                closeAllPopups()
                if (errordata.responseJSON)
                    showAlert(errordata.responseJSON, 5000);
                else
                    showAlert(JSON.parse(errordata.responseText), 5000)
                if (errordata.status == 200) {
                    clearMarkers(true)
                }
            }
        }
    })
}
function verifyMasjid() {
    let masjid = {}
    markers.forEach(m => {
        if (m.options.masjid.masjidAddress.googlePlaceId == $('#masjidId').text()) {
            masjid = m.options.masjid
        }
    });
    $('#loader').show();
    masjid.verified = true;
    masjid.masjidModifiedby = sessionStorage.getItem('userEmail')
    masjid.notMasjid = $('#chkIsNotMasjid').is(':checked')
    let masjidObj = {
        masjid: masjid,
        type: "verifyMasjid"
    }
    $.ajax({
        method: 'PUT',
        url: `${basePath}masjids`,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(masjidObj),
        headers: {
            "x-auth-token": sessionStorage.getItem('token'),
        },
        success: function (data) {
            $('#loader').hide();
            closeAllPopups();
            showAlert(data.message, 5000);
            clearMarkers(true)
        },
        error: function (errordata) {
            $('#loader').hide();
            if (errordata.state() == 'rejected' && errordata.readyState == 0)
                showAlert('Looks like we could not connect to the server/database at this time<br> Please try again later');
            else {
                closeAllPopups()
                showAlert(errordata.responseJSON.message);
            }
        }
    })
}
//#endregion

function saveSettings() {
    if (!sessionStorage.getItem('userSettings') || !sessionStorage.getItem('token')) { return; }
    let settings = JSON.parse(atob(sessionStorage.getItem('userSettings')))
    const token = sessionStorage.getItem('token')
    settings.school = $("input[name='school'][value='1']").prop('checked') ? 1 : 0;
    settings.calcMethod = $('#calcMethod').val();
    settings.radius = $('#searchRadius').val();
    getUserByToken(token, settings)

}
function saveProfile() {
    if (!sessionStorage.getItem('userProfile') || !sessionStorage.getItem('token')) { return; }
    let profile = JSON.parse(atob(sessionStorage.getItem('userProfile')))
    const token = sessionStorage.getItem('token')
    profile.firstName = $('#userProfile_firstName').val();
    profile.lastName = $('#userProfile_lastName').val();
    getUserByToken(token, null, profile)
}

function updateSettings(userObj) {
    $.ajax({
        method: 'PUT',
        url: `${basePath}users`,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(userObj),
        headers: {
            "x-auth-token": sessionStorage.getItem('token'),
        },
        success: function (data) {
            setLoginUi(userObj.user);
            $('#loader').hide();
            closeAllPopups();
            showAlert(data.message, 5000);
            clearMarkers(true)
        },
        error: function (errordata) {
            throw errordata;
        }
    })
}