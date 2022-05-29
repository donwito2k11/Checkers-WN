class Pawn extends THREE.Mesh {

    static pawnGeometry = new THREE.CylinderGeometry(5, 5, 2, 24);

    constructor(white, creator) {
        let pawnWhite = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide, // dwustronny
            map: new THREE.TextureLoader().load('textures/woodTexture.png'), // plik tekstury
            opacity: 1, // stopień przezroczystości
            transparent: true,
        })

        let pawnBlack = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide, // dwustronny
            map: new THREE.TextureLoader().load('textures/woodTexture.png'), // plik tekstury
            opacity: 1, // stopień przezroczystości
            transparent: true,
        })

        super(Pawn.pawnGeometry, white ? pawnWhite : pawnBlack) // wywołanie konstruktora klasy z której dziedziczymy czyli z Meshas
        this.isWhite = white
        this.active = true
        this.isPromoted = false
        this.game = creator
    }

    select() {
        this.material.color.setHex(0x00ff00)
        let original = { x: this.position.x, z: this.position.z }

        new TWEEN.Tween(this.position) // co
            .to({
                x: this.position.x,
                y: 5,
                z: this.position.z
            }, 300) // do jakiej pozycji, w jakim czasie
            .repeat() // liczba powtórzeń
            .easing(TWEEN.Easing.Cubic.Out) // typ easingu (zmiana w czasie)
            .onUpdate(() => { })
            .onComplete(() => {
                this.game.isMoving = false
                window.game.pawnsObjTable.forEach(element => {
                    if (element.position.x == original.x && element.position.z == original.z) {
                        element.position.y = 5
                    }
                })

            }) // funkcja po zakończeniu animacji
            .start()
    }

    deselect() {
        this.material.color.setHex(this.isWhite ? 0xffffff : 0xff0000)
        let original = { x: this.position.x, z: this.position.z }

        new TWEEN.Tween(this.position) // co
            .to({
                x: this.position.x,
                y: 0,
                z: this.position.z
            }, 300) // do jakiej pozycji, w jakim czasie
            .repeat() // liczba powtórzeń
            .easing(TWEEN.Easing.Cubic.Out) // typ easingu (zmiana w czasie)
            .onUpdate(() => { })
            .onComplete(() => {
                this.game.isMoving = false
                window.game.pawnsObjTable.forEach(element => {
                    if (element.position.x == original.x && element.position.z == original.z) {
                        element.position.y = 0
                    }
                })


            }) // funkcja po zakończeniu animacji
            .start()
    }

    moveTo(pos) {
        let original = { x: this.position.x, z: this.position.z }

        new TWEEN.Tween(this.position) // co
            .to({
                x: pos.x,
                z: pos.z
            }, 300) // do jakiej pozycji, w jakim czasie
            .repeat() // liczba powtórzeń
            .easing(TWEEN.Easing.Cubic.Out) // typ easingu (zmiana w czasie)
            .onUpdate(() => { })
            .onComplete(() => {

                window.game.pawnsObjTable.forEach(element => {
                    if (element.position.x == original.x && element.position.z == original.z) {
                        element.position.x = pos.x
                        element.position.z = pos.z
                    }
                })
                this.deselect();
            }) // funkcja po zakończeniu animacji
            .start()
    }

    fullMove(pos) {
        let original = { x: this.position.x, z: this.position.z }

        new TWEEN.Tween(this.position) // co
            .to({
                x: this.position.x,
                y: 5,
                z: this.position.z
            }, 300) // do jakiej pozycji, w jakim czasie
            .repeat() // liczba powtórzeń
            .easing(TWEEN.Easing.Cubic.Out) // typ easingu (zmiana w czasie)
            .onUpdate(() => { })
            .onComplete(() => {

                window.game.pawnsObjTable.forEach(element => {
                    if (element.position.x == original.x && element.position.z == original.z) {
                        element.position.y = 5
                    }
                })
                this.moveTo(pos)
            }
            ) // funkcja po zakończeniu animacji
            .start()
    }

    take(t) {
        let original = { x: this.position.x, z: this.position.z }

        this.active = false
        //this.material.opacity = 0

        new TWEEN.Tween(this.position) // co
            .to({
                x: this.position.x,
                y: -2.1,
                z: this.position.z
            }, 500) // do jakiej pozycji, w jakim czasie
            .repeat() // liczba powtórzeń
            .easing(TWEEN.Easing.Cubic.Out) // typ easingu (zmiana w czasie)
            .onUpdate(() => { })
            .onComplete(() => {
                this.position.x = 1000
                this.position.y = 1000
                this.position.z = 1000
                this.geometry.dispose();
                this.material.dispose();
                t()
                window.game.pawnsObjTable.forEach(element => {
                    if (element.position.x == original.x && element.position.z == original.z) {
                        window.game.scene.remove(element)
                        t()
                    }
                })
            }) // funkcja po zakończeniu animacji
            .start()
    }
}

export default Pawn