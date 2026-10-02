<?php

namespace App\Models\Konvitte;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['konvitte_convite_id', 'konvitte_convite_mesa_id', 'nome', 'numero_maximo_convidados'])]
class KonvitteConviteConvidado extends Model
{
    /** @return BelongsTo<KonvitteConvite, $this> */
    public function convite(): BelongsTo
    {
        return $this->belongsTo(KonvitteConvite::class, 'konvitte_convite_id');
    }

    /** @return BelongsTo<KonvitteConviteMesa, $this> */
    public function mesa(): BelongsTo
    {
        return $this->belongsTo(KonvitteConviteMesa::class, 'konvitte_convite_mesa_id');
    }

    /** @return HasOne<KonvitteConviteGuestSlug, $this> */
    public function slug(): HasOne
    {
        return $this->hasOne(KonvitteConviteGuestSlug::class, 'konvitte_convite_convidado_id');
    }
}
