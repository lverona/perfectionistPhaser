var game;

var board_seed;//board seed for a random board
  var board_seed_daily;//board seed for a daily board
  var board_seed_weekly;//board seed for a weekly board
  var today;//a date string in the form of "Sunday, March 31st", used for the title menu
  var week;//number of the week, used for the title menu
  var day;//number of the day, used to load Friday Board json
  var your_daily_best;
  var your_weekly_best;
var firstblk;//first selected block
var prevblk;//last selected block, whether it's first or second
var board_rows = 8;
var board_columns = 6;
var randomColors;
var colors=[];//colors for the level
var endgame_colors=[];//colors for the endgame
var blockNumGroup=[];
var blockGroup=[];

var is_there_board=0;//is the board populated
var init_seed;//if a seed is sent
var board_type='q';//board type: quick or full

var index=0;
var burn=0;//burn (how much score was lost when melding)
var min_burn=0;//minimum burn
//to know that the server has recorded min_burn. By default this is 1, since if there is already a score or no score, no verification is needed
var min_burn_server_verified=1;
var prev_seed;//this is so that we know that the min_burn belongs to the same board, otherwise we reset it
var total_blocks=99;//amount of blocks left in play
var endgame=0;//end game phase can happen either at block amount=10 or 9 and endgame flag prevents a double trigger of endgame phase
var one_block_left=999;

//undo stuff
var current_move=0;
var undo_type=[];//1 - combining, 2 - double click
var undo_one=[];//value of blocks
var undo_two=[];
var undo_id_one=[];//id of blocks
var undo_id_two=[];

//replay arrays, basically same as undo_id_one and undo_id_two of another board
var replay_daily_first;
var replay_daily_second;
var replay_daily_board_seed;
var replay_weekly_first;
var replay_weekly_second;
var replay_weekly_board_seed;
var current_rboard_type='q';//a global type variable to assist in quickly manipulating replays
var current_rboard_seed=0;//a global type variable to assist in quickly manipulating replays
var replay_is_active=0;//a flag whether a replay is happening
var replay_stage=0;//a variable for a step by step replay; in the simulation function it is a local variable by design, since we want to restart from the beginning each time we play the move
var replay_length=0;//how many steps is the replay going to be
var replay_interval=null;

//tutorial
var tutorial_page=1;

//UI stuffs
var show_world_record=1;//if the board is fresh, UpdateScore() shows a special sign saying "Current world record is"
var PhaserContext;
var text;
var today_sign;
var week_sign;
var daily_button;
var weekly_button;
var border;


//user preferences
var color_scheme;
var color_scheme_num;


window.onload = function() {
    var gameConfig = {
       type: Phaser.CANVAS,
       scale:{
          mode: Phaser.Scale.FIT,
          width: 720,
          height: 1120
        },
       backgroundColor: 0x222222,
       disableContextMenu: true,
       scene: [preloadAssets, showMenu, gameOver, playGame]
   };

    game = new Phaser.Game(gameConfig);
    window.focus();
}

var preloadAssets = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function preloadAssets(){
        Phaser.Scene.call(this, {key: "PreloadAssets"});
    },
    preload: function(){

      this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');

      this.load.spritesheet("blocks_small_default", "assets/img/colorset_68_default.png", {
          frameWidth: 68,
          frameHeight: 68
      });
      this.load.spritesheet("blocks_large_default", "assets/img/colorset_100_default.png", {
          frameWidth: 100,
          frameHeight: 100
      });
      this.load.spritesheet("undo_button", "assets/img/undo.png", {
          frameWidth: 160,
          frameHeight: 44
      });
      this.load.image("border_100", "assets/img/border_100.png");
      this.load.image("border_68", "assets/img/border_68.png");
      this.load.image("menu_button", "assets/img/menu.png");
      this.load.image("rules_button", "assets/img/rules.png");
      this.load.image("top_panel_border_100", "assets/img/top_panel_border_100.png");

      this.load.spritesheet("standard_menu_buttons", "assets/img/standard_menu_buttons.png", {
          frameWidth: 556,
          frameHeight: 68
      });
      this.load.spritesheet("narrow_menu_buttons", "assets/img/narrow_menu_buttons.png", {
          frameWidth: 556,
          frameHeight: 58
      });

      this.load.image("title_background", "assets/img/title_background.png")



      this.load.audio('sfx','assets/snd/main_compressed_LAME192kbps.mp3');

    },
    create: function(){

      WebFont.load({
              google: {
                  families: [ 'Ubuntu' ]
              }
          });


        this.scene.launch("showMenu");
        this.scene.launch("gameOver");
        this.scene.sleep("gameOver");
        this.scene.launch("playGame");
        this.scene.sleep("playGame");
        this.scene.remove();

    }
})


