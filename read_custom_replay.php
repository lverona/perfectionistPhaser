<?php

/*
*
*
* Getting a given board's solution
*
*
*/

$debug=0;
error_reporting(0);
require_once('mfunctions.php');

if($debug>0){
  $_POST['board_seed']=1180816849;
  $_POST['board_type']='q';
}

if($_POST){

  if(is_numeric($_POST['board_seed']) && $_POST['board_seed']>0 && $_POST['board_seed']<=2147483647) {$board_seed=$_POST['board_seed'];} else exit();

  //getting the board type and the corresponding date - either a day or a week
  $board_type=filter_var($_POST['board_type'],FILTER_SANITIZE_STRING);
    if($board_type=='q'){
      $board_type=1;
      $date=date("z");//0-365
    }
      elseif($board_type=='f'){
        $board_type=2;
        $date=date("W");//1-52
      }
        else{exit();}

}
else {exit();}

$year=date("o");



//this query get a daily or a weekly board seed
$checkQuery = dbGetData ( $dbLink,'SELECT seed FROM periodicals WHERE year='.$year.' AND date='.$date );
        //we then compare this seed with the daily, and if they are the same, the script exits
        if($checkQuery['seed']==$board_seed){exit();}

        //Getting the replay
        if( $selectQuery = dbGetData ( $dbLink,'SELECT undo_id_one, undo_id_two FROM wild_boards WHERE seed='.$board_seed ) ){

          $result[0]=$selectQuery['undo_id_one'];
          $result[1]=$selectQuery['undo_id_two'];

        }


        echo json_encode($result);

?>
