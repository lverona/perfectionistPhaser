var sceneName = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function preloadAssets(){
        Phaser.Scene.call(this, {key: "sceneName"});
    },
    preload: function(){

    },
    create: function(){

    }
});


console.log(block_num.getTextMetrics());

update: function(){
  var pointer = this.input.activePointer;

  debug.setText([
      'x: ' + pointer.worldX,
      'y: ' + pointer.worldY
  ]);
}



//iteration, but just clear(true) seemed to work for me
blockGroup.children.iterate(function (child) {
    child.destroy();
});

blockGroup.clear(true);
