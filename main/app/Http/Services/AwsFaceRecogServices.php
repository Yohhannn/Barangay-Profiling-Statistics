<?php

use App\Http\instances\AWSFaceRecog;
use App\Http\Services\ServiceLimiting;

class AwsFaceRecogServices{

    protected $client;

    public function __construct(){
        $this->client = AwsFaceRecog::getClient();
    }

    public function detectFaces($imageBytes){
        $result = $this->client->detectFaces([
            'Attributes' => ['ALL'],
            'Image' => [
                'Bytes' => $imageBytes,
            ],
        ]);
        return $result;
    }

    public function indexFaces($ctz_id, $imageBytes){
        ServiceLimiting::limitService('indexFaces', $ctz_id);
        $result = $this->client->indexFaces([
            'CollectionId' => env('AWS_FACERECOGNITION_COLLECTION_ID'),
            'Image' => [
                'Bytes' => $imageBytes,
            ],
            'DetectionAttributes' => ['ALL'],
            'ExternalImageId' => $ctz_id,
        ]);
        return $result;
    }

    public function searchFacesByImage($ctz_id, $imageBytes){
        ServiceLimiting::limitService('searchFacesByImage', $ctz_id);
        $result = $this->client->searchFacesByImage([
            'CollectionId' => env('AWS_FACERECOGNITION_COLLECTION_ID'),
            'Image' => [
                'Bytes' => $imageBytes,
            ],
            'FaceMatchThreshold' => 90,
            'MaxFaces' => 1,
        ]);
        return $result;
    }


}