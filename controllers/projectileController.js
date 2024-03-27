import * as THREE from 'three';
import ModelController from './modelController';

export class Projectile {
    constructor(scene, position, target, speed = 20,towers,damage) {
        this.scene = scene;
        this.position = position.clone();
        this.target = target;
        this.direction = new THREE.Vector3().subVectors(target, position).normalize();
        this.speed = speed;
        this.towers = towers
        const geometry = new THREE.SphereGeometry(3, 32, 32);
        const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        scene.add(this.mesh);
        this.damage = damage;
        this.model = null;
        this.modelController = new ModelController(this.scene);
        this.modelController.createProjectile(this.position, this.team, model => {
            this.model = model;
        });
    }
    update() {
        if (!this.target) {
            return false;
        }
    
        // Calcula a direção do projétil em relação à posição do alvo
        const direction = new THREE.Vector3().subVectors(this.target.getPosition(), this.position).normalize();
    
        // Calcula a velocidade do movimento do projétil
        const speed = this.speed;
    
        // Atualiza a posição do projétil
        this.position.add(direction.clone().multiplyScalar(speed));
        // rotacionar modelo
        if (this.model) {
            this.model.position.copy(this.position);
            this.model.lookAt(this.target.getPosition());
        }
    
        // Verifica se o projétil atingiu o alvo
        const distanceToTarget = this.position.distanceTo(this.target.getPosition());
        if (distanceToTarget <= speed) {
            // Cause dano ao alvo
            this.target.takeDamage(this.damage);
            // Remove o projétil da cena
            this.scene.remove(this.mesh);
            // Indica que o projétil atingiu o alvo
            // remover o model da cena
            this.modelController.removeModel(this.model);
            return true;
        }
    
        // Indica que o projétil não atingiu o alvo ainda
        return false;
    }
    

}