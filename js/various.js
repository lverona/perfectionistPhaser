//recoloring the blocks
var block_num = blockNumGroup.getChildren();

//recoloring blocks back
blockGroup.children.iterate(function (child) {
    child.setFrame(block_num[child.block_id].blocknum_value - 1 + color_scheme);
  });





board_seed=Math.floor((Math.random()*2147483647)+1);



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


this.input.on('gameobjectdown', function(pointer,gameObject){
        if(gameObject.object_type=='daily_button'){


        }else if(gameObject.object_type=='weekly_button'){

        }
},this);
