<?php

// $conn = require_once('config.php');

function randomFloat($min = 0, $max = 1) {
    return $min + mt_rand() / mt_getrandmax() * ($max - $min);
}

function makeDummyLocations() {
    $locations = [];

    for ($i = 1; $i < 5000; $i++) {
        $x = (randomFloat() + 1) * 0.088;
        $y = (randomFloat() + 1) * 0.088;
        $locations[] = [
            'lat' => 46.8182 + $x,
            'lng' => 8.2275 + (randomFloat() + 1) + $y
        ];
        $locations[] = [
            'lat' => 46.8182 + $x,
            'lng' => 7.6275 + (randomFloat() + 1) + $y
        ];
        $locations[] = [
            'lat' => 46.8182 + $x,
            'lng' => 6.6275 + (randomFloat() + 1) + $y
        ];
        $locations[] = [
            'lat' => 46.8182 + $x,
            'lng' => 5.6275 + (randomFloat() + 1) + $y
        ];
        $locations[] = [
            'lat' => 47.3182 + $x,
            'lng' => 6.6275 + (randomFloat() + 1) + $y
        ];
    }
    return $locations;
}

$locations = makeDummyLocations();
$coordinates = [];
foreach($locations as $location) {
    $coordinates[] = [
        'lat' => $location['lat'],
        'lng' => $location['lng']
    ];
}


// while ($row = $stmt->fetch()) {
    // $coordinates[] = [
        // 'lat' => (float) $row['lat'],
        // 'lng' => (float) $row['lng'],
    // ];
// }

header('Content-Type: application/json');
echo json_encode($coordinates);
