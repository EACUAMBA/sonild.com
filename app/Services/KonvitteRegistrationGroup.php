<?php

namespace App\Services;

use App\Models\Permission;
use App\Models\UserGroup;

class KonvitteRegistrationGroup
{
    public static function ensure(): UserGroup
    {
        $group = UserGroup::firstOrCreate(['code' => UserGroup::codeFromName('Administrador de Konvitte')], ['name' => 'Administrador de Konvitte']);
        $permission = Permission::firstOrCreate(['scope' => 'konvitte', 'resource' => 'invitation', 'action' => 'manage'], ['name' => 'Gerir os próprios convites', 'module' => 'Konvitte']);
        $group->permissions()->sync([$permission->id]);
        return $group;
    }
}
