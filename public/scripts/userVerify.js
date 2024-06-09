$(document).ready(() => {
    var urlParams = new URLSearchParams(window.location.search);
    var code = urlParams.get('code');
    var basePath = 'https://masjidnearme.azurewebsites.net/v1/users/'
    var u = '';
    if (!code || code.length == 0) {
        showErrorState()
    }
    else {
        u = `${basePath}verify/${code}`;
    }
    $.ajax({
        type: 'GET',
        url: u,
        crossDomain: true,
        cache: true,
        dataType: 'JSON',
        success: function (data, status) {
            showSuccessState(data)
        },
        error: function (errordata) {
            showErrorState()
        }
    });
});
function showSuccessState(user) {
    $('#notok').prop('hidden', true);
    $('#verifying').prop('hidden', true);
    $('#ok').prop('hidden', false);

    if (user && user.userEmail)
        $('#useremail').html(user.userEmail)
    redirect();
}
function showErrorState() {
    $('#ok').prop('hidden', true);
    $('#verifying').prop('hidden', true);
    $('#notok').prop('hidden', false);

    redirect();
}
function redirect() {
    setTimeout(() => {
        // window.location.href = 'https://masjidnear.me'
    }, 5000);
}