<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        Permission::updateOrCreate([
            'scope' => 'konvitte',
            'resource' => 'event',
            'action' => 'create',
        ], [
            'name' => 'Criar evento',
        ]);
    }
}