var showMenu = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function setupGame(){
        Phaser.Scene.call(this, {key: "showMenu"});
    },
    create: function(){

        this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, "title_background");

        var title_text_1=this.add.text(this.game.renderer.width / 2, 10,'Louigi Verona\'s', { fontFamily:'Verdana', fontSize: '30pt', color: '#3b8adb', fontStyle: 'bold' });
        title_text_1.setOrigin(0.5,0);

        var title_text_2=this.add.text(this.game.renderer.width / 2, 60,'Perfectionist', { fontFamily:'Verdana', fontSize: '65pt', color: '#3b8adb', fontStyle: 'bold' });
        title_text_2.setOrigin(0.5,0);

        today_sign=this.add.text(this.game.renderer.width / 2, 235,'', { fontFamily:'Verdana', fontSize: '24pt', color: '#999999', fontStyle: 'bold' });
        today_sign.setOrigin(0.5,0);

        daily_button=this.add.image(this.game.renderer.width / 2, 312, "standard_menu_buttons").setInteractive();
        daily_button.setFrame(0);
        daily_button.object_type='daily_button';
        daily_button_sign=this.add.text(this.game.renderer.width / 2, 312,'Daily Board', { fontFamily:'Verdana', fontSize: '36pt', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5,0.5);


        week_sign=this.add.text(this.game.renderer.width / 2, 395,'', { fontFamily:'Verdana', fontSize: '24pt', color: '#999999', fontStyle: 'bold' });
        week_sign.setOrigin(0.5,0);

        weekly_button=this.add.image(this.game.renderer.width / 2, 472, "standard_menu_buttons").setInteractive();
        weekly_button.setFrame(0);
        weekly_button.object_type='weekly_button';
        this.add.text(this.game.renderer.width / 2, 472,'Weekly Board', { fontFamily:'Verdana', fontSize: '36pt', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5,0.5);

        this.add.text(this.game.renderer.width / 2, 650,'Solutions', { fontFamily:'Verdana', fontSize: '28pt', color: '#999999', fontStyle: 'bold' }).setOrigin(0.5,0);

        var replay_daily_button=this.add.image(this.game.renderer.width / 2, 742, "narrow_menu_buttons").setInteractive();
        weekly_button.setFrame(0);
        this.add.text(this.game.renderer.width / 2, 742,'Yesterday\'s Board', { fontFamily:'Verdana', fontSize: '32pt', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5,0.5);

        var replay_weekly_button=this.add.image(this.game.renderer.width / 2, 840, "narrow_menu_buttons").setInteractive();
        weekly_button.setFrame(0);
        this.add.text(this.game.renderer.width / 2, 840,'Last Week\'s Board', { fontFamily:'Verdana', fontSize: '32pt', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5,0.5);

        ServerReadPeriodical();


        this.input.on('gameobjectdown', function(pointer,gameObject){

          //this.input.stopPropagation();

          if(gameObject.object_type=='daily_button'){
            //Friday Board
            if(board_seed_daily==-999){
              board_type='q';
              LoadLevel();
              return false;
            }

            //check if we have daily board seed
            if(board_seed_daily){
              board_type='q';
              board_seed=board_seed_daily;
            }
            else{return false;}

            //switching from replay mode
            //document.getElementById("standard_top_panel").style.display = "table-row";
            //document.getElementById("replay_top_panel").style.display = "none";
            //document.getElementById("standard_menu").style.display = "table-row";
            //document.getElementById("replay_menu").style.display = "none";

            PlayAudio2(6,this);

            CreateLevel();

            this.scene.switch("playGame");

          }else if(gameObject.object_type=='weekly_button'){

            if(board_seed_weekly){
              board_type='f';
      				board_seed=board_seed_weekly;
      			}
      			else{return false;}

      			//switching from replay mode
      			//document.getElementById("standard_top_panel").style.display = "table-row";
      			//document.getElementById("replay_top_panel").style.display = "none";
      			//document.getElementById("standard_menu").style.display = "table-row";
      			//document.getElementById("replay_menu").style.display = "none";

      			PlayAudio2(6);

      			CreateLevel();

            this.scene.switch("playGame");
          }

          },this);

    }


});

var gameOver = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function setupGame(){
        Phaser.Scene.call(this, {key: "gameOver"});
    },
    create: function(){
      console.log("Yay!");
    }
});

