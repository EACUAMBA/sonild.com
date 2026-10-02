<?php

namespace App\Models\Konvitte;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['konvitte_convite_convidado_id', 'slug'])]
class KonvitteConviteGuestSlug extends Model
{
    /** @return BelongsTo<KonvitteConviteConvidado, $this> */
    public function convidado(): BelongsTo
    {
        return $this->belongsTo(KonvitteConviteConvidado::class, 'konvitte_convite_convidado_id');
    }
}
