<?php

use App\Models\Konvitte\KonvitteInvitation;
use App\Models\Konvitte\KonvitteInviteType;
use App\Models\User;
use App\Notifications\VerifySonildEmail;
use App\Services\KonvitteRegistrationGroup;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

beforeEach(function () {
    $this->withSession(['_token' => 'registration-test'])->withHeader('X-CSRF-TOKEN', 'registration-test');
});

it('registers, sends a signed confirmation and grants only Konvitte access after verification', function () {
    Notification::fake();
    $this->get('/register')->assertOk();
    $this->post('/register', ['name' => 'Nova conta', 'email' => 'new@example.com', 'password' => 'Valid-password-123!', 'password_confirmation' => 'Valid-password-123!', 'email_verified_at' => now(), 'group' => 'Administrator'])
        ->assertSessionHasNoErrors()->assertRedirect('/email/verify');
    $user = User::where('email', 'new@example.com')->firstOrFail();
    expect($user->hasVerifiedEmail())->toBeFalse()->and($user->canManageKonvitte())->toBeTrue()
        ->and($user->hasModulePermission('backoffice', 'ACL'))->toBeFalse()
        ->and($user->userGroups()->first()->name)->toBe('Administrador de Konvitte');
    Notification::assertSentTo($user, VerifySonildEmail::class);
    $this->get('/backoffice/konvitte/invitations')->assertRedirect('/email/verify');
    $this->withSession(['_token' => 'after-register'])->withHeader('X-CSRF-TOKEN', 'after-register');
    $this->post('/email/verification-notification')->assertRedirect()->assertSessionHas('status', 'verification-link-sent');
    $invalid = URL::temporarySignedRoute('verification.verify', now()->addMinutes(30), ['id' => $user->id, 'hash' => sha1('wrong@example.com')]);
    $this->get($invalid)->assertForbidden();
    $expired = URL::temporarySignedRoute('verification.verify', now()->subMinute(), ['id' => $user->id, 'hash' => sha1($user->email)]);
    $this->get($expired)->assertForbidden();
    $valid = URL::temporarySignedRoute('verification.verify', now()->addMinutes(30), ['id' => $user->id, 'hash' => sha1($user->email)]);
    $this->get($valid)->assertRedirect();
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    $this->get('/backoffice/konvitte/invitations')->assertOk();
    foreach (['users', 'groups', 'permissions', 'eventtu/eventos'] as $path) $this->get('/backoffice/' . $path)->assertForbidden();
    $this->get('/backoffice')->assertRedirect('/backoffice/konvitte/invitations');
});

it('isolates invitation management by owner while keeping public invitations accessible', function () {
    $user = User::factory()->create();
    $user->userGroups()->attach(KonvitteRegistrationGroup::ensure());
    $type = KonvitteInviteType::firstOrCreate(['code' => 'CASAMENTO'], ['name' => 'Casamento']);
    $own = KonvitteInvitation::create(['konvitte_invite_type_id' => $type->id, 'groom_name' => 'Noivo', 'bride_name' => 'Noiva', 'event_date' => '2027-06-26', 'venue' => 'Maputo']);
    $other = $own->replicate();
    $other->save();
    $other->slug()->create(['slug' => 'other-public']);
    $own->forceFill(['user_id' => $user->id])->save();
    $this->actingAs($user)->get('/backoffice/konvitte/invitations')->assertInertia(fn($page) => $page->has('invitations.data', 1)->where('invitations.data.0.id', $own->id)->where('auth.canAdmin', false));
    foreach (['invitations', 'tables', 'guests', 'rsvps', 'messages'] as $section) {
        $this->get('/backoffice/konvitte/' . $section . '/' . $other->id)->assertNotFound();
        $this->get('/backoffice/konvitte/' . $section . '/' . $own->id)->assertOk();
    }
    $this->delete('/backoffice/konvitte/invitations/' . $other->id)->assertNotFound();
    $this->post('/backoffice/konvitte/tables/' . $other->id, ['name' => 'Intrusa'])->assertNotFound();
    $this->get('/konvitte/other-public')->assertOk();
});

it('validates registration and provisions the group idempotently', function () {
    Notification::fake();
    $group = KonvitteRegistrationGroup::ensure();
    expect(KonvitteRegistrationGroup::ensure()->id)->toBe($group->id)->and($group->permissions()->count())->toBe(1);
    $this->post('/register', ['name' => '', 'email' => 'invalid', 'password' => 'abc', 'password_confirmation' => 'xyz'])->assertSessionHasErrors(['name', 'email', 'password']);
    expect(User::count())->toBe(0);
});


it('assigns new invitations to the authenticated creator and ignores a forged owner', function () {
    $user = User::factory()->create();
    $user->userGroups()->attach(KonvitteRegistrationGroup::ensure());
    $other = User::factory()->create();
    $type = KonvitteInviteType::firstOrCreate(['code' => 'CASAMENTO'], ['name' => 'Casamento']);
    $this->actingAs($user)->post('/backoffice/konvitte/invitations', [
        'inviteTypeId' => $type->id, 'nomeNoiva' => 'Ana', 'nomeNoivo' => 'João',
        'nomePaiNoivo' => 'Pai', 'nomeMaeNoivo' => 'Mãe', 'nomePaiNoiva' => 'Pai', 'nomeMaeNoiva' => 'Mãe',
        'data' => '2027-06-26T15:00', 'local' => 'Maputo', 'textoCelebre' => 'Celebre connosco', 'user_id' => $other->id,
    ])->assertSessionHasNoErrors()->assertRedirect();
    expect(KonvitteInvitation::firstOrFail()->user_id)->toBe($user->id);
});

it('generates a verification email with a signed Fortify link', function () {
    $user = User::factory()->unverified()->create();
    $mail = (new VerifySonildEmail)->toMail($user);
    expect($mail->subject)->toBe('Confirme o seu email — Sonild');
    $request = \Illuminate\Http\Request::create($mail->actionUrl);
    expect(URL::hasValidSignature($request))->toBeTrue()
        ->and($request->path())->toBe('email/verify/' . $user->id . '/' . sha1($user->email));
});
