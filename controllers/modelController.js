import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class ModelController {
    constructor(scene) {
        this.scene = scene;
        this.loader = new GLTFLoader();
        this.animations = {};
    }

    loadModel(url, position, rotation, scale, color, callback) {
        this.loader.load(
            url,
            (glb) => {
                const model = glb.scene;
                model.position.copy(position);
                model.scale.set(scale, scale, scale);       
                model.rotation.set(rotation.x, rotation.y, rotation.z);

                // // Aplica a cor ao modelo, se fornecida
                // if (color) {
                //     model.traverse((child) => {
                //         if (child.isMesh) {
                //             child.material.color = new THREE.Color(color);
                //         }
                //     });
                // }

                // Aplica a rotação ao modelo
                model.rotation.set(rotation.x, rotation.y, rotation.z);

                // Adiciona o modelo à cena
                this.scene.add(model);

                if (glb.animations && glb.animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(model);
                    const idle = mixer.clipAction(glb.animations[0]);
                    const walk = mixer.clipAction(glb.animations[1]);
                    const attack = mixer.clipAction(glb.animations[2]);
                    const die = mixer.clipAction(glb.animations[3]);
    
                    model.userData.mixer = mixer;
                }

                // Store all animations in an object on the model
                model.userData.animations = {};
                glb.animations.forEach((animation) => {
                    model.userData.animations[animation.name] = animation;
                });
                // Chama o callback, se fornecido
                if (callback) callback(model);
            },
            (error) => {
                // console.error('An error happened while loading the model', error);
            }
        );
    }
    playAnimation(model, animationName, speed = 1) {
        if (!model) {
            return;
        }

        const animation = model.userData.animations[animationName];
        if (animation) {
            const action = model.userData.mixer.clipAction(animation);
            action.setDuration(speed);
            action.play();
        } else {
            console.warn(`Animation "${animationName}" not found`);
        }
    }
    stopAnimation(model, animationName) {
        if (!model) {
            return;
        }
        const animation = model.userData.animations[animationName];
        if (animation) {
            const action = model.userData.mixer.clipAction(animation);
            action.stop();
        } else {
            console.warn(`Animation "${animationName}" not found`);
        }
    }
    
    createSoldier(position, color, callback) {
        const url = './../player.glb';
        const rotation = new THREE.Vector3(0, 0, 0);
        const scale = 7;
        this.loadModel(url, position, rotation, scale, color, callback);
    }

    createTower(position, color, callback) {
        const url = './../tower.glb';
        const rotation = new THREE.Vector3(1, 0, 0);
        const scale = 1;
        this.loadModel(url, position, rotation, scale, color, callback);
    }

    createProjectile(position, color, callback) {
        const url = './../banana.glb';
        const rotation = new THREE.Vector3(0, 0, 0);
        const scale = 0.8;
        this.loadModel(url, position, rotation, scale, color, callback);
    }

    createTerrain(callback) {
        const url = './../terrain.glb';
        const position = new THREE.Vector3(0, 0, 0);
        const rotation = new THREE.Vector3(0, 0, 0);
        const scale = 2;
        this.loadModel(url, position, rotation, scale, null, callback);
    }

    createPlayer(position, color, callback) {
        const url = './../player.glb';
        const rotation = new THREE.Vector3(0, 0, 0);
        const scale = 8;
        this.loadModel(url, position, rotation, scale, color, callback);
    }

    removeModel(model) {
        this.scene.remove(model);
    }

    update(delta) {
        // Update animations
        this.scene.children.forEach(child => {
            if (child.userData.mixer) {
                child.userData.mixer.update(delta);
            }
        });
        // update
    }

}

export default ModelController;
