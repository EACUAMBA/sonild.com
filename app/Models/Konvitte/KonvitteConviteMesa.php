<?php

namespace App\Models\Konvitte;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['konvitte_convite_id', 'nome'])]
class KonvitteConviteMesa extends Model
{
    /** @return BelongsTo<KonvitteConvite, $this> */
    public function convite(): BelongsTo
    {
        return $this->belongsTo(KonvitteConvite::class, 'konvitte_convite_id');
    }

    /** @return HasMany<KonvitteConviteConvidado, $this> */
    public function convidados(): HasMany
    {
        return $this->hasMany(KonvitteConviteConvidado::class);
    }
}
