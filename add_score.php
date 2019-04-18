<?php

//SEEDED RANDOM NUMBER GENERATOR
//https://stackoverflow.com/a/26733157 this explains how we convert the mt_srand
//into the equivalent of javascript's random method and why we should add +1
//All of this is necessary so that we can build identical boards from a seed on
//the backend
//$num = floor( (mt_rand() / (mt_getrandmax() + 1) ) *15 );

$debug=0;
//error_reporting(0);
require_once('mfunctions.php');

if($debug>0){

$_POST['board_seed']=939220089;
$_POST['board_type']='q';
$_POST['lost']=42;

$_POST['undo_id_one'] = array('',0,32,33,39,26,25,23,18,13,7,14,12,8,34,35,30,36,42,10,16,21,5,4,3,9,2,29,17,44,46,11);

$_POST['undo_id_two'] = array('',1,33,31,26,38,27,18,19,37,7,12,15,20,35,30,24,42,6,16,21,22,4,28,9,45,2,29,44,41,11);

}

if($_POST){

  if(is_numeric($_POST['board_seed']) && $_POST['board_seed']>0 && $_POST['board_seed']<=2147483647) {$board_seed=$_POST['board_seed'];} else exit();

  if(is_numeric($_POST['lost']) && $_POST['lost']>=0) $lost=$_POST['lost']; else exit();

  $board_type=filter_var($_POST['board_type'],FILTER_SANITIZE_STRING);
    if($board_type=='q'){
      $board_type=1;
      $rows=8;
      $columns=6;
    }
      elseif($board_type=='f'){
        $board_type=2;
        $rows=11;
        $columns=9;
      }
        else{exit();}

    //decode first
    $_POST['undo_id_one'] = json_decode($_POST['undo_id_one'], true);
    $_POST['undo_id_two'] = json_decode($_POST['undo_id_two'], true);

  $undo_id_one=filter_var_array($_POST['undo_id_one'],FILTER_SANITIZE_STRING);
    if(count($undo_id_one)==0) exit();
      $undo_id_one_encoded=json_encode($undo_id_one);

  $undo_id_two=filter_var_array($_POST['undo_id_two'],FILTER_SANITIZE_STRING);
    if(count($undo_id_two)==0) exit();
      $undo_id_two_encoded=json_encode($undo_id_two);

  $player_id=0;

  $today=date("Ymd");

}
else {exit();}


if($debug==0){

if( !$selectQuery = dbGetData ( $dbLink,'SELECT seed, lost FROM wild_boards WHERE seed='.$board_seed.' AND type='.$board_type ) ){

  //if replay fails, script exits
  ReplayBoard($board_seed,$rows,$columns,$undo_id_one,$undo_id_two,$lost);

  $insertQuery = dbQuery( $dbLink, "INSERT INTO wild_boards VALUES('$board_seed','$board_type','$lost','$undo_id_one_encoded','$undo_id_two_encoded','$player_id','$today')");

  //retrieving the lost score from the database
  $selectQuery = dbGetData( $dbLink, 'SELECT lost FROM wild_boards WHERE seed='.$board_seed.' AND type='.$board_type );

  echo $selectQuery['lost'];

}

else{//if the record already exists
  $prev_lost=$selectQuery['lost'];
  //echo 'Previous score';
    if($lost>=$prev_lost) {exit();}
      else{//update lost score if it is smaller

        //if replay fails, script exits
        ReplayBoard($board_seed,$rows,$columns,$undo_id_one,$undo_id_two,$lost);

        $updateQuery=dbQuery( $dbLink, "UPDATE wild_boards SET lost=$lost, date=$today, player=$player_id, undo_id_one='$undo_id_one_encoded', undo_id_two='$undo_id_two_encoded' WHERE seed=$board_seed AND type=$board_type");

        //retrieving the lost score from the database
        $selectQuery = dbGetData( $dbLink, 'SELECT lost FROM wild_boards WHERE seed='.$board_seed.' AND type='.$board_type );
        echo $selectQuery['lost'];
      }
}

}//if debug==0, so that during debug we don't do database stuff and vice versa

if($debug){
  ReplayBoard($board_seed,$rows,$columns,$undo_id_one,$undo_id_two,$lost,$debug);
}