var playGame = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function setupGame(){
        Phaser.Scene.call(this, {key: "playGame"});
    },
    create: function(){

        PhaserContext=this;

        //this.input.mouse.disableContextMenu();

        blockNumGroup = this.add.group();
        blockGroup = this.add.group();


        //Building UI

        //debug=this.add.text(10,10,'', { fill: '#00ff00' });

        blocks_left_text=this.add.text(464,82,'Blocks left: 99', { fontFamily:'Ubuntu', fontSize: '25pt', color: '#e8a015' });
        blocks_left_text.setOrigin(0);

        lost_text=this.add.text(40,82,'Lost: 0/?', { fontFamily:"'Ubuntu',serif", fontSize: '25pt', color: '#e8a015' });
        lost_text.setOrigin(0);

        top_panel_border_100=this.add.image(15,66,"top_panel_border_100");
        top_panel_border_100.setOrigin(0);//to use normal coordinates

        undo_button=this.add.image(20,16,"undo_button").setInteractive();
        undo_button.setFrame(1);
        undo_button.setOrigin(0);//to use normal coordinates
        undo_button.object_type='undo_button';

        menu_button=this.add.image(20,1062,"menu_button").setInteractive();
        menu_button.setOrigin(0);
        menu_button.object_type='menu_button';

        rules_button=this.add.image(540,1062,"rules_button").setInteractive();
        rules_button.setOrigin(0);
        rules_button.object_type='rules_button';

        border = this.add.image(360,601,"border_68");




    this.input.on('gameobjectdown', function(pointer,gameObject){

      //this.input.stopPropagation();


      if(gameObject.object_type=='interactive_block'){

        if(!firstblk){//selecting a block, no prior blocks were clicked
          firstblk=gameObject;
          prevblk=gameObject;
          var block_num = blockNumGroup.getChildren();
          block_num[firstblk.block_id].setColor("#3b8adb");
          PlayAudio2(6);
        }
        else{//if a block has been already clicked prior to this
              var _this=gameObject;
                if(	_this===prevblk ){//if the block is the same, we reset the situation
                  var block_num = blockNumGroup.getChildren();
                  block_num[firstblk.block_id].setColor("#000");
                  firstblk=''; prevblk='';
                  PlayAudio2(7);
                }else{//if they are different, we proceed to evaluate
                  prevblk=gameObject;
                  BlockDrop(firstblk,prevblk);
                }
            }
          }else if(gameObject.object_type=='undo_button'){
          if(current_move>0){
                  Undo();
              }
        }else if(gameObject.object_type=='menu_button'){

                  clearInterval(replay_interval);
                  replay_is_active=0;
                  //ReplayButtonState(replay_is_active);

                  //otherwise a reload level might create a bug, since firstblk will then no longer exist
                  firstblk='';//resetting click
                  prevblk='';//variables

          //only in case this is a daily or weekly board
          if(is_there_board==1 && (board_seed==board_seed_daily || board_seed==board_seed_weekly)){

                            //colorize actively selected board
                            if(board_type=="q"){
                              //$('#daily_button').attr('class','button_menu_highlight');
                              //$('#weekly_button').attr('class','button_menu');
                            }else{
                              //$('#daily_button').attr('class','button_menu');
                              //$('#weekly_button').attr('class','button_menu_highlight');
                            }

          }

          PlayAudio2(6);
          this.scene.switch("showMenu");
        }else if(gameObject.object_type=='last_block'){
          firstblk=gameObject;
          prevblk=gameObject;
          BlockDoubleclick(firstblk);
        }
      },this);





        //CreateLevel();

    }



  });





