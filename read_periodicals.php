<?php

//The script reads daily and weekly boards or generates new ones

$debug=0;
error_reporting(0);
require_once('mfunctions.php');

$year=date("o");



//////////////////////
//DAILY BOARD
//////////////////////

//if( date("N")!=5 ){//if it is not a Friday

  $date=date("z");//0-365

  //if daily board seed exists, just print it
  if( $selectQuery = dbGetData ( $dbLink,'SELECT seed FROM periodicals WHERE date='.$date.' AND type=1 AND year='.$year ) ){
    //echo $selectQuery['seed'];
    $result[0]=$selectQuery['seed'];
    //echo $result;

  }
  //if daily board seed does not exist, generate it
  else{

    $board_seed=mt_rand(1,2147483647);

    $insertQuery = dbQuery( $dbLink, "INSERT INTO periodicals VALUES('$board_seed','1','$date','$year')");

    //retrieving newly generated seed from the database
    $selectQuery = dbGetData ( $dbLink,'SELECT seed FROM periodicals WHERE date='.$date.' AND type=1 AND year='.$year );

    $result[0]=$selectQuery['seed'];

  }

//}
//else{//if it is Friday
//  $result[0]="-999";
//}


//////////////////////
//WEEKLY BOARD
//////////////////////

//if( date("W") % 4 !=0 ){//if the week number not a multiple of 4

  $date=date("W");//1-52

  //if weekly board seed exists, just print it
  if( $selectQuery = dbGetData ( $dbLink,'SELECT seed FROM periodicals WHERE date='.$date.' AND type=2 AND year='.$year ) ){
    //echo $selectQuery['seed'];
    $result[1]=$selectQuery['seed'];
    //echo $result;

  }
  //if weekly board seed does not exist, generate it
  else{

    $board_seed=mt_rand(1,2147483647);

    $insertQuery = dbQuery( $dbLink, "INSERT INTO periodicals VALUES('$board_seed','2','$date','$year')");

    //retrieving newly generated seed from the database
    $selectQuery = dbGetData ( $dbLink,'SELECT seed FROM periodicals WHERE date='.$date.' AND type=2 AND year='.$year );

    $result[1]=$selectQuery['seed'];

  }

//}
//else{//if the week is a multiple of 4
//  $result[1]="-999";
//}



//result 0 - daily board seed
//result 1 - weekly board seed
//result 2 - date string in the form of "Sunday, March 31st"
//result 3 - week number
//result 4 - day number

//for testing
//$result[1]="-999";
  $result[2]=date("l, F dS");
  $result[3]=date("W");
  $result[4]=date("z");

echo json_encode($result);


?>
