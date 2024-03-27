import * as THREE from 'three';
import { HealthBarManager } from './healthBarManager';
import ModelController from './modelController';

class Soldier {
    constructor(scene, position,target, attackRadius = 0.4,followRadius = 6, moveSpeed = 0.1, cooldown = 100, healthPoints = 100, damage = 10, team='blue') {
        
        this.scene = scene;
        this.position = position;
        this.target = target;
        this.healthPoints = 100;
        this.team = team;
        this.mesh = this.createMesh();
        this.scene.add(this.mesh);
        this.attackRadius = attackRadius;
        this.cooldown = cooldown;
        this.cooldownCounter = 0;
        this.healthPoints = healthPoints;
        this.damage = damage;
        this.followRadius = followRadius;
        this.moveSpeed = moveSpeed;
        this.healthBarManager = new HealthBarManager(this, this.scene, this.scene);
        this.model = null;
        this.modelController = new ModelController(this.scene);
        this.modelController.createSoldier(this.position, this.team, model => {
            this.model = model;
        });
    }
    update(players, soldiers, towers) {
        this.healthBarManager.update();
        this.applySeparationForce(soldiers);
        this.updateModelPosition(); 

        let playerInRadius = this.findPlayerInRadius(players);
        if (playerInRadius) {
            this.target = playerInRadius;
            this.interactWithTarget(playerInRadius);
        } else {
            let target = this.findTarget(players, soldiers, towers);
            if (target && target.isAlive() && target.getTeam() !== this.getTeam()) {
                this.target = target;
                this.interactWithTarget(target);
            } else {
                this.moveTowardsNearestEnemyTower(towers);
            }
        }
    
        if (this.cooldownCounter > 0) {
            this.cooldownCounter--;
        }
    }
    
    applySeparationForce(soldiers) {
        const separationForce = new THREE.Vector3();
        for (const otherSoldier of soldiers) {
            if (otherSoldier !== this && otherSoldier.isAlive() && this.position.distanceTo(otherSoldier.position) < 1) {
                const force = new THREE.Vector3().subVectors(this.position, otherSoldier.position).normalize().multiplyScalar(0.05);
                force.z = 0;
                separationForce.add(force);
            }
        }
        this.position.add(separationForce);
    }
    
    findTarget(player, soldiers) {
        let target = null;
    
        // Acha o soldado mais próximo dentro do raio de followRadius
        for (const soldier of soldiers) {
            if (this.position && soldier.position) {
                const distance = this.position.distanceTo(soldier.position);
                if (distance <= this.followRadius && soldier.getTeam() !== this.getTeam()) {
                    if (soldier !== this && soldier.isAlive() && (!target || distance < this.position.distanceTo(target.position))) {
                        target = soldier;
                        break;
                    }
                }
            }
        }
    
        // Se não houver soldados dentro do raio de followRadius, siga o jogador
        if (!target && this.position && player.position) {
            const distanceToPlayer = this.position.distanceTo(player.position);
            if (distanceToPlayer <= this.followRadius) {
                target = player;
                this.model.lookAt(0, target.getPosition().y, 0);

            }
        }
    
        return target;
    }

    unsetTarget() {
        this.target = null;
    }
    interactWithTarget(target) {
        if (this.position.distanceTo(target.getPosition()) > this.attackRadius) {
            this.moveTowardsTarget(target);
        } else if (this.cooldownCounter === 0) {
            this.attack(target);
            this.cooldownCounter = this.cooldown;
        }
    }

    findPlayerInRadius(players) {
        for (let player of players) {
            if (player.getTeam() !== this.getTeam() && this.position.distanceTo(player.getPosition()) <= this.followRadius) {
                return player;
            }
        }
        return null;
    }
    
    moveTowardsTarget(target) {
        const direction = new THREE.Vector3().subVectors(target.getPosition(), this.position).normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        this.mesh.quaternion.copy(quaternion);
        this.position.add(direction.multiplyScalar(this.moveSpeed));
        this.mesh.position.copy(this.position);
        this.modelController.playAnimation(this.model, 'walk');
    }
    
    
    
    moveTowardsNearestEnemyTower(towers) {
        let nearestTower = null;
        for (const tower of towers) {
            if (tower.getTeam() !== this.getTeam()) {
                if (!nearestTower || this.position.distanceTo(tower.getPosition()) < this.position.distanceTo(nearestTower.getPosition())) {
                    nearestTower = tower;
                }
            }
        }
        if (nearestTower) {
            this.moveTowardsTarget(nearestTower);
        }
    }
    createMesh() {
        const geometry = new THREE.BoxGeometry(3, 2, 11);
        const material = new THREE.MeshBasicMaterial({ opacity: 0, transparent: true, depthWrite: false });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(this.position);
        return mesh;
    }

    takeDamage(amount) {
        this.healthPoints -= amount;
        this.healthBarManager.update();
        if (this.healthPoints <= 0) {
            this.die();
        }
    }
    die() {
        this.scene.remove(this.mesh);
        if (this.model) {
            this.modelController.removeModel(this.model);
        }
    }
    isAlive() {
        this.outOfRangeCounter++;
        return this.healthPoints > 0;
    }
    getPosition() {
        return this.mesh.position;
    }
    setPosition(position) {
        this.position = position;
    }
    attack(target) {
        if (!this.isAlive()) {
            return;
        }
        if (target.isAlive() && target.getTeam() !== this.team) {
            target.takeDamage(this.damage);
        }
        //stop walk animation and attack
        this.modelController.playAnimation(this.model, 'idle');
        this.modelController.playAnimation(this.model, 'attack');
    }
    getTeam() {
        return this.team;
    }
    moveTo(position) {
        this.position = position;
        this.mesh.position.copy(position);
        this.followRadiusIndicator.position.copy(position);
        this.attackRadiusIndicator.position.copy(position);
    }
    isClicked(worldPosition) {
        return this.mesh.geometry.boundingBox.containsPoint(worldPosition);
    }
    updateModelPosition() {
        if (this.model && this.model.position && this.mesh) {
            // Copia a posição do mesh para o modelo
            this.model.position.copy(this.mesh.position);
            this.model.rotation.copy(this.mesh.rotation);
            //nao rotacionar no eixo y
            this.model.rotation.y = 0;
        }
    }
    
    
}

export default Soldier;