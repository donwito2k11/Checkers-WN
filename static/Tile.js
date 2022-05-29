class Tile extends THREE.Mesh {
    constructor(white) {
        let tileGeometry = new THREE.BoxGeometry(10, 2, 10);

        let boardBlack = new THREE.MeshBasicMaterial({
            color: 0x171f29,
            side: THREE.DoubleSide, // dwustronny
            map: new THREE.TextureLoader().load('textures/woodTexture.png'), // plik tekstury
            opacity: 1, // stopień przezroczystości

        })

        let boardWhite = new THREE.MeshBasicMaterial({
            color: 0xfff8e7,
            side: THREE.DoubleSide, // dwustronny
            map: new THREE.TextureLoader().load('textures/woodTexture.png'), // plik tekstury
            opacity: 1, // stopień przezroczystości

        })

        super(tileGeometry, white ? boardWhite : boardBlack) // wywołanie konstruktora klasy z której dziedziczymy czyli z Meshas
        this.isWhite = white
    }

    select() {
        this.material.color.setHex(0x00ffff)
    }

    deselect() {
        this.material.color.setHex(this.isWhite ? 0xfff8e7 : 0x171f29)
        //this.material.color.setHex(this.isWhite ? 0xaaaaaa : 0xff0000)
    }
}

export default Tile