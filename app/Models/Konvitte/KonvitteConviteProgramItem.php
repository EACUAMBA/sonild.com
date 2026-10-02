<?php

namespace App\Models\Konvitte;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['konvitte_convite_id', 'hora', 'nome', 'localizacao', 'google_maps_link', 'icon', 'ordem'])]
class KonvitteConviteProgramItem extends Model
{
    /** @return BelongsTo<KonvitteConvite, $this> */
    public function convite(): BelongsTo
    {
        return $this->belongsTo(KonvitteConvite::class, 'konvitte_convite_id');
    }
}
