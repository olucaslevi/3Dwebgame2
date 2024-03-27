import * as THREE from 'three';
import ModelController from './modelController';
class TerrainManager {
    constructor(scene) {
        this.scene = scene;
        this.model = null;
        this.modelController = new ModelController(this.scene);
        this.modelController.createTerrain(model => {
            this.model = model;
        });
    }

    createTerrain() {
        const terrainGeometry = new THREE.PlaneGeometry(200, 200, 32, 32);
        //transparent material
        const terrainMaterial = new THREE.MeshBasicMaterial({ opacity: 0, transparent: true, depthWrite: false });    
        const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrain.position.y = -10;
        const directionalLight = new THREE.DirectionalLight('white', 2); //Cooler color temperature
        const fillLight = new THREE.DirectionalLight('white', 2); // Warmer color, lower intensity
        
        directionalLight.position.set(0,0,10); // Change position of directional light
        fillLight.position.set(1,1,1); // Change position of fill light
        
        this.scene.add(directionalLight);
        this.scene.add(fillLight);

        this.scene.add(terrain);
        return terrain;
    }

    getHeightAtPoint() {
        return 0;
    }
}

export default TerrainManager;