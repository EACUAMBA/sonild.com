<?php

use App\Models\Konvitte\KonvitteGuestRsvp;
use App\Models\Konvitte\KonvitteInvitation;
use App\Models\Konvitte\KonvitteInviteType;
use Illuminate\Database\QueryException;

beforeEach(function () {
    $type = KonvitteInviteType::firstOrCreate(['code' => 'CASAMENTO'], ['name' => 'Casamento']);
    $this->invitation = KonvitteInvitation::create([
        'konvitte_invite_type_id' => $type->id,
        'groom_name' => 'João', 'bride_name' => 'Ana',
        'event_date' => '2027-06-26 15:00:00', 'venue' => 'Maputo',
    ]);
    $this->guest = $this->invitation->guests()->create(['name' => 'Maria', 'max_guests' => 2]);
});

it('stores and updates one RSVP per guest and preserves it when changing tables', function () {
    $rsvp = $this->guest->rsvp()->create(['status' => 'CONFIRMED', 'message' => 'Estaremos presentes!']);
    expect($rsvp->guest->id)->toBe($this->guest->id)
        ->and($this->guest->fresh()->rsvp->message)->toBe('Estaremos presentes!');
    $this->guest->rsvp()->updateOrCreate([], ['status' => 'DECLINED', 'message' => 'Não poderemos ir.']);
    $table = $this->invitation->tables()->create(['name' => 'Família', 'capacity' => 8]);
    $this->guest->update(['konvitte_table_id' => $table->id]);
    expect(KonvitteGuestRsvp::count())->toBe(1)
        ->and($rsvp->fresh()->status)->toBe('DECLINED')
        ->and($rsvp->fresh()->message)->toBe('Não poderemos ir.')
        ->and($rsvp->created_at)->not->toBeNull();
});

it('allows a response without a message and removes it when the guest is deleted', function () {
    $rsvp = $this->guest->rsvp()->create([])->fresh();
    expect($rsvp->status)->toBe('PENDING')->and($rsvp->message)->toBeNull();
    $this->guest->delete();
    expect(KonvitteGuestRsvp::count())->toBe(0);
});

it('enforces one response per guest in the database', function () {
    $this->guest->rsvp()->create(['status' => 'CONFIRMED']);
    expect(fn() => $this->guest->rsvp()->create(['status' => 'DECLINED']))->toThrow(QueryException::class);
});

it('requires an existing guest', function () {
    expect(fn() => KonvitteGuestRsvp::create(['konvitte_guest_id' => 999999, 'status' => 'PENDING']))->toThrow(QueryException::class);
});