function gameover_on(){
  PhaserContext.scene.switch("gameOver");
}


function UpdateScore(){

		if(min_burn==999){

      lost_text.setText("Lost: " + burn + "/?");
		}
		else{
      lost_text.setText("Lost: " + burn + "/" + min_burn);
		}

}


function CreateLevel(){

  blockGroup.clear(true,true);
  blockNumGroup.clear(true,true);
  border.destroy();

  is_there_board=1;
	endgame=0;
	min_burn=999;//resetting min_burn for new board

	current_move=0;
	undo_button.setFrame(1);
	burn=0;//resetting burn
	UpdateScore();
	undo_id_one=[];//resetting id history
	undo_id_two=[];

  if(board_type=='q'){
    total_blocks=48;
    board_rows=8;
    board_columns=6;
    border = PhaserContext.add.image(360,601,"border_100");
    menu_button.x=20;menu_button.y=1062;
    rules_button.x=540;rules_button.y=1062;
  }else{
    total_blocks=99;
    board_rows=11;
    board_columns=9;
    border = PhaserContext.add.image(360,565,"border_68");
    menu_button.x=20;menu_button.y=990;
    rules_button.x=540;rules_button.y=990;
  }

  total_blocks=board_columns*board_rows;
  blocks_left_text.setText("Blocks left: " + total_blocks);
  ServerReadScore();//reading the min_burn from server, if it exists

    var m = new MersenneTwister(board_seed);

    //console.log(scene);



    let i=0;//block id

    //building a play field
    for (var y = 0; y < board_rows; y++) {
      for (var x = 0; x < board_columns; x++) {
      var value = Math.floor(m.random()*15);

        if(board_type=='q'){
          var block = PhaserContext.add.image(85+110*(x),106+110*(y+1),"blocks_large_default").setInteractive();
          var block_num = PhaserContext.add.text(block.x, block.y, value+1, { fontFamily:'Verdana', fontSize: '32pt', color: '#000' });
        }else{
          var block = PhaserContext.add.image(64+74*(x),121+74*(y+1),"blocks_small_default").setInteractive();
          var block_num = PhaserContext.add.text(block.x, block.y, value+1, { fontFamily:'Verdana', fontSize: '24pt', color: '#000' });
        }


        //setting a color
        block.setFrame(value);

        block.block_id=i;
        block.block_row=y;
        block.block_col=x;
        block.object_type='interactive_block';



        block_num.setOrigin(0.5);
        block_num.blocknum_id=i;
        block_num.blocknum_value=value+1;

        i++;

        blockGroup.add(block);
        blockNumGroup.add(block_num);

            }//x
        }//y




}


//functions that make up the main game logic
function BlockDrop(first,second){

        //getting numbers group
        var block_num = blockNumGroup.getChildren();

				var id_one=first.block_id;
				var id_two=second.block_id;
        var one = block_num[id_one].blocknum_value;
        var two = block_num[id_two].blocknum_value;

				var one_row=first.block_row;
				var two_row=second.block_row;
				var one_col=first.block_col;
				var two_col=second.block_col;

				var check=CheckDrop(one_row,two_row,one_col,two_col,id_one,id_two);

				if(one==1 || check || total_blocks<11){//if the move is legal

				//undo info (only here, so that when someone does an illegal move undo from previous move is not erased)

				if(current_move==0){//enable it if there is no previous move history and thus it was disabled
          undo_button.setFrame(0);
				}

				current_move++;
				undo_one[current_move]=one;
				undo_id_one[current_move]=id_one;
				undo_two[current_move]=two;
				undo_id_two[current_move]=id_two;
				undo_type[current_move]=1;

				firstblk='';//resetting click
				prevblk='';//variables

				if(one==two){

				//the sound is played first, so that in case of Friday boards the gameover sound is not overdubbed by this sound: in case of Friday boards there is no delay in the form of ServerCompareScore(), therefore, the gameover_on() sound is overriden by this standard sound
				PlayAudio2(2);
				TotalBlocks(2);


        RemoveBlock(first);
        RemoveBlock(second);

					}//if(one==two)
				else{//subtracting

				TotalBlocks(1);

				var new_index=Math.abs(one-two);

				if(one<two){ burn+=one; }
				else{ burn+=two; }
				UpdateScore();

				RemoveBlock(first);

        block_num[id_two].blocknum_value=new_index;
        block_num[id_two].setText(new_index);

				if(endgame==0){second.setFrame(new_index-1);}else{second.setFrame(new_index-1+15);}

				PlayAudio2(3);

				}
			}//if check
			else{//if the move is illegal we intepret it as wanting to select another block

        block_num[id_one].setColor("#000");
        block_num[id_two].setColor("#3b8adb");
				firstblk=second;
				PlayAudio2(6);

				}

	}
