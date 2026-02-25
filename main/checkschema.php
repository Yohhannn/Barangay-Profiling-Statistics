<?php
$cols = Illuminate\Support\Facades\Schema::getColumns('citizen_informations');
foreach($cols as $col) {
    echo $col['name'] . ' => ' . $col['type_name'] . PHP_EOL;
}
