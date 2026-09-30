<?php

namespace App\Policies;

use App\Models\Permission;
use App\Models\User;

class PermissionPolicy
{
    public function view(User $user, Permission $permission): bool
    {
        return $this->viewAny($user);
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('backoffice', 'ACL', 'permission', 'read');
    }
}
