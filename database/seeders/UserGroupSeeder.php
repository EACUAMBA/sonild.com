<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\UserGroup;
use Illuminate\Database\Seeder;

class UserGroupSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(PermissionSeeder::class);

        $group = UserGroup::firstOrCreate(
            ['code' => UserGroup::codeFromName('Organizadores de eventos')],
            ['name' => 'Organizadores de eventos'],
        );

        $permission = Permission::query()
            ->where('scope', 'konvitte')
            ->where('resource', 'event')
            ->where('action', 'create')
            ->firstOrFail();

        $group->permissions()->syncWithoutDetaching([$permission->getKey()]);
    }
}
