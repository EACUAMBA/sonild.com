<?php

namespace App\Models\Konvitte;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'code'])]
class KonvitteInviteType extends Model
{
    /** @return HasMany<KonvitteInvitation, $this> */
    public function invitations(): HasMany
    {
        return $this->hasMany(KonvitteInvitation::class);
    }
}
