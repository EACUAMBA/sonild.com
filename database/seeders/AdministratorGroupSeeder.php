<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\User;
use App\Models\UserGroup;
use Illuminate\Database\Seeder;

class AdministratorGroupSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(PermissionSeeder::class);

        $group = UserGroup::firstOrCreate(
            ['code' => 'ADMINISTRADORES'],
            ['name' => 'Administradores'],
        );

        $group->permissions()->syncWithoutDetaching(
            Permission::where('scope', 'backoffice')->where('module', 'ACL')->pluck('id'),
        );

        $group->permissions()->syncWithoutDetaching(
            Permission::where('scope', 'konvitte')->where('module', 'Eventos')->where('resource', 'event')->pluck('id'),
        );

        User::where('email', 'admin@sonild.com')->first()?->userGroups()
            ->syncWithoutDetaching([$group->getKey()]);
    }
}
