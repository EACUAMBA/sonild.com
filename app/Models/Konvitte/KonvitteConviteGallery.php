<?php

namespace App\Models\Konvitte;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['konvitte_convite_id', 'path', 'original_name', 'size'])]
class KonvitteConviteGallery extends Model
{
    /** @return BelongsTo<KonvitteConvite, $this> */
    public function convite(): BelongsTo
    {
        return $this->belongsTo(KonvitteConvite::class, 'konvitte_convite_id');
    }
}
