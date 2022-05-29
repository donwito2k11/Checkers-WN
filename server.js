const express = require("express");
const app = express()
const fs = require("fs")
const path = require('path')
const PORT = process.env.PORT || 3000;
app.use(express.static("static"))

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

let players = [],
    playing = -1,
    gameRunning = false,
    time = 0

// Player state
// 0 - awaiting players
// 1 - ready to play
// 2 - playing
// 3 - awaiting move confirm
// 4 - move sync pending

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})

app.route("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/static/index.html"))
})

app.post("/login", function (req, res) {
    let color = players.length
    let name = req.body.login

    if (players.map(p => p.name).includes(name)) {
        // check if user exists
        res.send(JSON.stringify({ isPlayer: false, error: 1 }));
    } else if (color < 2) {
        // add player, assign color
        players.push(
            // player creation
            { name: name, color: color, state: 0, time: -1, move: null }
        )
        console.log(name, "joined")

        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({ isPlayer: true, color: color }));

        if (color == 1) {
            gameRunning = true;
            players.forEach(p => p.state = 1);
            playing = 0;
        }
    }
    else {
        // already have 2 players
        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({ isPlayer: false, error: 0 }));
    }

    // error 0 : too many players
    // error 1 : username exists
})

app.post("/reset", function (req, res) {
    console.log("Reset players")
    players = []
    playing = -1;
    gameRunning = false;

    res.setHeader("content-type", 'application/json')
    res.send(JSON.stringify({}));
})

app.post("/update", function (req, res) {
    if (players.length == 0 && !gameRunning) {
        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({
            state: 5,
        }));
        return;
    }

    let p = players[req.body.isWhite ? 0 : 1];
    //console.log(playing, p.color, req.body.isWhite ? "w" : "b", p.time, time)

    //console.log(req.body, p)
    if (p == players[playing] && p.time != -1 && time - p.time > 30) {
        players[req.body.isWhite ? 1 : 0].state = 4

        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({
            state: 4,
            winner: false
        }));
    }
    else if (p.state == 4) {
        console.log("Reset players")
        players = []
        playing = -1;
        gameRunning = false;

        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({
            state: 4,
            winner: true
        }));
    } else if (p.state == 3) {
        // send move to sync
        console.log("Synced move with player", req.body.isWhite ? 0 : 1)

        p.state = 2
        console.log(p.time)
        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({
            state: 3,
            move: (p.move),
            hasMove: true
        }));
    } else if (p.state == 2) {
        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({
            state: 2,
            time: 30 - (time - players[playing].time)
        }));
    } else if (p.state == 1) {
        console.log("loaded player", req.body.isWhite ? 1 : 2)
        if (!p.isWhite) p.time = time

        p.state = 2
        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({
            state: 1
        }));
    } else {
        res.setHeader("content-type", 'application/json')
        res.send(JSON.stringify({
            state: 0
        }));
    }
})

app.post("/move", function (req, res) {
    console.log("Recieved move", req.body)

    let e = players[!req.body.isWhite ? 0 : 1];
    players[req.body.isWhite ? 0 : 1].time = -1;

    e.move = req.body;
    e.state = 3;
    e.time = time;

    playing = req.body.isWhite ? 1 : 0

    res.setHeader("content-type", 'application/json')
    res.send(JSON.stringify({

    }));
})

setInterval(() => {
    time++
}, 1000)