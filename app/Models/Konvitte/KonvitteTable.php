<?php

namespace App\Models\Konvitte;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['konvitte_invitation_id', 'name'])]
class KonvitteTable extends Model
{

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(KonvitteInvitation::class, 'konvitte_invitation_id');
    }

    public function guests(): HasMany
    {
        return $this->hasMany(KonvitteGuest::class);
    }
}
