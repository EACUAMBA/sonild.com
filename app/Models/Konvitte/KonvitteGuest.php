<?php

namespace App\Models\Konvitte;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['konvitte_invitation_id', 'konvitte_table_id', 'name', 'max_guests'])]
class KonvitteGuest extends Model
{

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(KonvitteInvitation::class, 'konvitte_invitation_id');
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(KonvitteTable::class, 'konvitte_table_id');
    }

    public function slug(): HasOne
    {
        return $this->hasOne(KonvitteGuestSlug::class);
    }
}
