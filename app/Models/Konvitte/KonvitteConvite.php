<?php

namespace App\Models\Konvitte;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['konvitte_invite_type_id', 'nome_noiva', 'nome_noivo', 'nome_pai_noivo', 'nome_mae_noivo', 'nome_pai_noiva', 'nome_mae_noiva', 'data', 'local', 'texto_biblico', 'livro_biblico', 'foto_capa', 'foto_inicial', 'musica', 'texto_casal', 'foto_informacoes', 'texto_celebre', 'texto_orientacoes'])]
class KonvitteConvite extends Model
{
    /** @return BelongsTo<KonvitteInviteType, $this> */
    public function inviteType(): BelongsTo
    {
        return $this->belongsTo(KonvitteInviteType::class, 'konvitte_invite_type_id');
    }

    /** @return HasMany<KonvitteConviteProgramItem, $this> */
    public function programItems(): HasMany
    {
        return $this->hasMany(KonvitteConviteProgramItem::class)->orderBy('ordem');
    }

    /** @return HasMany<KonvitteConviteGallery, $this> */
    public function gallery(): HasMany
    {
        return $this->hasMany(KonvitteConviteGallery::class)->latest();
    }

    /** @return HasMany<KonvitteConviteContact, $this> */
    public function contacts(): HasMany
    {
        return $this->hasMany(KonvitteConviteContact::class)->orderBy('ordem');
    }

    /** @return HasOne<KonvitteConviteSlug, $this> */
    public function slug(): HasOne
    {
        return $this->hasOne(KonvitteConviteSlug::class, 'konvitte_convite_id');
    }

    /** @return HasMany<KonvitteConviteMesa, $this> */
    public function mesas(): HasMany
    {
        return $this->hasMany(KonvitteConviteMesa::class, 'konvitte_convite_id')->orderBy('nome');
    }

    /** @return HasMany<KonvitteConviteConvidado, $this> */
    public function convidados(): HasMany
    {
        return $this->hasMany(KonvitteConviteConvidado::class, 'konvitte_convite_id')->latest();
    }

    protected function casts(): array
    {
        return ['data' => 'datetime'];
    }
}
