<?php

namespace App\Models\Konvitte;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['konvitte_invitation_id', 'konvitte_table_id', 'name', 'max_guests', 'not_extended_to_children'])]
class KonvitteGuest extends Model
{

    protected function casts(): array
    {
        return ['not_extended_to_children' => 'boolean'];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(KonvitteInvitation::class, 'konvitte_invitation_id');
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(KonvitteTable::class, 'konvitte_table_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(KonvitteMessage::class);
    }

    public function rsvp(): HasOne
    {
        return $this->hasOne(KonvitteGuestRsvp::class, 'konvitte_guest_id');
    }

    public function slug(): HasOne
    {
        return $this->hasOne(KonvitteGuestSlug::class);
    }
}
