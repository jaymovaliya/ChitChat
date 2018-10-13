const express = require('express');
const path = require('path');
const sockets = require('socket.io');
const http = require('http');
const MongoClient = require('mongodb').MongoClient;
const pubpath = path.join(__dirname, 'public');
const {Users} = require('./public/js/users');
const app = express();
const server = http.createServer(app);
const moment = require('moment');
app.use(express.static(pubpath));
const io = sockets(server);
let users = new Users();
const dburl = 'mongodb+srv://chitchatadmin:chitchatadmin@chitchat-5uc1r.gcp.mongodb.net/admin/';

//(async () => {
try {
    //const client = await MongoClient.connect(dburl, {useNewUrlParser: true});
    MongoClient.connect(dburl, {useNewUrlParser: true}, function (err, db) {
        if (err)
            console.log('error to connect');
        else {
            let dbo = db.db('chitchat');
            io.on('connection', function (socket) {
                console.log('new user connected');

                socket.on('disconnect', function () {
                    let user = users.removeUser(socket.id);
                    if (user) {
                        io.to(user.grp).emit('userList', users.getUserList(user.grp));
                        io.to(user.grp).emit('newMessage', {
                            from: "ChitChat Says",
                            message: `${user.name} has left the chat`,
                            time: moment(Date.now()).format('h:mm a')
                        });
                    }
                });

                socket.on('join', function (userdata) {
                    socket.join(userdata.grp);
                    users.addUser(socket.id, userdata.uname, userdata.grp);

                    io.to(userdata.grp).emit('userList', users.getUserList(userdata.grp));
                    let chatdata = dbo.collection('groups').find({group: userdata.grp}).sort({"time": 1}).toArray(function (err, data) {
                        if (err) {
                            console.log(err.message);
                        }
                        else {
                            console.log(data);
                            for (let i = 0; i < data.length; ++i) {
                                data[i].time = moment(data[i].time).format('h:mm a');
                                socket.emit('newMessage', data[i]);
                            }
                        }
                    });

                    let username = userdata.uname;
                    socket.emit('newMessage', {
                        from: "ChitChat Says",
                        message: "Welcome to ChitChat",
                        time: moment(Date.now()).format('h:mm a')
                    });
                    socket.broadcast.to(userdata.grp).emit('newMessage', {
                        from: "ChitChat Says",
                        message: "" + username + " has joined",
                        time: moment(Date.now()).format('h:mm a')
                    });
                });

                socket.on('createMessage', function (data) {
                    let user = users.getUser(socket.id);
                    data.from = user.name;
                    let date = moment(data.time);
                    let time = date.format('h:mm a');
                    data.time = time;
                    data.group = user.grp;
                    // add data to chat history
                    console.log(data);
                    let insdata = {
                        from: user.name,
                        message: data.message,
                        time: Date.now(),
                        group: user.grp
                    };
                    try {
                        let insertdata = dbo.collection('groups').insertOne(insdata);
                    } catch (e) {
                        console.log('error related to inserting document')
                    }
                    io.to(user.grp).emit('newMessage', data);
                });
            });
        }
    });
    server.listen(process.env.PORT ||8080, function () {
        console.log('Server started');
    });
} catch (e) {
    console.log('big error');
}
//}
//)();

