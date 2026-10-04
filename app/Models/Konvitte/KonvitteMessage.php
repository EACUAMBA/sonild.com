<?php

namespace App\Models\Konvitte;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['konvitte_invitation_id', 'konvitte_guest_id', 'text'])]
class KonvitteMessage extends Model
{
    public function invitation(): BelongsTo
    {
        return $this->belongsTo(KonvitteInvitation::class, 'konvitte_invitation_id');
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(KonvitteGuest::class, 'konvitte_guest_id');
    }
}
