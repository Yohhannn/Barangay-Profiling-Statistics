<?php

use Aws\Rekognition\RekognitionClient;

class AwsFaceRecog{

    public static function getClient(){
        $client = new RekognitionClient([
            'version' => 'latest',
            'region'  => env('AWS_DEFAULT_REGION'),
            'credentials' => [
                'key'    => env('AWS_ACCESS_KEY_ID'),
                'secret' => env('AWS_SECRET_ACCESS_KEY'),
            ],
        ]);
        return $client;
    }
}