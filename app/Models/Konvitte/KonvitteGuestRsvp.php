<?php

namespace App\Models\Konvitte;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['konvitte_guest_id', 'status', 'message'])]
class KonvitteGuestRsvp extends Model
{
    protected $table = 'konvitte_guest_rsvps';

    public function guest(): BelongsTo
    {
        return $this->belongsTo(KonvitteGuest::class, 'konvitte_guest_id');
    }
}
