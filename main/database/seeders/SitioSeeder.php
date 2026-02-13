<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SitioSeeder extends Seeder
{
    public function run(): void
    {
        $sitios = [
            'Cadulang 1', 'Cadulang 2', 'Cambiohan', 'Chocolate Hills',
            'Hawaiian 1', 'Hawaiian 2', 'Ibabao', 'Ikaseg',
            'Kaisid', 'Kalubihan', 'Kolo', 'Likoan',
            'Limogmog', 'Mahayag', 'Marbeach', 'Marigondon Proper',
            'Masiwa', 'Matab-ang', 'Osflor', 'San Carlos',
            'St. Joseph', 'Sto. Kristo', 'Sto. Niño', 'Tabay Mabao',
            'Villa Verna', 'Whitefox', 'Ylacir', 'Ylaya',
        ];

        $data = [];
        foreach ($sitios as $sitio) {
            $data[] = [
                'sitio_name' => $sitio,
                // Uncomment the line below if your table has timestamps
                // 'created_at' => now(), 'updated_at' => now(),
            ];
        }

        DB::table('sitios')->insert($data);
    }
}
