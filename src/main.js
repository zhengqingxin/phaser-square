import 'phaser';
import gameConfig from './config/game';
import GameScene from './scenes/GameScene';

window.onload = function() {
  let width = gameConfig.canvasWidth;
  let height = gameConfig.canvasHeight;
  let windowRatio = window.innerWidth / window.innerHeight;
  if (windowRatio < width / height) {
    height = width / windowRatio;
  }
  var config = {
    width: width,
    height: height,
    scene: GameScene,
    backgroundColor: 0x444444
  };
  new Phaser.Game(config);
  window.focus();
  resize();
  window.addEventListener('resize', resize, false);
};

function resize() {
  let canvas = document.querySelector('canvas');
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;
  let windowRatio = windowWidth / windowHeight;
  let gameRatio = gameConfig.canvasWidth / gameConfig.canvasHeight;
  if (windowRatio < gameRatio) {
    canvas.style.width = windowWidth + 'px';
    canvas.style.height = windowWidth / gameRatio + 'px';
  } else {
    canvas.style.width = windowHeight * gameRatio + 'px';
    canvas.style.height = windowHeight + 'px';
  }
}
