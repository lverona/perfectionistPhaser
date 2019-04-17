<?php


function getFridaysInRange($dateFromString, $dateToString)
{
    $dateFrom = new DateTime($dateFromString);
    $dateTo = new DateTime($dateToString);
    $dates = [];

    if ($dateFrom > $dateTo) {
        return $dates;
    }

    if (1 != $dateFrom->format('N')) {
        $dateFrom->modify('next friday');
    }

    while ($dateFrom <= $dateTo) {
        //$dates[] = $dateFrom->format('z');
        echo $dateFrom->format('Y-m-d')." - ";
        echo $dateFrom->format('z')."<br>";
        $dateFrom->modify('+1 week');
    }

    //return $dates;
}

$dates=getFridaysInRange('2019-01-01','2020-01-01');

//print_r($dates);

echo "<br><br>";

echo date("z");



?>