function CheckDrop(one_row,two_row,one_col,two_col,id_one,id_two){

  var block_num = blockNumGroup.getChildren();

	var diff=0;//difference
	var num='';//value of the numblock, i.e. actual number or string

	if(one_row==two_row){//if on the same row
		if(id_one>id_two){
			diff=id_one-id_two;
			for (i = 1; i < diff; i++) {//taking all elements in between
        num=block_num[id_two+i].blocknum_value;
				if(num!='_') return false;
				}
			}//if one > two
			else{
			diff=id_two-id_one;
			for (i = 1; i < diff; i++) {//taking all elements in between
        num=block_num[id_one+i].blocknum_value;
				if(num!='_') return false;
				}
				}//if one > two (else)
	}//if one_row==two_row
	else if(one_col==two_col){//if on the same column
					if(id_one>id_two){
						diff=(id_one-id_two)/board_columns;
						for (i = 1; i < diff; i++) {//taking all elements in between
              num=block_num[id_two+i*board_columns].blocknum_value;
							if(num!='_') return false;
							}
						}//if one > two
						else{
						diff=(id_two-id_one)/board_columns;
						for (i = 1; i < diff; i++) {//taking all elements in between
              num=block_num[id_one+i*board_columns].blocknum_value;
							if(num!='_') return false;
							}
							}//if one > two (else)
		}//else if one_col==two_col

	//if neither rows not columns match
	else{return false;}

				//returns true if checks above don't fail
				return true;

	}


//hiding the block and the number on it, as well as disable setInteractive for the block
function RemoveBlock(block){

  var block_num = blockNumGroup.getChildren();
  var one = block_num[block.block_id];

  one.alpha=0;
  one.blocknum_value='_';
  one.setText('');

  block.alpha=0;
  block.setInteractive(false);

	}

function RestoreBlock(block_id,value_id){

  var block_num = blockNumGroup.getChildren();
  var block = blockGroup.getChildren();
  var one = block_num[block_id];

  one.alpha=1;
  one.blocknum_value=value_id;
  one.setText(value_id);

  block[block_id].alpha=1;
  block[block_id].setInteractive();

  //working colors
  if(endgame==0){
      block[block_id].setFrame(value_id-1);}
  else{
      block[block_id].setFrame(value_id-1+15);
    }

}


function BlockDoubleclick(block){

        var block_num = blockNumGroup.getChildren();
        var one = block_num[block.block_id];

				firstblk='';//resetting click
				prevblk='';//variables

				var id_one=block.block_id;

				//undo info
				current_move++;
				undo_one[current_move]=one;
				undo_id_one[current_move]=id_one;
				undo_type[current_move]=2;
        undo_button.setFrame(0);

				RemoveBlock(block);

				//previously in the endgame, doubleclicking would reduce the score from any block to 1. Now that the game actually counts lost score, it made more sense to add the value of the whole block to lost, since it is simpler to understand while playing
				burn+=one;
				UpdateScore();
				TotalBlocks(1);//has to be after burn++ so that in the end correct top score is saved

	}

