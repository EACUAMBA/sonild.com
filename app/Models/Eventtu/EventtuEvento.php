<?php

namespace App\Models\Eventtu;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['nome', 'data', 'eventtu_event_type_id'])]
class EventtuEvento extends Model
{
    /** @return BelongsTo<EventtuEventType, $this> */
    public function eventType(): BelongsTo
    {
        return $this->belongsTo(EventtuEventType::class, 'eventtu_event_type_id');
    }

    protected function casts(): array
    {
        return ['data' => 'datetime'];
    }
}
