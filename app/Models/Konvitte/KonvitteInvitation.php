<?php

namespace App\Models\Konvitte;

use App\Models\File;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['konvitte_invite_type_id', 'bride_name', 'groom_name', 'groom_father_name', 'groom_mother_name', 'bride_father_name', 'bride_mother_name', 'event_date', 'venue', 'google_maps_link', 'bible_text', 'bible_reference', 'couple_text', 'celebration_text', 'instructions', 'rsvp_enabled', 'music_title', 'music_artist'])]
class KonvitteInvitation extends Model
{

    public function inviteType(): BelongsTo
    {
        return $this->belongsTo(KonvitteInviteType::class, 'konvitte_invite_type_id');
    }

    public function programItems(): HasMany
    {
        return $this->hasMany(KonvitteProgramItem::class)->orderBy('sort_order');
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(KonvitteContact::class)->orderBy('sort_order');
    }

    public function slug(): HasOne
    {
        return $this->hasOne(KonvitteInvitationSlug::class);
    }

    public function tables(): HasMany
    {
        return $this->hasMany(KonvitteTable::class)->orderBy('name');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(KonvitteMessage::class);
    }

    public function guests(): HasMany
    {
        return $this->hasMany(KonvitteGuest::class)->latest();
    }

    public function gallery(): BelongsToMany
    {
        return $this->files()->wherePivot('role', 'gallery')->orderByPivot('sort_order')->orderBy('files.id');
    }

    public function files(): BelongsToMany
    {
        return $this->belongsToMany(File::class, 'konvitte_invitation_file')->withPivot(['role', 'sort_order'])->withTimestamps();
    }

    public function fileFor(string $role): ?File
    {
        return $this->files->first(fn(File $file) => $file->pivot->role === $role);
    }

    protected function casts(): array
    {
        return ['event_date' => 'datetime', 'rsvp_enabled' => 'boolean'];
    }
}
