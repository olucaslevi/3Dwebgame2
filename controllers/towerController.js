import * as THREE from 'three';
import { Projectile } from './../controllers/projectileController';
import { HealthBarManager } from './healthBarManager';
import ModelController from './modelController';

class Tower {
    constructor(scene, position, attackRadius = 20, cooldown = 100, healthPoints = 100, damage = 10, camera, team) {
        this.scene = scene;
        this.position = position;
        this.attackRadius = attackRadius;
        this.cooldown = cooldown;
        this.cooldownCounter = 0;
        this.healthPoints = healthPoints;   
        this.damage = damage;
        this.projectiles = [];
        this.camera = camera;
        this.team = team;
        this.createTowerMesh();
        this.healthBarManager = new HealthBarManager(this, camera, scene);
        this.model = null;
        this.modelController = new ModelController(this.scene);
        this.modelController.createTower(this.position, this.team, model => {
            this.model = model;
        });

    }

    createTowerMesh() {
        const geometry = new THREE.BoxGeometry(6, 5, 14);
        const material = new THREE.MeshBasicMaterial({ opacity: 0, transparent: true, depthWrite: false });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.scene.add(this.mesh);

    }

    shoot(target, damage) {
        console.log(this.team,' alvo ',target)
        if (!target.isAlive()) {
            return;
        }
        if (target.getTeam() === this.team) {
            return;
        }
        const projectile = new Projectile(this.scene, this.position, target, 0.2, this.team,damage);
        this.projectiles.push(projectile);
    }
    
    update(player, soldiers, towers) {
        if (this.cooldownCounter > 0) {
            this.cooldownCounter--;
        }
    
        let aliveSoldiers = soldiers.filter(soldier => soldier.isAlive());
        let alivePlayer = player.isAlive();
        
        // Priorizar o jogador como alvo se estiver dentro do alcance
        if (alivePlayer && this.position.distanceTo(player.mesh.position) <= this.attackRadius && this.cooldownCounter === 0) {
            this.shoot(player, this.damage);
            this.cooldownCounter = this.cooldown;
            return; // Interrompe a execução para que a torre ataque apenas o jogador neste ciclo
        }
        
        // Se o jogador não for atacado, então atacar os soldados
        aliveSoldiers.forEach(soldier => {
            const distanceToSoldier = this.position.distanceTo(soldier.mesh.position);
            if (distanceToSoldier <= this.attackRadius && this.cooldownCounter === 0) {
                this.shoot(soldier, this.damage);
                this.cooldownCounter = this.cooldown;
            }
        });
    
        this.projectiles = this.projectiles.filter(projectile => !projectile.update(player, aliveSoldiers, towers));
        this.healthBarManager.update();
    }


    takeDamage(damage) {
        this.healthPoints -= damage;
        if (this.healthPoints <= 0) {
            this.healthPoints = 0;
            this.die();
        }
        if (this.healthBarManager) {
            this.healthBarManager.update();
        }
    }

    getDamage() {
        return this.damage;
    }

    getPosition() {
        return this.mesh.position.clone();
    }

    getTeam() {
        return this.team;
    }

    isAlive() {
        return this.healthPoints > 0;
    }

    setPosition(position) {
        this.position = position;
        this.mesh.position.copy(position);
        this.attackRadiusIndicator.position.copy(position);
    }

    die() {
        this.scene.remove(this.mesh);
        this.scene.remove(this.attackRadiusIndicator);
        this.healthText.remove();
    }

    isClicked(worldPosition) {
        return this.mesh.geometry.boundingBox.containsPoint(worldPosition);
    }
    setTarget(player, soldiers) {
        let targets = [player, ...soldiers].filter(target => target.isAlive() && this.position.distanceTo(target.mesh.position) <= this.attackRadius);
        targets.sort((a, b) => this.position.distanceTo(a.mesh.position) - this.position.distanceTo(b.mesh.position));
        if (targets.length > 0) {
            if (this.target!== targets[0]) {
                this.target = targets[0];
            }
        }
    }
    
}

export { Tower };
