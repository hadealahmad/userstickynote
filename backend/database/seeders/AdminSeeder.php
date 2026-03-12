<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'hade.alahmad1@gmail.com'],
            [
                'name' => 'Hadi Al Ahmad',
                'is_admin' => true,
                'password' => null, // Google login only
            ]
        );
    }
}
