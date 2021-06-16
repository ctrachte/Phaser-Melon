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
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // load fonts
    if (navigator.platform.indexOf('Win') != -1) {
        window.document.getElementById("wrapper").setAttribute("class", "windows");
    } else if (navigator.platform.indexOf('Mac') != -1) {
        window.document.getElementById("wrapper").setAttribute("class", "mac");
    }

    let physicalScreenWidth = window.screen.width * window.devicePixelRatio;
    let physicalScreenHeight = window.screen.height * window.devicePixelRatio;

    // Cordova is now initialized. Have fun!
    console.log('Running cordova-' + device.platform + " - " + cordova.platformId + '@' + cordova.version);
    var config = {
        type: Phaser.AUTO,
        width: physicalScreenWidth,
        height: physicalScreenHeight,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 200 }
            }
        },
        scene: {
            preload: preload,
            create: create
        }
    };

    var game = new Phaser.Game(config);

    function preload() {
        this.load.setBaseURL('/');

        this.load.image('sky', 'www/assets/space3.png');
        this.load.image('logo', 'www/assets/phaser3-logo.png');
        this.load.image('red', 'www/assets/red.png');
        this.load.image('white-flare', 'www/assets/white-flare.png');
        this.load.image('melon', 'www/assets/melon.png');

    }

    function create() {
        // this.add.image(1280, 720, 'sky');

        var particles = this.add.particles('red');

        var emitter = particles.createEmitter({
            speed: 100,
            scale: { start: 0.2, end: 0 },
            blendMode: 'ADD'
        });

        var logo = this.physics.add.image(400, 100, 'melon');

        logo.setVelocity(333, 333);
        logo.setBounce(1, 1);
        logo.setCollideWorldBounds(true);

        emitter.startFollow(logo);
    }
}