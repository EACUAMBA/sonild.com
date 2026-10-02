<?php

namespace App\Models\Konvitte;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'code'])]
class KonvitteInviteType extends Model
{
    /** @return HasMany<KonvitteConvite, $this> */
    public function convites(): HasMany
    {
        return $this->hasMany(KonvitteConvite::class);
    }
}
