/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


// Wait for the deviceready event before using any of Cordova's device APIs.

// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
// these hide/show methods specifically tailored to the elements they hide/show

document.addEventListener('deviceready', onDeviceReady, false);
let game = null;
let this_scene;
function gameStart(action) {

    let physicalScreenWidth = window.screen.width * window.devicePixelRatio;
    let physicalScreenHeight = window.screen.height * window.devicePixelRatio;
    var config = {
        type: Phaser.AUTO,
        width: physicalScreenWidth,
        height: physicalScreenHeight,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 100 }
            }
        },
        scene: {
            preload: preload,
            create: create
        }
    };

    if (action === 'start') {
        game = new Phaser.Game(config);
    } else {
        xIcon.click();
    }
    function preload() {
        this.load.image('sky', './assets/space3.png');
        this.load.image('logo', './assets/phaser3-logo.png');
        this.load.image('red', './assets/red.png');
        this.load.image('white-flare', './assets/white-flare.png');
        this.load.image('melon', './assets/melon.png');
        this.load.image('chunk', './assets/chunk.png');
    }
    let restartButton;

    function create() {
        let image = this.add.image(physicalScreenWidth / 2, physicalScreenHeight / 2, 'sky');
        let scaleX = this.cameras.main.width / image.width;
        let scaleY = this.cameras.main.height / image.height;
        let scale = Math.max(scaleX, scaleY);
        image.setScale(scale).setScrollFactor(0);
        // origin point of melons
        var cannon = this.add.image(0, physicalScreenHeight, 'white-flare').setDepth(1);
        // targets, in this case, the phaser logo
        targetGroup = this.physics.add.staticGroup({
            key: 'logo',
            frameQuantity: 3,
            immovable: true
        });
        var children = targetGroup.getChildren();
        for (var i = 0; i < children.length; i++) {
            var x = Phaser.Math.Between(800, physicalScreenWidth);
            var y = Phaser.Math.Between(50, physicalScreenHeight);
            children[i].setPosition(x, y);
        }
        // melon chunks!
        var chunks = this.add.particles('chunk');
        // melons!
        this.laserGroup = new LaserGroup(this);
        var melons = this.laserGroup.getChildren();
        for (var i = 0; i < melons.length; i++) {
            let melon = melons[i];
            let laserGroup = this.laserGroup;/
            // melon contact!
            this.physics.add.overlap(children, melons[i], function () {
                var explosion = chunks.createEmitter({
                    x: melon.x,
                    y: melon.y,
                    speed: { min: -800, max: 800 },
                    angle: { min: 0, max: 360 },
                    scale: { start: 1, end: 0 },
                    blendMode: 'SCREEN',
                    lifespan: 2000,
                    gravityY: 800
                });
                for (let i=100; i > 0; i--) {
                    explosion.explode();
                }
                //  Hide the melon
                laserGroup.killAndHide(melon);
                //  And disable the melon
                melon.body.enable = false;
                melon.emitter.on = false;
                melon.emitter.killAll();
            });
        }
        targetGroup.refresh();

        var angle = 0;
        this_scene = this.scene;
        // new game button
        NewGame.addEventListener('click', (e) => {
            menu.hide();
            xIcon.show();
            this_scene.resume();
        });
        // close icon
        xIcon.addEventListener("click", function () {
            xIcon.hide();
            menu.show();
            this_scene.restart();
            this_scene.pause();
        });
        // fire melons!!
        this.input.on('pointerdown', pointer => {
            let x = this.input.x;
            let y = this.input.y;
            angle = Phaser.Math.Angle.BetweenPoints(cannon, pointer);
            this.laserGroup.fireLaser(angle, x, y);
        });
        this.scene.pause();
    }
    // melons class, we call it laserGroup for now to be more reusable
    class LaserGroup extends Phaser.Physics.Arcade.Group {
        constructor(scene) {
            // Call the super constructor, passing in a world and a scene
            super(scene.physics.world, scene);

            // Initialize the group
            this.scene = scene;
            this.createMultiple({
                classType: Laser, // This is the class we create just below
                frameQuantity: 30, // Create 30 instances in the pool
                active: false,
                visible: false,
                key: 'melon'
            });
        }
        fireLaser(angle, x, y) {
            // Get the first available sprite in the group
            const laser = this.getFirstDead(false);
            if (laser) {
                laser.fire(angle, x, y, this.scene, this.melonTarget);
            }
        }
    }
    // a single melon, we will call it a laser to be more reusable
    class Laser extends Phaser.Physics.Arcade.Sprite {
        constructor(scene, x, y) {
            super(scene, x, y, 'melon');
        }
        fire(angle, x, y, scene, melonTarget) {
            var particles = scene.add.particles('red');
            this.emitter = particles.createEmitter({
                speed: 60,
                scale: { start: 0.05, end: 0 },
                blendMode: 'ADD'
            });
            this.body.reset(0, window.screen.height);
            this.setActive(true);
            this.setVisible(true);
            this.emitter.startFollow(this);
            scene.physics.velocityFromRotation(angle, 900, this.body.velocity);

        }
        preUpdate(time, delta) {
            super.preUpdate(time, delta);

            if (this.y <= 0) {
                this.setActive(false);
                this.setVisible(false);
            }
        }
    }
}

function onDeviceReady() {
    // load fonts
    if (navigator.platform.indexOf('Win') != -1) {
        window.document.getElementById("wrapper").setAttribute("class", "windows");
    } else if (navigator.platform.indexOf('Mac') != -1) {
        window.document.getElementById("wrapper").setAttribute("class", "mac");
    }

    Element.prototype.hide = function () {
        this.style.display = 'none';
    }
    Element.prototype.show = function () {
        this.style.display = 'block';
    }
    const menu = document.getElementById('menu');
    const NewGame = document.getElementById('NewGame');
    const Exit = document.getElementById('Exit');
    const Options = document.getElementById('Options');
    const xIcon = document.getElementById('xIcon');

    gameStart('start');
    xIcon.hide();
    // Cordova is now initialized. Have fun!
    console.log('Running cordova-' + device.platform + " - " + cordova.platformId + '@' + cordova.version);

}