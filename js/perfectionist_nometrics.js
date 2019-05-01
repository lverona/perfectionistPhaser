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
var init_board_type;//if a board type is sent
var board_type='q';//board type: quick or full

var index=0;
var burn=0;//burn (how much score was lost when melding)
var min_burn=0;//minimum burn
//to know that the server has recorded min_burn. By default this is 1, since if there is already a score or no score, no verification is needed
var min_burn_server_verified=1;
var compare_score_verified=1;
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
var PhaserContext;//this from the playGame scene
var SettingsContext;//this from the showSettings scene
var text;
var today_sign;
var week_sign;
var daily_button;
var weekly_button;
var border;
var board_complete_text1;//since this text is unlikely to fit on one line
var board_complete_text2;
var final_score_text;
var advice_text1;//since this text is unlikely to fit on one line
var advice_text2;
var win_image;
var replay_play;
var replay_bck;
var replay_fwd;
var ajax_loader;
var playGame_offset=-10;//vertical offset of game objects
var showMenu_offset=-10;



//user preferences
var color_scheme=0;//an actual coefficient
var color_scheme_id=1;//the color scheme id that sets color_scheme
var vibro=0;

//getting url parameters (if any)
var urlParams;
(window.onpopstate = function () {
  var match,
    pl     = /\+/g,  // Regex for replacing addition symbol with a space
    search = /([^&=]+)=?([^&]*)/g,
    decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
    query  = window.location.search.substring(1);

  urlParams = {};
  while (match = search.exec(query))
     urlParams[decode(match[1])] = decode(match[2]);
})();

if(urlParams["seed"]){
    init_seed=urlParams["seed"];
    init_board_type=urlParams["board"];
}

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
       scene: [preloadAssets, showMenu, gameOver, playGame, showRules, showSettings]
   };

   color_scheme_id=parseInt(localStorage.getItem('color_scheme_id'));

       	if(!color_scheme_id){
       		console.log("no color scheme set, using default");
       		color_scheme_id=1;
       	}else{
          switch(color_scheme_id){
            case 1:
              color_scheme=0;
            break;
            case 2:
              color_scheme=35;
            break;
            case 3:
              color_scheme=50;
            break;
          }
        }

        window.addEventListener("blur", function(event) {
          if (PhaserContext.scale.isFullscreen)
          {
              full_screen_button.setFrame(0);
              PhaserContext.scale.stopFullscreen();
          }
        },
        false);

    game = new Phaser.Game(gameConfig);
    window.focus();
}



var preloadAssets = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function preloadAssets(){
        Phaser.Scene.call(this, {key: "preloadAssets"});
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
          frameHeight: 62
      });
      this.load.image("border_100", "assets/img/border_100.png");
      this.load.image("border_68", "assets/img/border_68.png");
      this.load.image("menu_button", "assets/img/menu.png");
      this.load.image("rules_button", "assets/img/rules.png");
      this.load.image("top_panel_border_100", "assets/img/top_panel_border_100.png");

      this.load.image("close_button", "assets/img/close_button.png")

      this.load.spritesheet("standard_menu_buttons", "assets/img/standard_menu_buttons.png", {
          frameWidth: 556,
          frameHeight: 68
      });
      this.load.spritesheet("narrow_menu_buttons", "assets/img/narrow_menu_buttons.png", {
          frameWidth: 556,
          frameHeight: 58
      });

      this.load.image("title_background", "assets/img/title_background.png");
      this.load.image("gameover_background", "assets/img/gameover_background.png");

      this.load.image("white_block_border_100","assets/img/white_block_border_100.png");
      this.load.image("white_block_border_68","assets/img/white_block_border_68.png");

      this.load.spritesheet("win_images", "assets/img/win_images.png", {
          frameWidth: 260,
          frameHeight: 254
      });

      this.load.image("replay_bck", "assets/img/replay_bck.png");
      this.load.image("replay_fwd", "assets/img/replay_fwd.png");
      this.load.spritesheet("replay_play", "assets/img/replay.png", {
          frameWidth: 58,
          frameHeight: 62
      });

      this.load.spritesheet("ajax_loader", "assets/img/ajax_loader.png", {
          frameWidth: 32,
          frameHeight: 32
      });

      this.load.image("tutorial_image_1", "assets/img/tutorial_image_1.png");
      this.load.image("tutorial_image_2", "assets/img/tutorial_image_2.png");
      this.load.image("tutorial_image_3", "assets/img/tutorial_image_3.png");
      this.load.image("tutorial_image_4", "assets/img/tutorial_image_4.png");
      this.load.image("tutorial_image_5", "assets/img/tutorial_image_5.png");
      this.load.image("tutorial_image_6", "assets/img/tutorial_image_6.png");
      this.load.image("tutorial_image_7", "assets/img/tutorial_image_7.png");

      this.load.image("tutorial_left_arrow", "assets/img/tutorial_left_arrow.png");
      this.load.image("tutorial_right_arrow", "assets/img/tutorial_right_arrow.png");

      this.load.image("settings_left_arrow", "assets/img/settings_left_arrow.png");
      this.load.image("settings_right_arrow", "assets/img/settings_right_arrow.png");

      this.load.image("splash","assets/img/splash.png");

      this.load.spritesheet("full_screen_button", "assets/img/full_screen_button.png", {
          frameWidth: 50,
          frameHeight: 50
      });


      this.load.audio('sfx','assets/snd/main_compressed_LAME192kbps.mp3');

    },
    create: function(){

      WebFont.load({
              google: {
                  families: [ 'Ubuntu', 'Heebo' ]
              }
          });

        this.scene.launch("gameOver");
        this.scene.sleep("gameOver");
        this.scene.launch("playGame");
        this.scene.sleep("playGame");

        this.scene.launch("showMenu");


        this.scene.remove();

    }
})