function ReplayBoard($board_seed,$rows,$columns,$undo_id_one,$undo_id_two,$lost,$debug=0){

  //seeding the RNG
  mt_srand($board_seed);
  //echo $board_seed."<br>";

  $i=0;//id of the replay (game loop frames)

  //main variables
  $total_blocks=$rows*$columns;//total blocks on the board
  $burn=0;//lost score we are building to compare with the player's

  //building a board
  for ($y = 0; $y < $rows; $y++) {
    for ($x = 0; $x < $columns; $x++) {

      $value = floor( (mt_rand() / (mt_getrandmax() + 1) ) *15 );

            //echo '&nbsp;-'.($value+1).'-&nbsp;';
            $block_values[$i]=$value+1;
            $block_ids[$i]=$i;
            $i++;

          }//x

          //echo '<br>';

      }//y

      //game loop
      $num_of_moves=count($undo_id_one);
      for($i = 1; $i < $num_of_moves; $i++){

        if($total_blocks==1){//if only one block is left, then we simply calculate the doubleclick
          $id_one=$undo_id_one[$i];
          $one=$block_values[$id_one];
          $burn+=$one;
          $total_blocks-=1;
          if ($debug>0) echo $one.'-'.$one.'<br>';
          break;
        }

        $id_one=$undo_id_one[$i];
        $id_two=$undo_id_two[$i];
          $one=$block_values[$id_one];
          $two=$block_values[$id_two];


        //returns true if checks below don't fail
        $check=true;

        //CheckDrop
        //IF ON THE SAME ROW
        if(abs($id_one-$id_two)<$columns){
          if($id_one>$id_two){
      			$diff=$id_one-$id_two;
      			for ($n = 1; $n < $diff; $n++) {//taking all the elements in between
      				$num=$block_values[$id_two+$n];
      				if($num!=0) $check=false;
      				}
      			}//if one > two
      			else{
      			$diff=$id_two-$id_one;
      			for ($n = 1; $n < $diff; $n++) {//taking all the elements in between
      				$num=$block_values[$id_one+$n];
      				if($num!=0) $check=false;
      				}
      				}//if one > two (else)
        }
        //IF ON THE SAME COLUMN
        elseif((abs($id_one-$id_two))%$columns==0){
                if($id_one>$id_two){
                  $diff=($id_one-$id_two)/$columns;
                  for ($n = 1; $n < $diff; $n++) {//taking all elements in between
                    $num=$block_values[$id_two+$n*$columns];
                    if($num!=0) $check=false;
                    }
                  }//if one > two
                  else{
                  $diff=($id_two-$id_one)/$columns;
                  for ($n = 1; $n < $diff; $n++) {//taking all elements in between
                    $num=$block_values[$id_one+$n*$columns];
                    if($num!=0) $check=false;
                    }
                    }//if one > two (else)
          }//else if one_col==two_col

        //IF NEITHER ROWS NOT COLUMNS MATCH
        else{$check=false;}


				if($one==1 || $check || $total_blocks<11){//if the move is legal

  				if($one==$two){

  				$total_blocks-=2;

  				$block_values[$id_one]=0;
          $block_values[$id_two]=0;

  					}//if(one==two)
  			else{//subtracting

  			$total_blocks-=1;

  			$new_index=abs($one-$two);

  			if($one<$two){ $burn+=$one; }
  			else{ $burn+=$two; }

        //removing block 1 and changing the value of block 2
				$block_values[$id_one]=0;
				$block_values[$id_two]=$new_index;
				}
			}//if check
			else{//if the move is illegal, we halt the whole script

        if ($debug==2) echo 'Error: Illegal move.';
        exit();

				}

        if ($debug>0) echo $one.'-'.$two.'<br>';

      }//game loop end

      if ($debug>0) echo '<u>Total blocks: '.$total_blocks.'</u><br>';

      if ($debug>0) echo '<br>Lost: '.$burn.'<br>';
      if($burn!=$lost){
        if ($debug>1) echo '<b>Error</b>: Replay lost score doesn\'t match.';
        exit();
      }else{
        if ($debug>1) echo '<b>Pass</b>: Replay lost score matches.<br>';
      }

      if ($debug>1) echo '<b>Pass</b>: No illegal moves.<br>';

      if($total_blocks>0){
        if ($debug>1) echo '<b>Error</b>: Total blocks are not 0.<br>';
        exit();
      }else{
        if ($debug>1) echo '<b>Pass</b>: Total blocks are 0.<br>';
      }

        if ($debug>1) echo '<b>Pass for all checks.</b>';

}//Replay function















?>
