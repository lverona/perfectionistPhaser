<?php

// MySQL params
define('DB_HOST','localhost');
define('DB_NAME','perfectionist');
define('DB_USER','root');
define('DB_PWD','');
//define('DB_PWD','scXhVwrR3cA9unn6');
define('DEBUG_LEVEL',0);



//-----------------------------------------------------------------------------------MySQL stuff

function dbConnect($db_host, $db_user, $db_pass, $db_name) {

	$db_connect = mysqli_connect($db_host, $db_user, $db_pass, $db_name);

	// Check connection
if (mysqli_connect_errno())
  {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
  }
}




function dbQuery($dbLink,$query) {

	if (DEBUG_LEVEL >=3) echo $query.'<br>';

	$result = mysqli_query($dbLink,$query);
	if (!$result) {
	if (DEBUG_LEVEL >=4) echo mysqli_error().'<br>';
		return false;
	} else {
		return $result;
	}
}


function dbGetData($dbLink,$query) {
	$result = array();
	$executedQry = dbQuery($dbLink,$query);

	$result = mysqli_fetch_assoc($executedQry);
		if (!$result) { return false; }
		else { return $result;}
}



// Connect & change client encoding to proper
//$dbLink = dbConnect(DB_HOST,DB_USER,DB_PWD,DB_NAME);

$dbLink = mysqli_connect(DB_HOST, DB_USER, DB_PWD, DB_NAME);

// Check connection
if (mysqli_connect_errno())
{
echo "Failed to connect to MySQL: " . mysqli_connect_error();
}

//dbQuery($dbLink,"SET NAMES 'utf8'");




?>