var showSettings = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function showSettings(){
        Phaser.Scene.call(this, {key: "showSettings"});
    },
    create: function(){

        SettingsContext=this;

        this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, "gameover_background");

        this.add.text(this.game.renderer.width / 2, 50,'Settings', { fontFamily:'Ubuntu', fontSize: '36pt', color: '#3b8adb', fontStyle: 'bold', metrics:{ascent: 46, descent: 9, fontSize: 55} }).setOrigin(0.5,0);
        //console.log(settings_text.getTextMetrics());

        this.add.text(this.game.renderer.width / 2, 170, 'Change Color Scheme', { fontFamily: 'Ubuntu', fontSize: '28pt', color: '#3b8adb', wordWrap: { width: 700, useAdvancedWrap: true }, align: 'center', lineSpacing: 10, metrics:{ascent: 34, descent: 7, fontSize: 41} }).setOrigin(0.5,0);

        settings_left_arrow = this.add.image(78,423,'settings_left_arrow').setInteractive();
        settings_right_arrow = this.add.image(643,423,'settings_right_arrow').setInteractive();
        settings_left_arrow.object_type='settings_left_arrow';
        settings_right_arrow.object_type='settings_right_arrow';

        color_scheme_text = this.add.text(this.game.renderer.width / 2, 620, 'Deep Space Nine', { fontFamily: 'Ubuntu', fontSize: '24pt', color: '#fff', wordWrap: { width: 700, useAdvancedWrap: true }, align: 'center', lineSpacing: 10, metrics:{ascent: 29, descent: 6, fontSize: 35} });
        color_scheme_text.setOrigin(0.5,0);

        switch(color_scheme_id){
          case 1: color_scheme_text.setText('Deep Space Nine'); break;
          case 2: color_scheme_text.setText('Antique Masonry'); break;
        }

        var back_button=this.add.image(this.game.renderer.width / 2, 960+showMenu_offset, "narrow_menu_buttons").setInteractive();
        back_button.setFrame(1);
        back_button.object_type='back_button';
        this.add.text(this.game.renderer.width / 2, 960+showMenu_offset,'Back to Menu', { fontFamily:'Ubuntu', fontSize: '32pt', color: '#fff', fontStyle: 'bold', metrics:{ascent: 40, descent: 8, fontSize: 48} }).setOrigin(0.5,0.5);


        CreateSettingsBlocks();

        this.input.on('gameobjectdown', function(pointer,gameObject){
                if(gameObject.object_type=='back_button'){

                  PlayAudio2(6);
                  this.scene.switch("showMenu");

                }else if(gameObject.object_type=='settings_right_arrow'){
                  var block_num = blockNumGroup.getChildren();

                  color_scheme_id++;
                  if(color_scheme_id==3){color_scheme_id=1;}

                  switch(color_scheme_id){
                    case 1: color_scheme = 0; color_scheme_text.setText('Deep Space Nine'); break;
                    case 2: color_scheme = 35; color_scheme_text.setText('Antique Masonry'); break;
                  }

                  //recoloring blocks, but only if it is not endgame
                  if(endgame==0){
                  blockGroup.children.iterate(function (child) {
                      child.setFrame(block_num[child.block_id].blocknum_value - 1 + color_scheme);
                    });
                  }

                  localStorage.setItem('color_scheme_id', color_scheme_id);

                  PlayAudio2(6);
                  CreateSettingsBlocks();
                }else if(gameObject.object_type=='settings_left_arrow'){
                  var block_num = blockNumGroup.getChildren();

                  color_scheme_id--;
                  if(color_scheme_id==0){color_scheme_id=2;}

                  switch(color_scheme_id){
                    case 1: color_scheme = 0; color_scheme_text.setText('Deep Space Nine'); break;
                    case 2: color_scheme = 35; color_scheme_text.setText('Antique Masonry'); break;
                  }

                  //recoloring blocks, but only if it is not endgame
                  if(endgame==0){
                  blockGroup.children.iterate(function (child) {
                      child.setFrame(block_num[child.block_id].blocknum_value - 1 + color_scheme);
                    });
                  }

                  localStorage.setItem('color_scheme_id', color_scheme_id);

                  PlayAudio2(6);
                  CreateSettingsBlocks();
                }
        },this);

    }
});

var showRules = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function showRules(){
        Phaser.Scene.call(this, {key: "showRules"});
    },
    create: function(){

        this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, "gameover_background");

        var title_text_1=this.add.text(this.game.renderer.width / 2, 20,'How to play', { fontFamily:'Ubuntu', fontSize: '30pt', color: '#3b8adb', fontStyle: 'bold', metrics:{ascent: 38, descent: 7, fontSize: 45} });
        title_text_1.setOrigin(0.5,0);


        var upper_content= [
          "Your goal is to remove all blocks from the board, and do it as efficiently as possible",
          "\n",
          "There are only 5 rules to the game",
          "\n"
        ];

        tut_text_upper = this.add.text(this.game.renderer.width / 2, 150, upper_content, { fontFamily: 'Ubuntu', fontSize: '24pt', color: '#fff', wordWrap: { width: 700, useAdvancedWrap: true }, align: 'center', lineSpacing: 10, metrics:{ascent: 29, descent: 6, fontSize: 35} });
        tut_text_upper.setOrigin(0.5,0);

        tut_image = this.add.image(this.game.renderer.width / 2, 500, "tutorial_image_3");
        tut_image.alpha=0;

        var lower_content= [
          ""
        ];

        tut_text_lower = this.add.text(this.game.renderer.width / 2, 680, lower_content, { fontFamily: 'Ubuntu', fontSize: '24pt', color: '#fff', wordWrap: { width: 700, useAdvancedWrap: true }, align: 'center', lineSpacing: 10, metrics:{ascent: 29, descent: 6, fontSize: 35} });
        tut_text_lower.setOrigin(0.5,0);


        var left_button = this.add.image(this.game.renderer.width / 2 - 150, 1000, "tutorial_left_arrow").setInteractive();
        left_button.object_type='left_button';

        var right_button = this.add.image(this.game.renderer.width / 2 + 150, 1000, "tutorial_right_arrow").setInteractive();
        right_button.object_type='right_button';



        this.input.on('gameobjectdown', function(pointer,gameObject){

          //this.input.stopPropagation();

          if(gameObject.object_type=='left_button'){

            tutorial_page--;

      			if(tutorial_page==0){//exiting from tutorial
              tutorial_page=1;
              this.scene.switch("playGame");
            }else{
              Tutorial(tutorial_page);
            }

            PlayAudio2(6);

          }else if(gameObject.object_type=='right_button'){

            tutorial_page++;

            if(tutorial_page>9){//exiting from tutorial
              tutorial_page=1;
              Tutorial(tutorial_page);
              this.scene.switch("playGame");
            }else{
              Tutorial(tutorial_page);
            }
            PlayAudio2(6);


          }



        },this);//input

    }//create
});

