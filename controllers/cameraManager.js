import * as THREE from 'three';
class CameraController {
    constructor(camera, player) {
        this.camera = camera;
        this.player = player;
        this.offset = new THREE.Vector3(0, -14  ,10);

    }

    update() {
        this.camera.position.x = this.player.getPosition().x + this.offset.x;
        this.camera.position.y = this.player.getPosition().y + this.offset.y;
        this.camera.position.z = this.player.getPosition().z + this.offset.z + 20;
        this.camera.lookAt(this.player.getPosition());
    }
}

export default CameraController;