<?php

namespace App\Models\Eventtu;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Fillable(['name', 'code'])]
class EventtuEventType extends Model
{
    public function setNameAttribute(string $value): void
    {
        $this->attributes['name'] = $value;
        $this->attributes['code'] ??= Str::upper(Str::slug($value, '_'));
    }

    /** @return HasMany<EventtuEvento, $this> */
    public function eventos(): HasMany
    {
        return $this->hasMany(EventtuEvento::class);
    }
}
