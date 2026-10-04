<?php

namespace App\Models\Konvitte;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['konvitte_invitation_id', 'name', 'phone', 'email', 'sort_order'])]
class KonvitteContact extends Model
{
    public function invitation(): BelongsTo
    {
        return $this->belongsTo(KonvitteInvitation::class, 'konvitte_invitation_id');
    }
}
