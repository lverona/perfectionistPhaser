<?php

/*
*
*
* Getting yesterday's board solutions
*
*
*/


error_reporting(0);

require_once('mfunctions.php');

$year=date("o");

$today=date("z");//0-365
$yesterday=$today-1;
if($yesterday<0 && date("L")) {$yesterday=365; $year=$year-1;}
elseif($yesterday<0 && !date("L")) {$yesterday=364; $year=$year-1;}

$current_week=date("W");//1-52
$previous_week=$current_week-1;
if($current_week<0) {$current_week=52; $year=$year-1;}


//YESTERDAY'S BOARD

$board_type=1;

//getting the seed o the daily board
if( $selectQuery = dbGetData ( $dbLink,'SELECT seed FROM periodicals WHERE date='.$yesterday.' AND type='.$board_type.' AND year='.$year ) ){

  $seed=$selectQuery['seed'];

  //Getting the replay itself
  if( $selectQuery = dbGetData ( $dbLink,'SELECT undo_id_one, undo_id_two FROM wild_boards WHERE seed='.$seed.' AND type='.$board_type ) ){

    $result[0]=$selectQuery['undo_id_one'];
    $result[1]=$selectQuery['undo_id_two'];
    $result[2]=$seed;

  }

}


//PREVIOUS WEEK'S BOARD

$board_type=2;

//getting the seed o the daily board
if( $selectQuery = dbGetData ( $dbLink,'SELECT seed FROM periodicals WHERE date='.$previous_week.' AND type='.$board_type.' AND year='.$year ) ){

  $seed=$selectQuery['seed'];

  //Getting the replay itself
  if( $selectQuery = dbGetData ( $dbLink,'SELECT undo_id_one, undo_id_two FROM wild_boards WHERE seed='.$seed.' AND type='.$board_type ) ){

    $result[3]=$selectQuery['undo_id_one'];
    $result[4]=$selectQuery['undo_id_two'];
    $result[5]=$seed;


  }

}

  echo json_encode($result);

?>