var showMenu = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function setupGame(){
        Phaser.Scene.call(this, {key: "showMenu"});
    },
    create: function(){

        this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, "title_background");

        splash = this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, "splash").setInteractive().setDepth(1);
        splash.object_type='splash';

        full_screen_button = this.add.image(40, 40, "full_screen_button").setInteractive();
        full_screen_button.object_type='full_screen_button';
        full_screen_button.setFrame(0);

        var title_text_1=this.add.text(this.game.renderer.width / 2, 20,'Louigi Verona\'s', { fontFamily:'Heebo', fontSize: '30pt', color: '#3b8adb', fontStyle: 'bold', metrics:{ascent: 39, descent: 8, fontSize: 47} });
        title_text_1.setOrigin(0.5,0);

        var title_text_2=this.add.text(this.game.renderer.width / 2, 55,'Perfectionist', { fontFamily:'Heebo', fontSize: '65pt', color: '#3b8adb', fontStyle: 'bold', metrics:{ascent: 82, descent: 19, fontSize: 101} });
        title_text_2.setOrigin(0.5,0);

        today_sign=this.add.text(this.game.renderer.width / 2, 240+showMenu_offset,'', { fontFamily:'Ubuntu', fontSize: '24pt', color: '#999999', fontStyle: 'bold', metrics:{ascent: 30, descent: 6, fontSize: 36} });
        today_sign.setOrigin(0.5,0);

        daily_button=this.add.image(this.game.renderer.width / 2, 312+showMenu_offset, "standard_menu_buttons").setInteractive();
        daily_button.setFrame(0);
        daily_button.object_type='daily_button';
        daily_button_sign=this.add.text(this.game.renderer.width / 2, 312+showMenu_offset,'Daily Board', { fontFamily:'Ubuntu', fontSize: '36pt', color: '#fff', fontStyle: 'bold', metrics:{ascent: 46, descent: 9, fontSize: 55} }).setOrigin(0.5,0.5);


        week_sign=this.add.text(this.game.renderer.width / 2, 400+showMenu_offset,'', { fontFamily:'Ubuntu', fontSize: '24pt', color: '#999999', fontStyle: 'bold', metrics:{ascent: 30, descent: 6, fontSize: 36} });
        week_sign.setOrigin(0.5,0);

        weekly_button=this.add.image(this.game.renderer.width / 2, 472+showMenu_offset, "standard_menu_buttons").setInteractive();
        weekly_button.setFrame(0);
        weekly_button.object_type='weekly_button';
        this.add.text(this.game.renderer.width / 2, 472+showMenu_offset,'Weekly Board', { fontFamily:'Ubuntu', fontSize: '36pt', color: '#fff', fontStyle: 'bold', metrics:{ascent: 46, descent: 9, fontSize: 55} }).setOrigin(0.5,0.5);

        this.add.text(this.game.renderer.width / 2, 628+showMenu_offset,'Solutions', { fontFamily:'Ubuntu', fontSize: '28pt', color: '#999999', fontStyle: 'bold', metrics:{ascent: 35, descent: 7, fontSize: 42} }).setOrigin(0.5,0);

        var replay_daily_button=this.add.image(this.game.renderer.width / 2, 720+showMenu_offset, "narrow_menu_buttons").setInteractive();
        replay_daily_button.setFrame(0);
        replay_daily_button.object_type='replay_daily_button';
        var yest = this.add.text(this.game.renderer.width / 2, 720+showMenu_offset,'Yesterday\'s Board', { fontFamily:'Ubuntu', fontSize: '32pt', color: '#fff', fontStyle: 'bold', metrics:{ascent: 40, descent: 8, fontSize: 48} }).setOrigin(0.5,0.5);

        var replay_weekly_button=this.add.image(this.game.renderer.width / 2, 818+showMenu_offset, "narrow_menu_buttons").setInteractive();
        replay_weekly_button.setFrame(0);
        replay_weekly_button.object_type='replay_weekly_button';
        this.add.text(this.game.renderer.width / 2, 818+showMenu_offset,'Last Week\'s Board', { fontFamily:'Ubuntu', fontSize: '32pt', color: '#fff', fontStyle: 'bold', metrics:{ascent: 40, descent: 8, fontSize: 48} }).setOrigin(0.5,0.5);

        var settings_button=this.add.image(this.game.renderer.width / 2, 960+showMenu_offset, "narrow_menu_buttons").setInteractive();
        settings_button.setFrame(1);
        settings_button.object_type='settings_button';
        this.add.text(this.game.renderer.width / 2, 960+showMenu_offset,'Settings', { fontFamily:'Ubuntu', fontSize: '32pt', color: '#fff', fontStyle: 'bold', metrics:{ascent: 40, descent: 8, fontSize: 48} }).setOrigin(0.5,0.5);

        var close_button=this.add.image(this.game.renderer.width / 2, 1070+showMenu_offset, "close_button").setInteractive();
        close_button.object_type='close_button';

        if(init_seed && init_board_type){
          board_seed=init_seed;
          board_type=init_board_type;
          init_seed=0;
          init_board_type=0;
          CreateLevel();
          this.scene.switch("playGame");
        }


        //getting the daily and weekly board
        ServerReadPeriodical();
        //getting yesterday's and previous week's solutions
        ServerReadReplay();

        this.input.on('gameobjectdown', function(pointer,gameObject){

          //this.input.stopPropagation();

          if(gameObject.object_type=='daily_button'){

            //ajax_loader = this.add.sprite(this.game.renderer.width / 2,this.game.renderer.height / 2,"ajax_loader").play("loader").setDepth(1);

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
            ReplayPanel(0);

            PlayAudio2(6,this);

            CreateLevel();

            navigator.vibrate([70]);
            this.scene.switch("playGame");

          }else if(gameObject.object_type=='weekly_button'){

            if(board_seed_weekly){
              board_type='f';
      				board_seed=board_seed_weekly;
      			}
      			else{return false;}

      			//switching from replay mode
      			ReplayPanel(0);

      			PlayAudio2(6);

      			CreateLevel();

            navigator.vibrate([70]);
            this.scene.switch("playGame");
          }else if(gameObject.object_type=='replay_daily_button'){

              current_rboard_seed=replay_daily_board_seed;
            	current_rboard_type='q';
            	SetupReplayBoard(current_rboard_type,current_rboard_seed);
              this.scene.switch("playGame");

          }else if(gameObject.object_type=='replay_weekly_button'){

              current_rboard_seed=replay_weekly_board_seed;
            	current_rboard_type='f';
            	SetupReplayBoard(current_rboard_type,current_rboard_seed);
              this.scene.switch("playGame");

          }else if(gameObject.object_type=='splash'){
              PlayAudio2(6);
              gameObject.destroy();
          }else if(gameObject.object_type=='settings_button'){

              PlayAudio2(6);
              this.scene.switch("showSettings");

          }else if(gameObject.object_type=='full_screen_button'){
                      if (PhaserContext.scale.isFullscreen)
                      {
                          full_screen_button.setFrame(0);
                          PhaserContext.scale.stopFullscreen();
                      }else
                      {
                          full_screen_button.setFrame(1);
                          PhaserContext.scale.startFullscreen();
                      }
          }else if(gameObject.object_type=='close_button'){

                    if(is_there_board==0){//if no board has been generated, we just go to Daily
                      board_seed=board_seed_daily;
                      board_type='q';
                      CreateLevel();
                    }

                    PlayAudio2(6);
                    navigator.vibrate([70]);
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

      this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, "gameover_background");

      board_complete_text1 = this.add.text(this.game.renderer.width / 2, 70,'You set a world record', { fontFamily:'Ubuntu', fontSize: '34pt', color: '#3b8adb', fontStyle: 'bold', metrics:{ascent: 43, descent: 8, fontSize: 51} }).setOrigin(0.5,0);
      board_complete_text2 = this.add.text(this.game.renderer.width / 2, 125,'for this board!', { fontFamily:'Ubuntu', fontSize: '34pt', color: '#3b8adb', fontStyle: 'bold', metrics:{ascent: 43, descent: 8, fontSize: 51} }).setOrigin(0.5,0);


      final_score_text = this.add.text(this.game.renderer.width / 2, 225,'You got 51/51', { fontFamily:'Ubuntu', fontSize: '28pt', color: '#fff', fontStyle: 'bold', metrics:{ascent: 35, descent: 7, fontSize: 42} }).setOrigin(0.5,0);

      advice_text1 = this.add.text(this.game.renderer.width / 2, 325,'All players will now have to stay', { fontFamily:'Ubuntu', fontSize: '24pt', color: '#999', fontStyle: 'bold', metrics:{ascent: 30, descent: 6, fontSize: 36} }).setOrigin(0.5,0);
      advice_text2 = this.add.text(this.game.renderer.width / 2, 370,'within your score', { fontFamily:'Ubuntu', fontSize: '24pt', color: '#999', fontStyle: 'bold', metrics:{ascent: 30, descent: 6, fontSize: 36} }).setOrigin(0.5,0);

      win_image = this.add.image(this.game.renderer.width / 2, 600, "win_images");
      win_image.setFrame(0);


      var play_again_button=this.add.image(this.game.renderer.width / 2, 832, "standard_menu_buttons").setInteractive();
      play_again_button.setFrame(1);
      play_again_button.object_type='play_same_board';
      this.add.text(this.game.renderer.width / 2, 832,'Play Same Board', { fontFamily:'Ubuntu', fontSize: '36pt', color: '#fff', fontStyle: 'bold', metrics:{ascent: 46, descent: 9, fontSize: 55} }).setOrigin(0.5,0.5);

      var goto_menu__button=this.add.image(this.game.renderer.width / 2, 932, "standard_menu_buttons").setInteractive();
      goto_menu__button.setFrame(0);
      goto_menu__button.object_type='goto_menu';
      this.add.text(this.game.renderer.width / 2, 932,'Go To Menu', { fontFamily:'Ubuntu', fontSize: '36pt', color: '#fff', fontStyle: 'bold', metrics:{ascent: 46, descent: 9, fontSize: 55} }).setOrigin(0.5,0.5);



      this.input.on('gameobjectdown', function(pointer,gameObject){

        if(gameObject.object_type=='play_same_board'){

            PlayAudio2(6);
            this.scene.switch("playGame");
            CreateLevel();

          }else if(gameObject.object_type=='goto_menu'){
            PlayAudio2(6);
            this.scene.switch("showMenu");
          }

        },this);

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

        blockNumGroup = this.add.group();
        blockGroup = this.add.group();


        //Building UI

        //debug=this.add.text(10,10,'', { fill: '#00ff00' });


        blocks_left_text=this.add.text(40,82+playGame_offset,'Blocks left: 99', { fontFamily:'Ubuntu', fontSize: '25pt', color: '#e8a015', metrics:{ascent: 31, descent: 6, fontSize: 37} });
        blocks_left_text.setOrigin(0);

        lost_text=this.add.text(553,82+playGame_offset,'Lost: 0/?', { fontFamily:'Ubuntu', fontSize: '25pt', color: '#e8a015', metrics:{ascent: 31, descent: 6, fontSize: 37} });
        lost_text.setOrigin(0);

        top_panel_border_100=this.add.image(15,66+playGame_offset,"top_panel_border_100");
        top_panel_border_100.setOrigin(0);//to use normal coordinates

        your_best_text=this.add.text(309,24+playGame_offset,'Your best on this board: ?', { fontFamily:'Ubuntu', fontSize: '24pt', color: '#555', fontStyle: 'bold', metrics:{ascent: 30, descent: 6, fontSize: 36} });
        your_best_text.setOrigin(0);

        rules_button=this.add.image(20,16+playGame_offset,"rules_button").setInteractive();
        rules_button.setOrigin(0);
        rules_button.object_type='rules_button';

        menu_button=this.add.image(20,1062+playGame_offset,"menu_button").setInteractive();
        menu_button.setOrigin(0);
        menu_button.object_type='menu_button';

        undo_button=this.add.image(540,1062+playGame_offset,"undo_button").setInteractive();
        undo_button.setFrame(1);
        undo_button.setOrigin(0);//to use normal coordinates
        undo_button.object_type='undo_button';



        replay_bck=this.add.image(330,1062+playGame_offset,"replay_bck").setInteractive().setInteractive(false);
        replay_bck.setOrigin(0);
        replay_bck.alpha=0;
        replay_bck.object_type='replay_bck';

        replay_play=this.add.image(480,1062+playGame_offset,"replay_play").setInteractive().setInteractive(false);
        replay_play.setFrame(0);
        replay_play.setOrigin(0);
        replay_play.alpha=0;
        replay_play.object_type='replay_play';

        replay_fwd=this.add.image(630,1062+playGame_offset,"replay_fwd").setInteractive().setInteractive(false);
        replay_fwd.setOrigin(0);
        replay_fwd.alpha=0;
        replay_fwd.object_type='replay_fwd';


        border = this.add.image(360,601+playGame_offset,"border_68");

        this.anims.create({
            key: "loader",
            frames: this.anims.generateFrameNumbers('ajax_loader', { start: 0, end: 11 }),
            frameRate: 10,
            repeat: -1
        });

        this.input.on('gameobjectdown', function(pointer,gameObject,event){



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

                  var block_num = blockNumGroup.getChildren();

                  //resetting replay stuff
                  clearInterval(replay_interval);
                  replay_is_active=0;
                  replay_stage=0;
                  replay_play.setFrame(0);

                  if(firstblk){
                      block_num[firstblk.block_id].setColor("#000");
                      firstblk=''; prevblk='';
                  }

                  //otherwise a reload level might create a bug, since firstblk will then no longer exist
                  firstblk='';//resetting click
                  prevblk='';//variables

          //only in case this is a daily or weekly board
          if(is_there_board==1 && (board_seed==board_seed_daily || board_seed==board_seed_weekly)){

                            //colorize actively selected board
                            if(board_type=="q"){
                              daily_button.setFrame(1);
                              weekly_button.setFrame(0);
                            }else{
                              daily_button.setFrame(0);
                              weekly_button.setFrame(1);
                            }

          }

          PlayAudio2(6);
          this.scene.switch("showMenu");
        }else if(gameObject.object_type=='last_block'){
          firstblk=gameObject;
          prevblk=gameObject;
          BlockDoubleclick(firstblk);
        }else if(gameObject.object_type=='rules_button'){
          PlayAudio2(6);
          this.scene.switch("showRules");
        }else if(gameObject.object_type=='replay_bck'){
                if(replay_is_active==0 && current_move>1){
                  var block = blockGroup.getChildren();

                  //accessing the two necessary blocks and adding border images
      						if(current_rboard_type=='q'){
                    var first = block[replay_daily_first[current_move]];
                    var second = block[replay_daily_second[current_move]];
      						}else{
                    var first = block[replay_weekly_first[current_move]];
                    var second = block[replay_weekly_second[current_move]];
      						}
                  if(total_blocks>0){//this is to make sure that we are not trying to access non-existing blocks at the very end of the game
                    var endgamecolorsaddition=0;//to make sure we color correctly during the endgame phase
                    if(endgame==1){endgamecolorsaddition=15;}
                    first.setFrame(first.block_value-1+endgamecolorsaddition+color_scheme);
                    if(total_blocks>1){second.setFrame(second.block_value-1+endgamecolorsaddition+color_scheme);}
                  }
              		Undo();

              		replay_stage=0;//doing undo resets the replay_stage of the forward button, since now we have to start the next move all over
        	}
        }else if(gameObject.object_type=='replay_fwd'){
            if(replay_is_active==0 && current_move<=replay_length){
              RunReplayStep();
            }
        }else if(gameObject.object_type=='replay_play'){

              var block = blockGroup.getChildren();

              if(total_blocks==0){
                SetupReplayBoard(current_rboard_type,current_rboard_seed);
                return;
              }

              if(replay_is_active==0){
          		//PLAY button
          		replay_is_active=1;
          		replay_play.setFrame(1);
          		PlayAudio2(9);

              //accessing the two necessary blocks and resetting selected blocks
              if(current_rboard_type=='q'){
                var first = block[replay_daily_first[current_move]];
                var second = block[replay_daily_second[current_move]];
              }else{
                var first = block[replay_weekly_first[current_move]];
                var second = block[replay_weekly_second[current_move]];
              }
              var endgamecolorsaddition=0;//to make sure we color correctly during the endgame phase
              if(endgame==1){endgamecolorsaddition=15;}
              first.setFrame(first.block_value-1+endgamecolorsaddition+color_scheme);
              if(total_blocks>1){second.setFrame(second.block_value-1+endgamecolorsaddition+color_scheme);}

          		RunReplaySimulation();

          	}else{

          			replay_is_active=0;
          			replay_play.setFrame(0);
          			PlayAudio2(9);

          			//reset the step by step stage
          			replay_stage=0;

          			//stopping the simulation and resetting selected blocks
          			clearInterval(replay_interval);
          			if(current_rboard_type=='q'){
                  var first = block[replay_daily_first[current_move]];
                  var second = block[replay_daily_second[current_move]];
          			}else{
                  var first = block[replay_weekly_first[current_move]];
                  var second = block[replay_weekly_second[current_move]];
          			}
                var endgamecolorsaddition=0;//to make sure we color correctly during the endgame phase
                if(endgame==1){endgamecolorsaddition=15;}
                first.setFrame(first.block_value-1+endgamecolorsaddition+color_scheme);
                if(total_blocks>1){second.setFrame(second.block_value-1+endgamecolorsaddition+color_scheme);}

          	}
          }

          event.stopPropagation();

      },this);

                          //deselect a block if one is selected
                          this.input.on('pointerdown', function(){
                                if(firstblk){
                                    var block_num = blockNumGroup.getChildren();

                                    block_num[firstblk.block_id].setColor("#000");
                                    firstblk=''; prevblk='';
                                    PlayAudio2(7);
                                  }
                          },this);



  }//create

  });



