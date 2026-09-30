<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(UserGroupSeeder::class);

        User::updateOrCreate([
            'email' => 'admin@sonild.com',
        ], [
            'name' => 'Administrator',
            'password' => 'password',
            'email_verified_at' => now(),
        ]);
    }
}
