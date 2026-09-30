<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

abstract class AclPolicy
{
    protected string $resource;

    public function view(User $user, Model $record): bool
    {
        return $this->viewAny($user);
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('backoffice', 'ACL', $this->resource, 'read');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('backoffice', 'ACL', $this->resource, 'create');
    }

    public function update(User $user, Model $record): bool
    {
        return $user->hasPermission('backoffice', 'ACL', $this->resource, 'update');
    }

    public function delete(User $user, Model $record): bool
    {
        return $user->hasPermission('backoffice', 'ACL', $this->resource, 'delete');
    }

    public function deleteAny(User $user): bool
    {
        return $user->hasPermission('backoffice', 'ACL', $this->resource, 'delete');
    }
}