function Tutorial(page){
  switch(page){
    case 1:
              var upper_content= [
                "Your goal is to remove all blocks from the board, and do it as efficiently as possible",
                "\n",
                "There are only 5 rules to the game",
                "\n"
              ];
              tut_text_upper.setText(upper_content);
              tut_text_lower.setText('');

              tut_image.alpha=0;

    break;
    case 2:
              var upper_content= [
                "Rule 1.\n",
                "Combine blocks of same value by first clicking on one, then on the other",
                "\n"
              ];
              tut_text_upper.setText(upper_content);
              tut_text_lower.setText('This removes blocks with no loss of score');
              tut_image.alpha=1;
              tut_image.setTexture("tutorial_image_1");
    break;
    case 3:
              var upper_content= [
                "Rule 2.\n",
                "Combine blocks of different value",
                "\n"
              ];
              tut_text_upper.setText(upper_content);
              tut_text_lower.setText('This subtracts blocks with a loss of score');
              tut_image.alpha=1;
              tut_image.setTexture("tutorial_image_2");
    break;
    case 4:
              var upper_content= [
                "Rule 2.\n",
                "Combine blocks of different value",
                "\n"
              ];
              tut_text_upper.setText(upper_content);
              tut_text_lower.setText('This subtracts blocks with a loss of score');
              tut_image.alpha=1;
              tut_image.setTexture("tutorial_image_3");
    break;
    case 5:
              var upper_content= [
                "Rule 3.\n",
                "You can combine blocks horizontally or vertically",
                "\n"
              ];
              tut_text_upper.setText(upper_content);
              tut_text_lower.setText('You can go across empty spaces, but you are not allowed to jump over other blocks');
              tut_image.alpha=1;
              tut_image.setTexture("tutorial_image_4");
    break;
    case 6:
              var upper_content= [
                "Rule 4.\n",
                "Blocks with value \"1\" can jump around the board",
                "\n"
              ];
              tut_text_upper.setText(upper_content);
              tut_text_lower.setText('');
              tut_image.alpha=1;
              tut_image.setTexture("tutorial_image_5");
    break;
    case 7:
              var upper_content= [
                "Rule 5.\n",
                "When 10 blocks remain, the puzzle enters \"end game phase\"",
                "\n"
              ];
              tut_text_upper.setText(upper_content);
              tut_text_lower.setText('Any block can now jump around the board');
              tut_image.alpha=1;
              tut_image.setTexture("tutorial_image_6");
    break;
    case 8:
              var upper_content= [
                "Rule 5.\n",
                "If one block remains, remove it by a tap as it becomes highlighted",
                "\n"
              ];
              tut_text_upper.setText(upper_content);
              tut_text_lower.setText('');
              tut_image.alpha=1;
              tut_image.setTexture("tutorial_image_7");
    break;
    case 9:
              var upper_content= [
                "Scores are shared:\n",
                "if you make a new record, all other players will see it"
              ];
              tut_text_upper.setText(upper_content);
              tut_text_lower.setText('');
              tut_image.alpha=0;
    break;
  }
}

