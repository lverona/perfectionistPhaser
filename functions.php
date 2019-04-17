<?php

function quote_smart($value = "", $nullify = false, $conn = null) {
  //reset default if second parameter is skipped
  $nullify = ($nullify === null) ? (false) : ($nullify);
  //undo slashes for poorly configured servers
  $value = (get_magic_quotes_gpc()) ? (stripslashes($value)) : ($value);

  //check for null/unset/empty strings (takes advantage of short-circuit evals to avoid a warning)
  if ((!isset($value)) || (is_null($value)) || ($value === "")) {
    $value = ($nullify) ? ("NULL") : ("''");
  }
  else {
    if (is_string($value)) {
      //value is a string and should be quoted; determine best method based on available extensions
      if (function_exists('mysql_real_escape_string')) {
        $value = "'" . (((isset($conn)) && (is_resource($conn))) ? (mysql_real_escape_string($value, $conn)) : (mysql_real_escape_string($value))) . "'";
      }
      else {
        $value = "'" . mysql_escape_string($value) . "'";
      }
    }
    else {
      //value is not a string; if not numeric, bail with error
      $value = (is_numeric($value)) ? ($value) : ("'ERROR: unhandled datatype in quote_smart'");
    }
  }
  return $value;
}

?>
