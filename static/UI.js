class UI {
    constructor() {
        window.addEventListener("resize", (e) => {
            window.game.resize()
        }, false);

        window.addEventListener("mousedown", (e) => {
            window.game.raycast(e);
        });

        document.getElementById("login-play-btn").onclick = () => {
            let onlogin = (name, color) => {
                document.getElementById("login-holder").style.visibility = "hidden";

                this.setStatus("Playing as: " + (color == 0 ? "white" : "black"));

                if (color == 0) {
                    document.getElementById("display").innerHTML = "Awaiting second player...";
                }
            }

            window.net.login(onlogin)
        }

        document.getElementById("login-reset-btn").onclick = () => {
            window.net.reset()
        }

        document.getElementById("end-btn").onclick = () => {
            window.location.replace(window.location)
        }

        document.getElementById("end").style.display = "none"
    }

    updateTable() {
        console.log(window.game.isWhite)
        if (window.game.isWhite) {
            document.getElementById("debug").innerHTML = window.game.pawnsTable.map(r => r.map(i => i == 0 ? `<div class="gray"> ${i} </div>`
                : i == 1 ? `<div class="white"> ${i} </div>`
                    : `<div class="black"> ${i} </div>`).join('')).join("</br>");
        } else {
            var sus = window.game.pawnsTable.map(function (arr) {
                return arr.slice();
            });
            document.getElementById("debug").innerHTML = sus.reverse().map(r => r.reverse().map(i => i == 0 ? `<div class="gray"> ${i} </div>`
                : i == 1 ? `<div class="white"> ${i} </div>`
                    : `<div class="black"> ${i} </div>`).join('')).join("</br>");
        }
    }

    showEnd(winner) {
        document.getElementById("end").style.display = "flex"
        document.getElementById("end-msg").innerText = (winner ? "You won!" : "You lost")
    }

    setStatus(text) {
        document.getElementById("status").innerText = text
    }

    setTimer(text) {
        document.getElementById("timer").innerText = text
    }
}

export default UI