function gameover_on(){

  PlayAudio2(8);

  //console.log(board_seed);
  //console.log(board_type);
  //console.log(burn);
  //console.log(undo_id_one);
  //console.log(undo_id_two);

  endgame=0;//resetting endgame status

	//saving your personal best, making sure the board seed is the same
	if(burn<your_daily_best[1] && your_daily_best[0]==board_seed){
		your_daily_best[1]=burn;
		localStorage.setItem('your_daily_best', JSON.stringify(your_daily_best));
	}
	if(burn<your_weekly_best[1] && your_weekly_best[0]==board_seed){
		your_weekly_best[1]=burn;
		localStorage.setItem('your_weekly_best', JSON.stringify(your_weekly_best));
	}

	//setting win image and message
	if(burn<min_burn){//not sure we need min_burn==0 here, since by default min_burn is 999
		//image
    win_image.setFrame(0);
		//message
    board_complete_text1.setText('You set a world record');
    board_complete_text2.setText('for this board!');
    board_complete_text1.x=PhaserContext.game.renderer.width / 2;//centering text
    board_complete_text2.x=PhaserContext.game.renderer.width / 2;
    board_complete_text1.setColor("#3b8adb");
    board_complete_text2.setColor("#3b8adb");

		//score info
    final_score_text.setText("New minimum is now "+burn+"!");
		//advice
    advice_text1.setText('All players will now have to stay');
    advice_text2.setText('within your score');
    advice_text1.x=PhaserContext.game.renderer.width / 2;
    advice_text2.x=PhaserContext.game.renderer.width / 2;
    if(compare_score_verified==0){
      advice_text1.setText('There seems to be no Internet connection,');
      advice_text2.setText('so we might not be able to verify the record');
      advice_text1.x=PhaserContext.game.renderer.width / 2;
      advice_text2.x=PhaserContext.game.renderer.width / 2;
    }

		//sending new min_burn to the server
		min_burn=burn;
		UpdateScore();
		ServerAddScore();

	//beat board but no new record
	}else if(burn==min_burn){
		//image
		win_image.setFrame(0);
		//message
    board_complete_text1.setText('Board complete!');
    board_complete_text2.setText('');
    board_complete_text1.x=PhaserContext.game.renderer.width / 2;//centering text
    board_complete_text2.x=PhaserContext.game.renderer.width / 2;
    board_complete_text1.setColor("#3b8adb");
    board_complete_text2.setColor("#3b8adb");
		//score info
    final_score_text.setText("You got "+burn+"/"+min_burn+"!");
    final_score_text.x=PhaserContext.game.renderer.width / 2;
		//advice
    advice_text1.setText('You matched the current world record');
    advice_text2.setText('for this board!');
    advice_text1.x=PhaserContext.game.renderer.width / 2;
    advice_text2.x=PhaserContext.game.renderer.width / 2;

	//lost the board
	}else{
		//image
		win_image.setFrame(2);
		//message
    board_complete_text1.setText('Try again');
    board_complete_text2.setText('');
    board_complete_text1.x=PhaserContext.game.renderer.width / 2;//centering text
    board_complete_text2.x=PhaserContext.game.renderer.width / 2;
    board_complete_text1.setColor("#cc4239");
    board_complete_text2.setColor("#cc4239");
		//score info
    final_score_text.setText("You got "+burn+"/"+min_burn);
    final_score_text.x=PhaserContext.game.renderer.width / 2;
		//advice
		if((burn-min_burn)<10){
			win_image.setFrame(1);

      board_complete_text1.setText('Very good!');
      board_complete_text2.setText('');
      board_complete_text1.x=PhaserContext.game.renderer.width / 2;//centering text
      board_complete_text2.x=PhaserContext.game.renderer.width / 2;
      board_complete_text1.setColor("#fec14c");
      board_complete_text2.setColor("#fec14c");

      advice_text1.setText("Just " + (burn-min_burn) + " away");
      advice_text2.setText('from the current world record!');
      advice_text1.x=PhaserContext.game.renderer.width / 2;
      advice_text2.x=PhaserContext.game.renderer.width / 2;

		}else{

      advice_text1.setText((burn-min_burn) + " away from the");
      advice_text2.setText('current world record!');
      advice_text1.x=PhaserContext.game.renderer.width / 2;
      advice_text2.x=PhaserContext.game.renderer.width / 2;
		}

	}

  PhaserContext.scene.switch("gameOver");

}

