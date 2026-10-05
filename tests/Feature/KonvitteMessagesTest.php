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

it('shares visible messages with guests of the same invitation', function () {
    $other = $this->invite->guests()->create(['name' => 'Pedro', 'max_guests' => 1]);
    $this->invite->messages()->create(['konvitte_guest_id' => $other->id, 'text' => 'Parabéns!']);
    foreach (['Felicidades!', 'Até breve!'] as $text) {
        $this->post($this->url, ['text' => $text, 'konvitte_guest_id' => $other->id, 'konvitte_invitation_id' => 999])
            ->assertSessionHasNoErrors()->assertRedirect('/konvitte/messages-wedding/maria-messages');
    }
    expect($this->guest->messages()->count())->toBe(2);
    $this->get('/konvitte/messages-wedding/maria-messages')->assertOk()->assertInertia(fn($page) => $page
        ->where('invitationData.messagesUrl', $this->url)->has('invitationData.messages', 3)
        ->where('invitationData.messages.0.text', 'Até breve!')
        ->where('invitationData.messages.0.isOwn', true)
        ->where('invitationData.messages.2.author', 'Pedro')->where('invitationData.messages.2.isOwn', false));
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


it('lets only the author hide their message and preserves moderator restrictions', function () {
    $message = $this->invite->messages()->create(['konvitte_guest_id' => $this->guest->id, 'text' => 'Segredo']);
    $url = $this->url . '/' . $message->id . '/visibility';
    $this->patch($url, ['hidden' => true])->assertRedirect();
    expect($message->fresh()->hidden_by_guest)->toBeTrue()->and($message->fresh()->text)->toBe('Segredo');
    $this->get('/konvitte/messages-wedding/maria-messages')->assertInertia(fn($page) => $page->where('invitationData.messages.0.text', null));
    $other = $this->invite->guests()->create(['name' => 'Outro', 'max_guests' => 1]);
    $other->slug()->create(['slug' => 'other-author']);
    $this->patch('/konvitte/messages-wedding/other-author/messages/' . $message->id . '/visibility', ['hidden' => false])->assertNotFound();
    $message->update(['hidden_by_admin' => true]);
    $this->patch($url, ['hidden' => false, 'hidden_by_admin' => false])->assertRedirect();
    $this->get('/konvitte/messages-wedding/maria-messages')->assertInertia(fn($page) => $page
        ->where('invitationData.messages.0.text', null)->where('invitationData.messages.0.hiddenByAdmin', true));
    $message->update(['hidden_by_admin' => false]);
    $this->get('/konvitte/messages-wedding/maria-messages')->assertInertia(fn($page) => $page->where('invitationData.messages.0.text', 'Segredo'));
    $this->patch($url, ['hidden' => 'invalid'])->assertSessionHasErrors('hidden');
});

it('authorizes moderator visibility changes and scopes them to the invitation', function () {
    $message = $this->invite->messages()->create(['konvitte_guest_id' => $this->guest->id, 'text' => 'Olá']);
    $url = '/backoffice/konvitte/messages/' . $this->invite->id . '/' . $message->id . '/visibility';
    $this->actingAs(User::factory()->create())->patch($url, ['hidden' => true])->assertForbidden();
    $user = User::factory()->create();
    $group = UserGroup::create(['name' => 'Moderators']);
    $permission = Permission::create(['name' => 'Moderate', 'scope' => 'backoffice', 'module' => 'ACL', 'resource' => 'user', 'action' => 'view']);
    $group->permissions()->attach($permission);
    $user->userGroups()->attach($group);
    $this->actingAs($user)->patch($url, ['hidden' => true])->assertRedirect();
    expect($message->fresh()->hidden_by_admin)->toBeTrue();
    $this->get('/backoffice/konvitte/messages/' . $this->invite->id)->assertInertia(fn($page) => $page->where('messages.data.0.text', null));
    $other = $this->invite->replicate();
    $other->save();
    $this->patch('/backoffice/konvitte/messages/' . $other->id . '/' . $message->id . '/visibility', ['hidden' => false])->assertNotFound();
    $this->patch($url, ['hidden' => false])->assertRedirect();
    expect($message->fresh()->hidden_by_admin)->toBeFalse();
});


it('keeps hidden messages and other invitations out of the shared feed', function () {
    $other = $this->invite->guests()->create(['name' => 'Pedro', 'max_guests' => 1]);
    foreach (['hidden_by_guest', 'hidden_by_admin'] as $flag) {
        $this->invite->messages()->create(['konvitte_guest_id' => $other->id, 'text' => 'Oculta', $flag => true]);
    }
    $this->invite->messages()->create(['konvitte_guest_id' => $other->id, 'text' => 'Pública']);
    $separate = $this->invite->replicate();
    $separate->save();
    $guest = $separate->guests()->create(['name' => 'Outro evento', 'max_guests' => 1]);
    $separate->messages()->create(['konvitte_guest_id' => $guest->id, 'text' => 'Outro evento']);
    $this->get('/konvitte/messages-wedding/maria-messages')->assertOk()->assertInertia(fn($page) => $page
        ->has('invitationData.messages', 1)->where('invitationData.messages.0.text', 'Pública')
        ->where('invitationData.messages.0.author', 'Pedro')->where('invitationData.messages.0.isOwn', false));
});
