<?php

//The script reads daily and weekly boards or generates new ones

$debug=0;
//error_reporting(0);
require_once('mfunctions.php');

$year=date("o");

//Generating a board seed in a recursive manner to make sure that if we stumble upon an already existing board seed in the periodicals table, we go for a new one
function GeneratingBoardSeed($dbLink,$date,$year,$board_type,$tries=5){
  //so that we don't go into an infinite recursive loop
  if($tries==0){exit('Too many recursive tries for board_type='.$board_type);}

  $board_seed=mt_rand(1,2147483647);
    //in the unlikely scenario that such a seed aready exists in the periodicals table, we re-generate the board_seed. Keep in mind, we look for a seed no matter the board type. So, although boards of different types and with the same seed would look and play quite differently, the system is not built to accomodate that (exceedingly rare) scenario
    if( $selectQuery = dbGetData ( $dbLink,'SELECT seed FROM periodicals WHERE seed='.$board_seed ) ){

      //reducing the amount of available re-tries
      $tries--;
      GeneratingBoardSeed($dbLink,$date,$year,$board_type,$tries);


    }else{
      $insertQuery = dbQuery( $dbLink, "INSERT INTO periodicals VALUES('$board_seed','$board_type','$date','$year')");

      //retrieving newly generated seed from the database
      $selectQuery = dbGetData ( $dbLink,'SELECT seed FROM periodicals WHERE date='.$date.' AND type='.$board_type.' AND year='.$year );

      return $selectQuery['seed'];
    }

}



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

    $result[0]=GeneratingBoardSeed($dbLink,$date,$year,1);

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

    $result[1]=GeneratingBoardSeed($dbLink,$date,$year,2);

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