function Undo(){

  var block_num = blockNumGroup.getChildren();
  var block = blockGroup.getChildren();
  var id_one = block[undo_id_one[current_move]].block_id;
  var id_two = block[undo_id_two[current_move]].block_id;


	if(undo_type[current_move]==1){//undo when combining

	PlayAudio2(5);

    //WORKING SCORE
		if(undo_one[current_move]==undo_two[current_move]){//if we were combining equal values
		TotalBlocks(-2);
		}else{ //if blocks were different, undo lost score
			if(undo_one[current_move]<undo_two[current_move]){ burn-=undo_one[current_move]; }
			else{ burn-=undo_two[current_move]; }
			UpdateScore();
			TotalBlocks(-1);
				}


      //UNDO FIRST BLOCK
      RestoreBlock(undo_id_one[current_move],undo_one[current_move]);

      //UNDO SECOND BLOCK
      RestoreBlock(undo_id_two[current_move],undo_two[current_move]);

	}//undo when combining
	else if(undo_type[current_move]==2){//undo when doubleclick

    	PlayAudio2(5);

    	burn-=undo_one[current_move];
    	UpdateScore();
    	TotalBlocks(-1);

      //UNDO FIRST (and only) BLOCK
      RestoreBlock(undo_id_one[current_move],undo_one[current_move]);

    }//undo when doubleclick


    	undo_type[current_move]=0;
    	//this is an additional check, although the UNDO button should not
    	//call this function if current_move is not more than 0
    	if(current_move>0){current_move--;}
    		if(current_move==0){
          undo_button.setFrame(1);
    		}

      //resetting the color of the currently clicked block
      block_num[id_one].setColor("#000");
      if(firstblk){block_num[firstblk.block_id].setColor("#000");}//working the case when a player clicks a block, then undos a move; in this case a clicked block's number sign should also be reset to the correct color
    	firstblk='';//resetting click
    	prevblk='';//variables

	}


//a function to count amount of blocks left in the game and to signal when only 10 remain
function TotalBlocks(amount){

	total_blocks-=amount;

  blocks_left_text.setText("Blocks left: " + total_blocks);

	if(total_blocks==0){//gameover

      //the reset value must be a number and not a zero, because this block id is being checked against in this function, and for block_id=0 the logic will fail
			one_block_left=999;//resetting the last block flag
      undo_button.setFrame(1);


			if(board_seed>0){
				current_move=0;
				//first get the score from the server
				ServerCompareScore();
			}else{
				//here nothing is happening, because during replay we don't want to show the gameover screen
			}

		}

	//re-color the blocks back to the game colors
	//and remove endgame mode in case of Undo
	if(endgame==1 && total_blocks>10){
    var block_num = blockNumGroup.getChildren();

		endgame=0;
		setTimeout(function (){PlayAudio2(4);}, 200);

    //recoloring blocks back
    blockGroup.children.iterate(function (child) {
        child.setFrame(block_num[child.block_id].blocknum_value - 1);
      });

	}

	//note that almost everywhere the code checks for total_blocks<11. The endgame flag is required to indicate the state, so that we don't trigger endgame twice and also that we can work the Undo between normal mode and endgame mode, which would be impossible with using only one parameter
	if((total_blocks==9 || total_blocks==10) && endgame==0){//ENDGAME PHASE

    var block_num = blockNumGroup.getChildren();
    //recoloring blocks
    blockGroup.children.iterate(function (child) {
        child.setFrame(block_num[child.block_id].blocknum_value - 1 + 15);
      });

		//wrap in anonymous function for setTimeout to work
		setTimeout(function (){PlayAudio2(4);}, 200);
		endgame=1;//endgame flag

		}

	//we are checking for board_seed so that during replay mode the one_block_left mode does not activate
	if(total_blocks==1 && board_seed){
		setTimeout(function (){

      var block_num = blockNumGroup.getChildren();

      //getting id of the last block
      blockGroup.children.iterate(function (child) {
                 if(block_num[child.block_id].blocknum_value!='_'){
                   one_block_left=child.block_id;
                   child.object_type='last_block';
                 }
        });

			block_num[one_block_left].setColor("#fff");

			PlayAudio2(9);

		}, 700);
	}else{
		//we are checking for board_seed so that during replay mode the one_block_left mode does not activate
		if(one_block_left!=999 && board_seed){

      var block_num = blockNumGroup.getChildren();
      var block = blockGroup.getChildren();

			//recoloring the number into the normal color
			block_num[one_block_left].setColor("#000");
      //resetting the block into normal object type
      block[one_block_left].object_type='interactive_block';

			one_block_left=999;//resetting the last block flag
		}
	}

	}


