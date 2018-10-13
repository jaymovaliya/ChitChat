$(document).ready(function () {
    const socket = io();

    socket.on('connect', function () {
        let userdata = jQuery.deparam(window.location.search);
        socket.emit('join',userdata);
    });

    socket.on('disconnect', function () {
        console.log('Disconnected');
    });

    socket.on('userList', function (users) {
        console.log(users);
    });

    socket.on('newMessage', function (data) {
        let template = jQuery('#messages-template').html();
        let html = Mustache.render(template,{
            from:data.from,
            message:data.message,
            time:data.time
        });
        jQuery('#messages').append(html);
    });

    $('#message-form').on('submit', function (e) {
        e.preventDefault();
        let message = $('#message').val();
        socket.emit('createMessage', {
            from: "User",
            message: message,
            time: Date.now()
        });
    });
});