function yourbestscore_position(number=0){
  var spaces=0;//amount of spaces to move the sign

  if(number>9 && number<100){spaces+=1;}
  else if(number>=100){spaces+=2;}

  your_best_text.x=309-18*spaces;
}

function UpdateScore(){

    var spaces=0;//amount of spaces to move the sign

    if(burn>9 && burn<100){spaces+=1;}
    else if(burn>=100){spaces+=2;}

    if(min_burn>9 && min_burn<100){spaces+=1;}
    else if(min_burn>=100 && min_burn<999){spaces+=2;}

    lost_text.x=553-20*spaces;

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
    playGame_offset=-10;
      blocks_left_text.y=82+playGame_offset;
      lost_text.y=82+playGame_offset;
      top_panel_border_100.y=66+playGame_offset;
      your_best_text.y=24+playGame_offset;
      rules_button.y=16+playGame_offset;


    total_blocks=48;
    board_rows=8;
    board_columns=6;
    border = PhaserContext.add.image(360,601+playGame_offset,"border_100");
    menu_button.x=20;menu_button.y=1062+playGame_offset;
    undo_button.x=540;undo_button.y=1062+playGame_offset;
        if(IsDailyBoard()){
            if(your_daily_best[1]==999){your_best_text.setText("");}
            else{
              your_best_text.setText("Your best on this board: "+your_daily_best[1]);
              yourbestscore_position(your_daily_best[1]);
            }
        }else{
            your_best_text.setText('');
        }
  }else{
    playGame_offset=26;
      blocks_left_text.y=82+playGame_offset;
      lost_text.y=82+playGame_offset;
      top_panel_border_100.y=66+playGame_offset;
      your_best_text.y=24+playGame_offset;
      rules_button.y=16+playGame_offset;


    total_blocks=99;
    board_rows=11;
    board_columns=9;
    border = PhaserContext.add.image(360,565+playGame_offset,"border_68");
    menu_button.x=20;menu_button.y=990+playGame_offset;
    undo_button.x=540;undo_button.y=990+playGame_offset;
    if(IsWeeklyBoard()){
        if(your_weekly_best[1]==999){your_best_text.setText("");}
        else{your_best_text.setText("Your best on this board: "+your_weekly_best[1]);yourbestscore_position(your_weekly_best[1]);}
      }else{
        your_best_text.setText('');
      }
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
          var block = PhaserContext.add.image(85+110*(x),(106+110*(y+1))+playGame_offset,"blocks_large_default").setInteractive();
          var block_num = PhaserContext.add.text(block.x, block.y, value+1, { fontFamily:'Heebo', fontSize: '34pt', color: '#000' });
        }else{
          var block = PhaserContext.add.image(64+74*(x),(121+74*(y+1))+playGame_offset,"blocks_small_default").setInteractive();
          var block_num = PhaserContext.add.text(block.x, block.y, value+1, { fontFamily:'Heebo', fontSize: '26pt', color: '#000' });
        }


        //setting a color
        block.setFrame(value+color_scheme);

        block.block_id=i;
        block.block_row=y;
        block.block_col=x;
        block.block_value=value+1;
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
function CreateReplayLevel(){

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
    playGame_offset=-10;
      blocks_left_text.y=82+playGame_offset;
      lost_text.y=82+playGame_offset;
      top_panel_border_100.y=66+playGame_offset;
      your_best_text.y=24+playGame_offset;
      rules_button.y=16+playGame_offset;

      replay_play.y=1062+playGame_offset;
      replay_bck.y=1062+playGame_offset;
      replay_fwd.y=1062+playGame_offset;


    total_blocks=48;
    board_rows=8;
    board_columns=6;
    border = PhaserContext.add.image(360,601+playGame_offset,"border_100");
    menu_button.x=20;menu_button.y=1062+playGame_offset;
    undo_button.x=540;undo_button.y=1062+playGame_offset;

  }else{
    playGame_offset=26;
      blocks_left_text.y=82+playGame_offset;
      lost_text.y=82+playGame_offset;
      top_panel_border_100.y=66+playGame_offset;
      your_best_text.y=24+playGame_offset;
      rules_button.y=16+playGame_offset;

      replay_play.y=990+playGame_offset;
      replay_bck.y=990+playGame_offset;
      replay_fwd.y=990+playGame_offset;


    total_blocks=99;
    board_rows=11;
    board_columns=9;
    border = PhaserContext.add.image(360,565+playGame_offset,"border_68");
    menu_button.x=20;menu_button.y=990+playGame_offset;
    undo_button.x=540;undo_button.y=990+playGame_offset;
  }

  your_best_text.setText("");

  total_blocks=board_columns*board_rows;
  blocks_left_text.setText("Blocks left: " + total_blocks);
  ServerReadScore();//reading the min_burn from server, if it exists

    var m = new MersenneTwister(board_seed);

    let i=0;//block id

    //building a play field
    for (var y = 0; y < board_rows; y++) {
      for (var x = 0; x < board_columns; x++) {
      var value = Math.floor(m.random()*15);

        if(board_type=='q'){
          var block = PhaserContext.add.image(85+110*(x),(106+110*(y+1))+playGame_offset,"blocks_large_default").setInteractive();
          var block_num = PhaserContext.add.text(block.x, block.y, value+1, { fontFamily:'Heebo', fontSize: '34pt', color: '#000' });
        }else{
          var block = PhaserContext.add.image(64+74*(x),(121+74*(y+1))+playGame_offset,"blocks_small_default").setInteractive();
          var block_num = PhaserContext.add.text(block.x, block.y, value+1, { fontFamily:'Heebo', fontSize: '26pt', color: '#000' });
        }


        //setting a color
        block.setFrame(value+color_scheme);

        //it turns out one cannot call SetInteractive(false) on a game object that had not been set to interactive in the first place; therefore, I first set all blocks to interactive and then set it to false, since later on block removals will call setInteractive(false) on the blocks
        //block.setInteractive(false);

        block.block_id=i;
        block.block_row=y;
        block.block_col=x;
        block.block_value=value+1;
        block.object_type='replay_block';//this guarantees that even when Undo makes blocks interactive through RestoreBlock, clicking on them does nothing;

        block_num.setOrigin(0.5);
        block_num.blocknum_id=i;
        block_num.blocknum_value=value+1;

        i++;

        blockGroup.add(block);
        blockNumGroup.add(block_num);

            }//x
        }//y




}