function IsDailyBoard(){
	if(board_seed==board_seed_daily){
		return true;
	}else{
		return false;
	}
}

function IsWeeklyBoard(){
	if(board_seed==board_seed_weekly){
		return true;
	}else{
		return false;
	}
}



//////////////////////////
//SERVER STUFF
//////////////////////////

//add new best min_burn to the server
function ServerAddScore(){

	//Resetting the flag. It becomes 1 only if the server returns
	//min_burn, verifying it was recorded.
	min_burn_server_verified=0;


  var xhttp = new XMLHttpRequest();

  xhttp.open("POST", "add_score.php", true);
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhttp.timeout = 5000;
  xhttp.send("board_seed="+board_seed+"&board_type="+board_type+"&lost="+burn+"&undo_id_one="+undo_id_one+"&undo_id_two="+undo_id_two);

  xhttp.onreadystatechange = function() {

      if (this.readyState == 4 && this.status == 200) {
            min_burn_server_verified=1;
            UpdateScore();
        }
     }




}

//get the server score to the board
function ServerReadScore(){

  var xhttp = new XMLHttpRequest();

  xhttp.open("POST", "read_score.php", true);
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhttp.timeout = 5000;
  xhttp.send("board_seed="+board_seed+"&board_type="+board_type);

  xhttp.onreadystatechange = function() {

      if (this.readyState == 4 && this.status == 200) {
        if (!this.responseText){
          min_burn=999;
        }else{
          min_burn=this.responseText;
        }

        if(board_type=='q'){
          localStorage.setItem('daily_min_burn', min_burn);
        }else {
          localStorage.setItem('weekly_min_burn', min_burn);
        }
        UpdateScore();
        }
     }


}

//compare the client's score with what's currently on the server
function ServerCompareScore(){

	//ajax-loader
	//$("#gameover").prepend('<div style="width:297px;height:17px;margin:auto;text-align:center;" id="loader"><img src="img/ajax-loader.gif" style="margin:auto;display:block;top: 0px;left: 0px;right: 0px;bottom:0px;position: absolute;" /></div>');

  var xhttp = new XMLHttpRequest();

  xhttp.open("POST", "read_score.php", true);
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhttp.timeout = 5000;
  xhttp.send("board_seed="+board_seed+"&board_type="+board_type);

  xhttp.onreadystatechange = function() {

      if (this.readyState == 4 && this.status == 200) {
        //if there is no data, we'll rely on the client for smooth experience. the probability that the score will constantly be changing would be low for the vast majority of the time
        if (!this.responseText){
          gameover_on();
        }
        else{
          min_burn=this.responseText;
          gameover_on();
        }
      }


    }

}

function ServerReadReplay(){

  var xhttp = new XMLHttpRequest();

  xhttp.open("POST", "read_score.php", true);
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhttp.timeout = 5000;
  xhttp.send();

  xhttp.onreadystatechange = function() {

      if (this.readyState == 4 && this.status == 200) {
        if (!this.responseText){
  				$('#replay_daily_sign').text("");
  				$('#replay_daily_button').attr('class','button_menu_disabled');
  				$('#replay_weekly_sign').text("");
  				$('#replay_weekly_button').attr('class','button_menu_disabled');
  				return false;
  			}

  			var replay = JSON.parse(this.responseText);
  			replay_daily_first= JSON.parse(replay[0]);
  			replay_daily_second= JSON.parse(replay[1]);
  			replay_daily_board_seed=replay[2];
  			replay_weekly_first= JSON.parse(replay[3]);
  			replay_weekly_second= JSON.parse(replay[4]);
  			replay_weekly_board_seed=replay[5];

  			$('#replay_daily_sign').text("Solution From Yesterday");
  			$('#replay_daily_button').text("Yesterday's Board");
  			$('#replay_daily_button').attr('class','button_menu_solution');

  			$('#replay_weekly_sign').text("Solution From Last Week");
  			$('#replay_weekly_button').text("Last Week's Board");
  			$('#replay_weekly_button').attr('class','button_menu_solution');
      }
    }
}

