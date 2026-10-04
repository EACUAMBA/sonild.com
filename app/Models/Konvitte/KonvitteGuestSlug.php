<?php

namespace App\Models\Konvitte;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['konvitte_guest_id', 'slug'])]
class KonvitteGuestSlug extends Model
{
    public function guest(): BelongsTo
    {
        return $this->belongsTo(KonvitteGuest::class, 'konvitte_guest_id');
    }
}