function CreateSettingsBlocks(){


    let i=0;//block id

    //building a play field
    for (var y = 0; y < 5; y++) {
      for (var x = 0; x < 6; x++) {

      var value = i;

          var block = SettingsContext.add.image(175+74*(x),(200+74*(y+1)),"blocks_small_default");
          var block_num = SettingsContext.add.text(block.x, block.y, value+1, { fontFamily:'Heebo', fontSize: '26pt', color: '#000', metrics: {ascent: 32, descent: 7, fontSize: 39} }).setOrigin(0.5);

        //setting a color
        block.setFrame(value+color_scheme);

        i++;
        if(i==15){i=0;}


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
        //if(first.object_type=='interactive_block'){navigator.vibrate([70]);}
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

        second.block_value=new_index;
        block_num[id_two].blocknum_value=new_index;
        block_num[id_two].setText(new_index);

				if(endgame==0){second.setFrame(new_index-1+color_scheme);}else{second.setFrame(new_index-1+15);}

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
  //block.object_type='hidden_block';


	}

function RestoreBlock(block_id,value_id){

  var block_num = blockNumGroup.getChildren();
  var block = blockGroup.getChildren();
  var one = block_num[block_id];

  one.alpha=1;
  one.blocknum_value=value_id;
  one.setText(value_id);

  block[block_id].alpha=1;
  block[block_id].block_value=value_id;
  //block.object_type='interactive_block';
  block[block_id].setInteractive();

  //working colors
  if(endgame==0){
      block[block_id].setFrame(value_id-1+color_scheme);}
  else{
      block[block_id].setFrame(value_id-1+15);
    }

}


function BlockDoubleclick(block){

        var block_num = blockNumGroup.getChildren();
        var one = block_num[block.block_id].blocknum_value;

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

      undo_id_one.pop();
      undo_id_two.pop();
      undo_one.pop();
      undo_two.pop();
      undo_type.pop();

	}//undo when combining
	else if(undo_type[current_move]==2){//undo when doubleclick

    	PlayAudio2(5);

    	burn-=undo_one[current_move];
    	UpdateScore();
    	TotalBlocks(-1);

      //UNDO FIRST (and only) BLOCK
      RestoreBlock(undo_id_one[current_move],undo_one[current_move]);

    }//undo when doubleclick


    	//undo_type[current_move]=0;
    	//this is an additional check, although the UNDO button should not
    	//call this function if current_move is not more than 0
    	if(current_move>0){current_move--;}
    		if(current_move==0){
          undo_button.setFrame(1);
    		}

      //resetting the color of the currently clicked block
      block_num[id_one].setColor("#000");
      if(firstblk){block_num[firstblk.block_id].setColor("#000");}//working the case when a player clicks a block, then undoes a move; in this case a clicked block's number sign should also be reset to the correct color
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

      navigator.vibrate([200]);

			if(board_seed>0){
				current_move=0;
    				//first get the score from the server
            ajax_loader = PhaserContext.add.sprite(this.game.renderer.width / 2,this.game.renderer.height / 2,"ajax_loader").play("loader");
    				ServerCompareScore();
			}else{
				//here nothing is happening, because during replay we don't want to show the gameover screen and we are not resetting the current_move
			}

		}

	//re-color the blocks back to the game colors
	//and remove endgame mode in case of Undo
	if(endgame==1 && total_blocks>10){
    var block_num = blockNumGroup.getChildren();

		endgame=0;
		setTimeout(function (){
      PlayAudio2(4);
    }, 200);

    //recoloring blocks back
    blockGroup.children.iterate(function (child) {
        child.setFrame(block_num[child.block_id].blocknum_value - 1 + color_scheme);
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
		setTimeout(function (){
      PlayAudio2(4);
      navigator.vibrate([70]);
    }, 200);
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

  var uio_stringified = JSON.stringify(undo_id_one);
  var uit_stringified = JSON.stringify(undo_id_two);

  var xhttp = new XMLHttpRequest();


  xhttp.open("POST", "add_score.php", true);
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhttp.timeout = 5000;
  xhttp.send("board_seed="+board_seed+"&board_type="+board_type+"&lost="+burn+"&undo_id_one="+uio_stringified+"&undo_id_two="+uit_stringified);

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

      if (this.readyState == 4) {

        if(this.status == 200){
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
        }else{
          if(board_type=='q'){
            min_burn=parseInt(localStorage.getItem('daily_min_burn'));
          }else {
            min_burn=parseInt(localStorage.getItem('weekly_min_burn'));
          }
          UpdateScore();
        }



        }

     }


}

//compare the client's score with what's currently on the server
function ServerCompareScore(){

  compare_score_verified=0;

  var xhttp = new XMLHttpRequest();

  xhttp.open("POST", "read_score.php", true);
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhttp.timeout = 5000;
  xhttp.send("board_seed="+board_seed+"&board_type="+board_type);

  xhttp.onreadystatechange = function() {

      if (this.readyState == 4) {
        if(this.status == 200){
              compare_score_verified=1;
              ajax_loader.destroy();
              //this is a case when no min_burn exists yet
              if (!this.responseText){
                gameover_on();
              }
              else{
                min_burn=this.responseText;
                gameover_on();
              }
        }else{//the case of an error or, most usually, no Internet connection. compare_score_verified is not set to 1
          ajax_loader.destroy();
          gameover_on();
        }

      }


    }

}

function ServerReadReplay(){

  var xhttp = new XMLHttpRequest();

  xhttp.open("POST", "read_replay.php", true);
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhttp.timeout = 5000;
  xhttp.send();

  xhttp.onreadystatechange = function() {

      if (this.readyState == 4 && this.status == 200) {
        if (!this.responseText){
  				//$('#replay_daily_sign').text("");
  				//$('#replay_daily_button').attr('class','button_menu_disabled');
  				//$('#replay_weekly_sign').text("");
  				//$('#replay_weekly_button').attr('class','button_menu_disabled');
  				return false;
  			}

  			var replay = JSON.parse(this.responseText);
  			replay_daily_first= JSON.parse(replay[0]);
  			replay_daily_second= JSON.parse(replay[1]);
  			replay_daily_board_seed=replay[2];
  			replay_weekly_first= JSON.parse(replay[3]);
  			replay_weekly_second= JSON.parse(replay[4]);
  			replay_weekly_board_seed=replay[5];

  			//$('#replay_daily_sign').text("Solution From Yesterday");
  			//$('#replay_daily_button').text("Yesterday's Board");
  			//$('#replay_daily_button').attr('class','button_menu_solution');

  			//$('#replay_weekly_sign').text("Solution From Last Week");
  			//$('#replay_weekly_button').text("Last Week's Board");
  			//$('#replay_weekly_button').attr('class','button_menu_solution');
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


//////////////////////////
//REPLAY
//////////////////////////

function ReplayPanel(state=0){
  if(state==0){
    undo_button.alpha=1;
    replay_play.alpha=0;
    replay_bck.alpha=0;
    replay_fwd.alpha=0;

    replay_play.setInteractive(false);
    replay_bck.setInteractive(false);
    replay_fwd.setInteractive(false);

  }else if(state==1){
    undo_button.alpha=0;
    replay_play.alpha=1;
    replay_bck.alpha=1;
    replay_fwd.alpha=1;

    replay_play.setInteractive();
    replay_bck.setInteractive();
    replay_fwd.setInteractive();

    replay_play.setFrame(0);
  }
}

function SetupReplayBoard(rboard_type,rboard_seed){

  //setup visuals
  ReplayPanel(1);

	PlayAudio2(6);

	//setting board seed
	board_seed=rboard_seed;

	if(rboard_type=='q'){
    board_type='q';
		replay_length=replay_daily_first.length-1;//amount if steps in a replay
	}else{
    board_type='f';
		replay_length=replay_weekly_first.length-1;//amount if steps in a replay
	}

  CreateReplayLevel();

	//the seed is immediately removed, so that we know it is a replay
	board_seed='';

	current_move=1;//we start with move 1, and current_move is being iterated on in BlockDrop

}

function RunReplaySimulation(){

  var block = blockGroup.getChildren();

	var stage=0;//which stage of the replay are we: selecting first block, selecting second block, or executing a move

	//a correction, just in case current_move is less than 1
	if(current_move<=0){current_move=1;}
	//and a correction in case we are beyond the last replay frame
	else if(current_move>=replay_length){
		SetupReplayBoard(current_rboard_type,current_rboard_seed);
	}

		replay_interval = setInterval(function (){



						//accessing the two necessary blocks and adding border images
						if(current_rboard_type=='q'){
              var first = block[replay_daily_first[current_move]];
              var second = block[replay_daily_second[current_move]];
						}else{
              var first = block[replay_weekly_first[current_move]];
              var second = block[replay_weekly_second[current_move]];
						}


			switch(stage){

				case 0:
          first.setFrame(30);
					PlayAudio2(6);
					stage++;
					//so that if there is a "doublelick", we skip stage 1
					if(total_blocks==1){stage++;}
				break;

				case 1:
          second.setFrame(30);
					PlayAudio2(6);
					stage++;
				break;

				case 2:
					//this has to be here so that we don't stop the replay prematurely
					if(current_move==replay_length){
						clearInterval(replay_interval);

						setTimeout(function (){SetupReplayBoard(current_rboard_type,current_rboard_seed);}, 750);

						//working the PLAY button
						replay_is_active=0;
						replay_play.setFrame(0);
						//reset the step by step stage
						replay_stage=0;
					}

          //first.setFrame(first.block_value-1);
          //second.setFrame(second.block_value-1);
					if(total_blocks==1){BlockDoubleclick(first);PlayAudio2(9);}
					else{BlockDrop(first,second);}

					stage=0;
				break;
			}

		}, 450);

}

function RunReplayStep(){

    var block = blockGroup.getChildren();

		//a correction, just in case current_move is less than 1
		if(current_move<=0){current_move=1;}


            if(current_rboard_type=='q'){
              var first = block[replay_daily_first[current_move]];
              var second = block[replay_daily_second[current_move]];
            }else{
              var first = block[replay_weekly_first[current_move]];
              var second = block[replay_weekly_second[current_move]];
            }


				switch(replay_stage){

					case 0:
						first.setFrame(30);
						PlayAudio2(6);
						replay_stage++;
						//so that if there is a "doublelick", we skip stage 1
						if(total_blocks==1){replay_stage++;}
					break;

					case 1:
						second.setFrame(30);
						PlayAudio2(6);
						replay_stage++;
					break;

					case 2:

            //first.setFrame(first.block_value-1);
            //second.setFrame(second.block_value-1);
						if(total_blocks==1){BlockDoubleclick(first);PlayAudio2(9);}
						else{BlockDrop(first,second);}

						replay_stage=0;
					break;
				}

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