//reads board seeds, but not their min_burn, this is done in ServerReadScore()
function ServerReadPeriodical(){

  var xhttp = new XMLHttpRequest();

  xhttp.open("POST", "read_periodicals.php", true);
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhttp.timeout = 5000;
  xhttp.send();

  xhttp.onreadystatechange = function() {

      if (this.readyState == 4 && this.status == 200) {

        //if the script is broken or user is offline, get data from local storage
  			if (!this.responseText){
  					board_seed_daily=parseInt(localStorage.getItem('board_seed_daily'));
  					board_seed_weekly=parseInt(localStorage.getItem('board_seed_weekly'));
  					today=localStorage.getItem('today');
  					week=localStorage.getItem('week');
  					day=localStorage.getItem('day');
  			}
  			else{//if user is online, get data from online and update local storage

  					var news = JSON.parse(this.responseText);

  					board_seed_daily=news[0];
  					board_seed_weekly=news[1];
  					today=news[2];
  					week=news[3];
  					day=news[4];

  					localStorage.setItem('board_seed_daily', board_seed_daily);
  					localStorage.setItem('board_seed_weekly', board_seed_weekly);
  					localStorage.setItem('today', today);
  					localStorage.setItem('week', week);
  					localStorage.setItem('day', day);

  						///////////////////////YOUR BEST
  						//player's best performance on periodicals

  						your_daily_best=JSON.parse(localStorage.getItem('your_daily_best'));
  						your_weekly_best=JSON.parse(localStorage.getItem('your_weekly_best'));

  						if(!your_daily_best){

  							your_daily_best=[];
  							your_daily_best[0]=board_seed_daily;
  							your_daily_best[1]=999;
  							localStorage.setItem('your_daily_best', JSON.stringify(your_daily_best));

  						}else if(your_daily_best[0]!=board_seed_daily){

  							//console.log("New board seed! Changing from "+ your_daily_best[0] + "to " + board_seed_daily);
  							your_daily_best[0]=board_seed_daily;
  							your_daily_best[1]=999;
  							localStorage.setItem('your_daily_best', JSON.stringify(your_daily_best));

  						}

  								if(!your_weekly_best){

  									your_weekly_best=[];
  									your_weekly_best[0]=board_seed_weekly;
  									your_weekly_best[1]=999;
  									localStorage.setItem('your_weekly_best', JSON.stringify(your_weekly_best));

  								}else if(your_weekly_best[0]!=board_seed_weekly){

  									your_weekly_best[0]=board_seed_weekly;
  									your_weekly_best[1]=999;
  									localStorage.setItem('your_weekly_best', JSON.stringify(your_weekly_best));

  								}

  			}

  			if(board_seed_daily){

          daily_button.setFrame(0);

  				if(board_seed_daily==-999){

            daily_button_sign.setText("Friday Board");
            today_sign.setText("Designed by a human");

  				}else{
            today_sign.setText(today);
  				}
  			}
  			if(board_seed_weekly){
          weekly_button.setFrame(0);

            week_sign.setText("Week " + week);

        }

      }
  }//success

}

var markers = [
    { name: 'zero', start: 0, duration: 0.2, config: {} },
    { name: 'unused', start: 0, duration: 0.2, config: {} },
    { name: 'match', start: 0, duration: 0.2, config: {} },
    { name: 'subtract', start: 1, duration: 0.5, config: {} },
    { name: 'endgame', start: 2, duration: 0.3, config: {} },
    { name: 'undo', start: 3, duration: 0.1, config: {} },
    { name: 'click', start: 4, duration: 0.1, config: {} },
    { name: 'de-select', start: 5, duration: 0.1, config: {} },
    { name: 'gameover', start: 6, duration: 0.4, config: {} },
    { name: 'oneblock', start: 7, duration: 0.2, config: {} }
];

function PlayAudio2(snd,context=PhaserContext){
			context.sound.play('sfx', markers[snd]);
	}
