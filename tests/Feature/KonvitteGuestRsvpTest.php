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

it('accepts and updates public RSVP responses only while the invitation is enabled', function () {
    $this->withSession(['_token' => 'rsvp-test'])->withHeader('X-CSRF-TOKEN', 'rsvp-test');
    $this->invitation->slug()->create(['slug' => 'rsvp-wedding']);
    $this->guest->slug()->create(['slug' => 'maria']);
    $url = '/konvitte/rsvp-wedding/maria/rsvp';
    $this->post($url, ['status' => 'CONFIRMED'])->assertForbidden();
    $this->invitation->update(['rsvp_enabled' => true]);
    $this->get('/konvitte/rsvp-wedding/maria')->assertOk()->assertInertia(fn($page) => $page
        ->where('invitationData.rsvpEnabled', true)->where('invitationData.rsvpUrl', $url)->where('invitationData.rsvp', null));
    $this->post($url, ['status' => 'CONFIRMED', 'message' => 'Estaremos presentes!'])->assertSessionHasNoErrors()->assertRedirect('/konvitte/rsvp-wedding/maria');
    $this->post($url, ['status' => 'DECLINED', 'message' => 'Não poderemos ir.'])->assertSessionHasNoErrors();
    expect(KonvitteGuestRsvp::count())->toBe(1)->and($this->guest->fresh()->rsvp->status)->toBe('DECLINED');
    $this->get('/konvitte/rsvp-wedding/maria')->assertInertia(fn($page) => $page->where('invitationData.rsvp.message', 'Não poderemos ir.'));
    $this->invitation->update(['rsvp_enabled' => false]);
    $this->post($url, ['status' => 'CONFIRMED'])->assertForbidden();
    expect($this->guest->fresh()->rsvp->status)->toBe('DECLINED');
});

it('validates public responses and does not expose or accept another guests RSVP', function () {
    $this->withSession(['_token' => 'rsvp-test'])->withHeader('X-CSRF-TOKEN', 'rsvp-test');
    $this->invitation->update(['rsvp_enabled' => true]);
    $this->invitation->slug()->create(['slug' => 'rsvp-wedding']);
    $this->guest->slug()->create(['slug' => 'maria']);
    $other = $this->invitation->replicate();
    $other->save();
    $other->slug()->create(['slug' => 'other-wedding']);
    $otherGuest = $other->guests()->create(['name' => 'Outro', 'max_guests' => 1]);
    $otherGuest->slug()->create(['slug' => 'outro']);
    $this->post('/konvitte/rsvp-wedding/outro/rsvp', ['status' => 'CONFIRMED'])->assertNotFound();
    $this->post('/konvitte/unknown/maria/rsvp', ['status' => 'CONFIRMED'])->assertNotFound();
    $url = '/konvitte/rsvp-wedding/maria/rsvp';
    $this->post($url, ['status' => 'invalid', 'message' => str_repeat('a', 5001)])->assertSessionHasErrors(['status', 'message']);
    expect(KonvitteGuestRsvp::count())->toBe(0);
    $this->post($url, ['status' => 'PENDING', 'konvitte_guest_id' => $otherGuest->id])->assertSessionHasNoErrors();
    expect($this->guest->fresh()->rsvp->status)->toBe('PENDING')->and($otherGuest->fresh()->rsvp)->toBeNull();
    $this->get('/konvitte/rsvp-wedding')->assertInertia(fn($page) => $page->where('invitationData.rsvpUrl', null)->where('invitationData.rsvp', null));
});
