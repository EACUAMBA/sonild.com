<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $scope
 * @property string $resource
 * @property string $action
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'scope', 'resource', 'action'])]
class Permission extends Model
{
    /** @return BelongsToMany<UserGroup, $this> */
    public function userGroups(): BelongsToMany
    {
        return $this->belongsToMany(UserGroup::class, 'usergroup_permission', 'permission_id', 'usergroup_id');
    }
}
