<?php

error_reporting(0);

require_once('mfunctions.php');


if($_POST){

  if(is_numeric($_POST['board_seed']) && $_POST['board_seed']>0) $board_seed=$_POST['board_seed']; else exit();

  $board_type=filter_var($_POST['board_type'],FILTER_SANITIZE_STRING);
    if($board_type=='q'){$board_type=1;}
      elseif($board_type=='f'){$board_type=2;}
        else{exit();}

}
else {exit();}




if( $selectQuery = dbGetData ( $dbLink,'SELECT lost FROM wild_boards WHERE seed='.$board_seed.' AND type='.$board_type ) ){

  echo $selectQuery['lost'];

}

else{
  exit();
}


?>
