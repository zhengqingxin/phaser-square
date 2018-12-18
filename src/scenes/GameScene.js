import Phaser from 'phaser';
import gameConfig from '../config/game';

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
  }

  preload() {
    this.load.image('base', 'assets/images/base.png');
    this.load.image('square', 'assets/images/square.png');
    this.load.image('top', 'assets/images/top.png');
    this.load.bitmapFont('font', 'assets/images/font.png', 'assets/images/font.fnt');
  }

  create() {
    // 关卡数
    this.levelText = this.add.bitmapText(gameConfig.canvasWidth / 2, 0, 'font', `level ${this.level}`, 80);
    this.levelText.setOrigin(0.5, 0);
    // 随机设置背景色
    const bgColor = Phaser.Utils.Array.GetRandom(gameConfig.bgColors);
    this.cameras.main.setBackgroundColor(bgColor);
    // 添加左下角的方块，默认隐藏
    this.leftSquare = this.add.sprite(0, gameConfig.canvasHeight, 'base');
    this.leftSquare.setOrigin(1, 1);
    // 添加右下角的方块，默认隐藏
    this.rightSquare = this.add.sprite(gameConfig.canvasWidth, gameConfig.canvasHeight, 'base');
    this.rightSquare.setOrigin(0, 1);
    // 左下角二层方块，默认隐藏
    this.leftWall = this.add.sprite(0, gameConfig.canvasHeight - this.leftSquare.height, 'top');
    this.leftWall.setOrigin(1, 1);
    // 右下角二层方块，默认隐藏
    this.rightWall = this.add.sprite(gameConfig.canvasWidth, gameConfig.canvasHeight - this.rightSquare.height, 'top');
    this.rightWall.setOrigin(0, 1);
    // 主方块
    this.square = this.add.sprite(gameConfig.canvasWidth / 2, -400, 'square');
    this.square.setScale(0.2);
    // 主方块上的数字（关卡数）
    this.squareText = this.add.bitmapText(gameConfig.canvasWidth / 2, -400, 'font', '1', 120);
    this.squareText.setOrigin(0.5, 0.5);
    this.squareText.setScale(0.4);
    this.squareText.setTint(bgColor);

    this.updateLevel();

    this.input.on('pointerdown', this.grow, this);
    this.input.on('pointerup', this.stopGrow, this);
  }

  grow() {
    this.infoGroup.toggleVisible();
    this.growTween = this.tweens.add({
      targets: [this.square, this.squareText],
      scaleX: 1,
      scaleY: 1,
      duration: 1500
    });
  }

  stopGrow() {
    this.growTween.stop();
    this.rotateTween.stop();
    // 转正
    this.rotateTween = this.tweens.add({
      targets: [this.square, this.squareText],
      duration: 300,
      ease: 'Cubic.easeOut',
      angle: 0,
      onComplete: () => {
        // 如果方块宽度小于底层洞的宽度  失败了
        if (this.square.displayWidth < this.rightSquare.x - this.leftSquare.x) {
          this.tweens.add({
            targets: [this.square, this.squareText],
            duration: 300,
            y: gameConfig.canvasHeight + this.square.displayHeight,
            ease: 'Cubic.easeIn',
            onComplete: () => {
              this.time.addEvent({
                delay: 1000,
                callback: () => {
                  this.updateLevel();
                }
              });
            }
          });
        } else {
          // 如果方块宽度大于顶层洞的宽度  失败了
          if (this.square.displayWidth >= this.rightWall.x - this.leftWall.x) {
            this.fall(false);
          } else {
            this.fall(true);
          }
        }
      }
    });
  }

  fall(success) {
    let desY = this.leftWall.y - this.leftWall.displayHeight - this.square.displayHeight / 2;
    if (success) {
      desY = this.leftWall.y - this.square.displayHeight / 2;
    }
    this.tweens.add({
      targets: [this.square, this.squareText],
      duration: 600,
      ease: 'Bounce.easeOut',
      y: desY,
      onComplete: () => {
        if (success) {
          this.level++;
        }
        this.time.addEvent({
          delay: 1000,
          callback: () => {
            this.updateLevel();
          }
        });
      }
    });
  }

  updateLevel() {
    this.squareText.text = this.level;
    this.levelText.text = 'level ' + this.level;
    const holeWidth = Phaser.Math.Between(gameConfig.holeWidthRange[0], gameConfig.holeWidthRange[1]);
    const wallWidth = Phaser.Math.Between(gameConfig.wallRange[0], gameConfig.wallRange[1]);

    this.place(this.leftSquare, (gameConfig.canvasWidth - holeWidth) / 2);
    this.place(this.rightSquare, (gameConfig.canvasWidth + holeWidth) / 2);

    this.place(this.leftWall, (gameConfig.canvasWidth - holeWidth) / 2 - wallWidth);
    this.place(this.rightWall, (gameConfig.canvasWidth + holeWidth) / 2 + wallWidth);

    let squareTween = this.tweens.add({
      targets: [this.square, this.squareText],
      y: 150,
      scaleX: 0.2,
      scaleY: 0.2,
      angle: 50,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.rotateTween = this.tweens.add({
          targets: [this.square, this.squareText],
          angle: 40,
          duration: 300,
          yoyo: true,
          repeat: -1
        });
        this.showIntroduce();
      }
    });
  }

  showIntroduce() {
    this.infoGroup = this.add.group();
    let holdText = this.add.bitmapText(gameConfig.canvasWidth / 2, 250, 'font', 'tap and hold to group', 40);
    let releaseText = this.add.bitmapText(gameConfig.canvasWidth / 2, 300, 'font', 'release to drop', 40);
    holdText.setOrigin(0.5, 0);
    releaseText.setOrigin(0.5, 0);

    let topHoldWidth = this.rightWall.x - this.leftWall.x;
    let demoSquare = this.add.sprite(gameConfig.canvasWidth / 2, this.leftWall.y, 'square');
    const radio = (topHoldWidth - 10) / demoSquare.displayWidth;
    demoSquare.setOrigin(0.5, 1);
    demoSquare.setScale(radio);
    demoSquare.alpha = 0.3;

    this.infoGroup.add(demoSquare);
    this.infoGroup.add(holdText);
    this.infoGroup.add(releaseText);
  }

  place(target, posX) {
    this.tweens.add({
      targets: target,
      x: posX,
      duration: 500,
      ease: 'Cubic.easeOut'
    });
  }
}

export default GameScene;
