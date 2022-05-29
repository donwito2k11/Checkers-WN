class Net {
    constructor() {
        this.playerWhiteLoggedIn = false;
        this.playerBlackLoggedIn = false;

        this.intervalid = 0;
    }

    login(onLogin) {
        const login = document.getElementById("login-input").value

        console.log("login");

        if (login != "") {
            const body = JSON.stringify({ login: login })

            const headers = { "Content-Type": "application/json" }

            fetch("/login", { method: "post", body, headers })
                .then(response => response.json())
                .then(
                    data => {
                        if (data.isPlayer) {
                            onLogin(login, data.color)
                            window.game.isWhite = data.color == 0

                            clearInterval(this.intervalid)
                            this.intervalid = setInterval(this.update, 100);
                        } else {
                            switch (data.error) {
                                case 0:
                                    window.ui.setStatus("ERROR: two players already in game. Reset to create a new game.")
                                    break;
                                case 1:
                                    window.ui.setStatus("ERROR: user with that name is already in the game. Reset to create a new game.")
                                    break;
                                default:
                                    window.ui.setStatus("ERROR: unknown error. Reset to create a new game.")
                            }
                        }
                    }
                )
        }

    }

    update() {
        let body = null

        if (!window.game.isPlaying) {
            body = JSON.stringify({
                isPlaying: window.game.isPlaying,
                isWhite: window.game.isWhite,
            })
        }
        else {
            body = JSON.stringify({
                isPlaying: window.game.isPlaying,
                isWhite: window.game.isWhite,
            })
        }


        const headers = { "Content-Type": "application/json" }

        fetch("/update", { method: "post", body, headers })
            .then(response => response.json())
            .then(
                data => {
                    if (data.state == 5 && window.game.isPlaying) {
                        clearInterval(this.intervalid)
                        window.location.replace(window.location)
                        window.ui.setStatus("RESET: Another client has forcefully reset the game.")
                        window.game.isPlaying = false
                    } else if (data.state == 4) {
                        window.game.isPlaying = false
                        window.game.end()
                        window.ui.showEnd(data.winner)
                        clearInterval(this.intervalid)
                    }
                    else if (data.state == 3) {
                        window.ui.setStatus("LOG: Recieved Move")
                        console.log("Recieved Move:", data)
                        window.game.hasMove = true
                        window.game.enemyMove(data.move.from, data.move.to, data.move.isTaking)
                    } else if (data.state == 2) {
                        window.ui.setTimer((window.game.hasMove ? "You have " : "Your opponent has ") + data.time + " seconds left to move");
                    } else if (data.state == 1) {
                        console.log("game start")

                        document.getElementById("display").style.display = "none"
                        window.game.load()
                    } else {

                    }
                }
            )
    }

    move(from, to, taking) {
        window.ui.setStatus("LOG: Sent Move")
        console.log("sent move")

        const body = JSON.stringify({
            isWhite: window.game.isWhite,
            isTaking: taking,
            from: from,
            to: to,
        })

        const headers = { "Content-Type": "application/json" }

        fetch("/move", { method: "post", body, headers })
            .then(response => response.json())
            .then(data => {

            }
            )
    }

    reset() {
        const body = JSON.stringify({ reset: "reset" })
        const headers = { "Content-Type": "application/json" }

        fetch("/reset", { method: "post", body, headers })
            .then(response => response.json())
            .then(
                data => {
                    window.ui.setStatus("RESET: Reseting the game for all clients.")
                    clearInterval(this.intervalid)
                }
            )
    }
}

export default Net