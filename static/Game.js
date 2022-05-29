import Tile from "./Tile.js"
import Pawn from "./Pawn.js"

class Game {
    constructor() {
        this.selectedPawn = null;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xbdc3c7);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.raycaster = new THREE.Raycaster(); // obiekt Raycastera symulujący "rzucanie" promieni
        this.mouseVector = new THREE.Vector2() // ten wektor czyli pozycja w przestrzeni 2D na ekranie(x,y) wykorzystany będzie do określenie pozycji myszy na ekranie, a potem przeliczenia na pozycje 3D

        this.camera.position.set(100, 100, 0);
        this.camera.lookAt(this.scene.position);

        this.hasMove = false;
        this.isMoving = false;
        this.isTaking = false;
        this.isWhite = true;
        this.isPlaying = false;

        document.getElementById("root").append(this.renderer.domElement);

        this.render() // wywołanie metody render
    }

    load() {
        this.checkerboardTemplate = [];
        this.tilesObj = [];
        for (let r = 0; r < 8; r++) {
            let row = [];
            let tilesRow = [];
            for (let c = 0; c < 8; c++) {
                row.push((c + r) % 2);

                let tile = new Tile((c + r) % 2 != 1)
                let pos = Game.ToSceneLoc(r, c)
                tile.position.set(pos.x, -2, pos.z)
                this.scene.add(tile);
                tilesRow.push(tile)
            }
            this.checkerboardTemplate.push(row);
            this.tilesObj.push(tilesRow)
        }

        this.pawnsTable = [];
        this.pawnsObjTable = [];
        for (let r = 0; r < 8; r++) {
            let row = [];
            for (let c = 0; c < 8; c++) {
                if ((r < 3 || r > 4) && (c + r) % 2 == 1) {
                    row.push(r > 4 ? 1 : 2);

                    let pawn = new Pawn(r > 4, this);

                    this.pawnsObjTable.push(pawn);
                    let pos = Game.ToSceneLoc(r, c)

                    pawn.position.set(pos.x, 0, pos.z)
                    this.scene.add(pawn);
                }
                else row.push(0);
            }
            this.pawnsTable.push(row);
        }

        this.hasMove = true;
        if (!this.isWhite) {
            this.camera.position.set(-100, 100, 0);
            this.camera.lookAt(this.scene.position);
            this.hasMove = false;
        }

        window.ui.updateTable()
    }

    render = () => {
        requestAnimationFrame(this.render);
        this.renderer.render(this.scene, this.camera);
        TWEEN.update();
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    getLegalMoves(from) {
        let possibleMoves = [],
            proto = []
        proto.push({ x: from.x + (this.isWhite ? -1 : 1), z: from.z - 1, t: false })
        proto.push({ x: from.x + (this.isWhite ? -1 : 1), z: from.z + 1, t: false })
        proto.push({ x: from.x + (this.isWhite ? -2 : 2), z: from.z - 2, t: true })
        proto.push({ x: from.x + (this.isWhite ? -2 : 2), z: from.z + 2, t: true })


        proto.forEach(pos => {
            if (pos.x >= 0 && pos.x < 8 && pos.z >= 0 && pos.z < 8 &&
                this.pawnsTable[pos.x][pos.z] == 0
            ) {
                if (!pos.t || this.pawnsTable[(pos.x + from.x) / 2][(pos.z + from.z) / 2] === (this.isWhite ? 2 : 1))
                    possibleMoves.push({ x: pos.x, z: pos.z, isTaking: pos.t })
            }
        })

        return possibleMoves
    }

    clearHints() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                this.tilesObj[i][j].deselect()
            }
        }
    }

    raycast(e) {
        this.mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouseVector, this.camera);

        const intersects = this.raycaster.intersectObjects(this.scene.children);

        if (intersects.length == 0 && this.selectedPawn != null && !this.isMoving && this.hasMove) {
            //anim
            this.isMoving = true
            this.selectedPawn.deselect()
            this.selectedPawn = null
            this.clearHints()
        }

        if (intersects.length > 0 && !this.isMoving && this.hasMove) {
            const obj = intersects[0].object;

            //select / reselect pawn
            if (obj instanceof Pawn && obj != this.selectedPawn && obj.isWhite == this.isWhite && obj.active) {
                if (this.selectedPawn != null) {
                    // deselect old pawn
                    this.isMoving = true
                    this.selectedPawn.deselect()
                    this.clearHints()
                }

                // select new pawn
                this.selectedPawn = obj
                this.isMoving = true

                let from = Game.ToTableLoc(this.selectedPawn.position.x, this.selectedPawn.position.z, this.isWhite)
                let legal = this.getLegalMoves(from)
                legal.forEach(t => this.tilesObj[t.x][t.z].select())

                obj.select();
            }
            //move
            else if (this.selectedPawn != null && this.selectedPawn.active && obj instanceof Tile && !obj.isWhite) {
                let from = Game.ToTableLoc(this.selectedPawn.position.x, this.selectedPawn.position.z, this.isWhite)
                let to = Game.ToTableLoc(obj.position.x, obj.position.z, this.isWhite)
                let legal = this.getLegalMoves(from).filter(d => d.x == to.x && d.z == to.z)
                if (legal.length > 0) {
                    this.isMoving = true
                    this.hasMove = false

                    // submit move to server/local array
                    this.pawnsTable[from.x][from.z] = 0;
                    this.pawnsTable[to.x][to.z] = (this.isWhite ? 1 : 2);

                    if (legal[0].isTaking) {
                        let take = { x: (from.x + to.x) / 2, z: (from.z + to.z) / 2 }
                        this.pawnsTable[take.x][take.z] = 0;

                        let loc = Game.ToSceneLoc(take.x, take.z)
                        let takenPawn = this.pawnsObjTable.find(p => p.position.x == loc.x && p.position.z == loc.z)
                        //this.pawnsObjTable = this.pawnsObjTable.filter(p => p.position.x != loc.x && p.position.z != loc.z)
                        takenPawn.take(() => this.scene.remove(takenPawn))
                    }

                    console.log(this.pawnsObjTable.length)

                    this.selectedPawn.moveTo(obj.position)
                    window.ui.updateTable()
                    window.net.move(from, to, legal[0].isTaking)

                    this.clearHints()
                    this.selectedPawn = null
                }
            }
            else {

            }
        }
    }

    enemyMove(from, to, isTaking) {
        this.isMoving = true

        let posPawn = Game.ToSceneLoc(from.x, from.z)
        let posDest = Game.ToSceneLoc(to.x, to.z)

        this.pawnsTable[from.x][from.z] = 0;
        this.pawnsTable[to.x][to.z] = (!this.isWhite ? 1 : 2);

        let pawn = this.pawnsObjTable.find(p => p.position.x == posPawn.x && p.position.z == posPawn.z)

        if (isTaking) {
            let take = { x: (from.x + to.x) / 2, z: (from.z + to.z) / 2 }
            this.pawnsTable[take.x][take.z] = 0;

            let loc = Game.ToSceneLoc(take.x, take.z)
            let takenPawn = this.pawnsObjTable.find(p => p.position.x == loc.x && p.position.z == loc.z)
            //this.pawnsObjTable = this.pawnsObjTable.filter(p => p.position.x != loc.x && p.position.z != loc.z)
            takenPawn.take(() => this.scene.remove(takenPawn))
        }

        console.log(this.pawnsObjTable.length)

        window.ui.updateTable()
        pawn.fullMove(posDest)
    }

    end() {
        this.hasMove = false
        if (this.selectedPawn) {
            this.selectedPawn.deselect()
            this.selectedPawn == null
        }
    }

    static ToTableLoc(x, z) {
        return {
            x: (35 + x) / 10,
            z: (35 - z) / 10,
        }
    }

    static ToSceneLoc(x, z) {
        return {
            x: (x - 3.5) * 10,
            z: (3.5 - z) * 10,
        }
    }
}

export default Game