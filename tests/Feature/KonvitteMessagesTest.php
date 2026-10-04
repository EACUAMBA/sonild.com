<?php

use App\Models\Konvitte\KonvitteInvitation;
use App\Models\Konvitte\KonvitteInviteType;
use App\Models\Konvitte\KonvitteMessage;
use App\Models\Permission;
use App\Models\User;
use App\Models\UserGroup;

beforeEach(function () {
    $this->withSession(['_token' => 'message-test'])->withHeader('X-CSRF-TOKEN', 'message-test');
    $type = KonvitteInviteType::firstOrCreate(['code' => 'CASAMENTO'], ['name' => 'Casamento']);
    $this->invite = KonvitteInvitation::create(['konvitte_invite_type_id' => $type->id, 'groom_name' => 'João', 'bride_name' => 'Ana', 'event_date' => '2027-06-26', 'venue' => 'Maputo']);
    $this->invite->slug()->create(['slug' => 'messages-wedding']);
    $this->guest = $this->invite->guests()->create(['name' => 'Maria', 'max_guests' => 1]);
    $this->guest->slug()->create(['slug' => 'maria-messages']);
    $this->url = '/konvitte/messages-wedding/maria-messages/messages';
});

it('stores multiple messages and returns only the personal history', function () {
    $other = $this->invite->guests()->create(['name' => 'Pedro', 'max_guests' => 1]);
    $this->invite->messages()->create(['konvitte_guest_id' => $other->id, 'text' => 'Privada']);
    foreach (['Felicidades!', 'Até breve!'] as $text) {
        $this->post($this->url, ['text' => $text, 'konvitte_guest_id' => $other->id, 'konvitte_invitation_id' => 999])
            ->assertSessionHasNoErrors()->assertRedirect('/konvitte/messages-wedding/maria-messages');
    }
    expect($this->guest->messages()->count())->toBe(2);
    $this->get('/konvitte/messages-wedding/maria-messages')->assertOk()->assertInertia(fn($page) => $page
        ->where('invitationData.messagesUrl', $this->url)->has('invitationData.messages', 2)
        ->where('invitationData.messages.0.text', 'Até breve!'));
    $this->get('/konvitte/messages-wedding')->assertOk()->assertInertia(fn($page) => $page
        ->where('invitationData.messagesUrl', null)->has('invitationData.messages', 0));
});

it('rejects invalid text and mismatched invitations', function () {
    foreach (['', '   ', str_repeat('a', 5001), ['invalid']] as $text) {
        $this->post($this->url, ['text' => $text])->assertSessionHasErrors('text');
    }
    $other = $this->invite->replicate();
    $other->save();
    $other->slug()->create(['slug' => 'other-messages']);
    $this->post('/konvitte/other-messages/maria-messages/messages', ['text' => 'Não'])->assertNotFound();
    $this->post('/konvitte/messages-wedding/unknown/messages', ['text' => 'Não'])->assertNotFound();
    expect(KonvitteMessage::count())->toBe(0);
});

it('protects management and lists paginated messages within the selected invitation', function () {
    $this->actingAs(User::factory()->create())->get('/backoffice/konvitte/messages')->assertForbidden();
    $user = User::factory()->create();
    $group = UserGroup::create(['name' => 'Message managers']);
    $permission = Permission::create(['name' => 'Manage messages', 'scope' => 'backoffice', 'module' => 'ACL', 'resource' => 'user', 'action' => 'view']);
    $group->permissions()->attach($permission);
    $user->userGroups()->attach($group);
    for ($i = 1; $i <= 11; $i++) $this->invite->messages()->create(['konvitte_guest_id' => $this->guest->id, 'text' => "Mensagem $i"]);
    $other = $this->invite->replicate();
    $other->save();
    $otherGuest = $other->guests()->create(['name' => 'Outro', 'max_guests' => 1]);
    $other->messages()->create(['konvitte_guest_id' => $otherGuest->id, 'text' => 'Outro convite']);
    $url = '/backoffice/konvitte/messages/' . $this->invite->id;
    $this->actingAs($user)->get($url)->assertOk()->assertInertia(fn($page) => $page
        ->component('backoffice/Konvitte/KonvitteMessages')->where('messages.total', 11)
        ->has('messages.data', 10)->where('messages.data.0.text', 'Mensagem 11')->where('messages.data.0.guest', 'Maria'));
    $this->get($url . '?page=2')->assertInertia(fn($page) => $page->has('messages.data', 1));
    $this->get($url . '?search=Outro')->assertInertia(fn($page) => $page->has('messages.data', 0));
    $this->get($url . '?search[]=bad')->assertStatus(400);
});

it('deletes dependent messages with guests and invitations', function () {
    $this->invite->messages()->create(['konvitte_guest_id' => $this->guest->id, 'text' => 'Olá']);
    $this->guest->delete();
    expect(KonvitteMessage::count())->toBe(0);
    $guest = $this->invite->guests()->create(['name' => 'Outro', 'max_guests' => 1]);
    $this->invite->messages()->create(['konvitte_guest_id' => $guest->id, 'text' => 'Olá']);
    $this->invite->delete();
    expect(KonvitteMessage::count())->toBe(0);
});
