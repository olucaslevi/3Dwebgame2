import * as THREE from 'three';
import Player from './controllers/Player';
import TerrainManager from './controllers/terrainManager';
import { Tower } from './controllers/towerController';
import Soldier from './controllers/Soldier';
import InputManager from './input';
import CameraController from './controllers/cameraManager';
import ConnectController from './controllers/connectController';
import ModelController from './controllers/modelController';


// TODO adicionar efeitos de dano
// TODO adicionar indicadores visuais de inicio e fim de jogo condicionados à vida da torre
// TODO transferir p/ websocket
// TODO adicionar sons ao jogo (tiro, morte, dano, etc)
// TODO adicionar efeitos visuais ao jogo (explosões, fumaça, etc)
// TODO adicionar um sistema de pontuação e tempo


class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.players = [];
        this.towers = [];
        this.soldiers = [];
        this.currentPlayerIndex = 0;
        this.raycaster = new THREE.Raycaster();
        this.terrain = null;
        this.cameraController = null;
        this.webSocketClient = new ConnectController();
        this.modelController = new ModelController(this.scene);
        this.clock = new THREE.Clock();
    }
    start() {
        
        this.createTerrain();
        this.createPlayers();
        this.createTowers();
        this.createCamera();
        // const axesHelper = new THREE.AxesHelper(10)
        // this.scene.add(axesHelper);
        this.towers.forEach((tower, index) => {
            //se index for impar, é vermelho
            const color = index % 2 === 0 ? 'blue' : 'red';
            this.createSoldier(tower, color);
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        // Iniciar gerenciador de comandos de entrada
        this.inputManager = new InputManager(this.raycaster,this.camera, this.terrain, this.getCurrentPlayer(), this.soldiers, this.towers);
        // Inicie a renderização do jogo
        this.animate();
    }

    // Adiciona um jogador à lista de jogadores
    addPlayer(player) {
        this.players.push(player);
    }

    // Define o jogador atual com base no índice fornecido
    setCurrentPlayer(index) {
        if (index >= 0 && index < this.players.length) {
            this.currentPlayerIndex = index;
        }
    }

    // Obtém o jogador atual
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }
    

    animate() {
        // update mixers in modelcontroller
        this.players.forEach(player => player.update());
        if (this.cameraController) { // Verifique se o cameraController existe antes de atualizá-lo
            this.cameraController.update();
        }
        this.soldiers.forEach(soldier => soldier.update(this.players, this.soldiers, this.towers));
        this.towers.forEach(tower => tower.update(this.getCurrentPlayer(), this.soldiers, this.towers));
        for (let i = this.soldiers.length - 1; i >= 0; i--) {
            if (this.soldiers[i].health <= 0) {
                this.soldiers[i].mesh.geometry.dispose();
                this.soldiers[i].mesh.material.dispose();
                this.scene.remove(this.soldiers[i].mesh);
                this.soldiers.splice(i, 1);
            }
        }
        for (let i = this.towers.length - 1; i >= 0; i--) {
            if (this.towers[i].health <= 0) {
                this.towers[i].mesh.geometry.dispose();
                this.towers[i].mesh.material.dispose();
                this.scene.remove(this.towers[i].mesh);
                this.towers.splice(i, 1);
            }
        }
        const delta = this.clock.getDelta();
        this.modelController.update(delta);
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animate());
        this.scene.children.forEach(child => {
            if (child.userData.mixer){
                const delta = this.clock.getDelta();
                child.userData.mixer.update(delta);
            }
        });
    }
    createTerrain() {
        const terrain = new TerrainManager(this.scene).createTerrain();
        this.scene.add(terrain);
        this.terrain = terrain;
    }
    createTowers() {
        const tower1 = new Tower(this.scene, new THREE.Vector3(-40, 40, 0), 24, 100, 1000, 1000, this.camera, 'blue');
        const tower2 = new Tower(this.scene, new THREE.Vector3(40, -10, 0), 24, 100, 1000, 10,this.camera, 'red');
        const tower3 = new Tower(this.scene, new THREE.Vector3(-40, 10, 0), 24, 100, 1000, 1000, this.camera, 'blue');
        const tower4 = new Tower(this.scene, new THREE.Vector3(0, -10, 0), 24, 100, 1000, 10,this.camera, 'red');
        const tower5 = new Tower(this.scene, new THREE.Vector3(-30, 20, 0), 24, 100, 1000, 1000, this.camera, 'blue');
        const tower6 = new Tower(this.scene, new THREE.Vector3(50, 10, 0), 24, 100, 1000, 1000, this.camera, 'red');
        this.towers.push(tower1, tower2, tower3, tower4, tower5, tower6);
    }
    createPlayers() {
            const player1 = new Player(this.scene, new THREE.Vector3(-40, 0, 0), this.camera, this.renderer, 'blue');
            const player2 = new Player(this.scene, new THREE.Vector3(40, 0, 0), this.camera, this.renderer, 'red');
            this.players.push(player1, player2);
    }

    createSoldier(tower, color) {
        const health = Math.floor(Math.random() * (10 - 30) + 80);
        const damage = Math.floor(Math.random() * (12 - 9) + 28);
        const speed = Math.random() * (0.09 - 0.08) + 0.08;
        const position = tower.getPosition().clone();
        position.x += Math.random(-5, 5);
        position.y += Math.random(-5, 5);
        position.z = 0;

        const soldier = new Soldier(this.scene, position, null, 2, 12, speed, 100, 100, 10, color);
        this.soldiers.push(soldier);
    };
    render() {
        this.renderer.render(this.scene, this.camera);
    };

    createCamera() {
        this.cameraController = new CameraController(this.camera, this.getCurrentPlayer());
    }

}

export default Game;