<?php

use App\Models\Konvitte\KonvitteInvitation;
use App\Models\Konvitte\KonvitteInviteType;
use Inertia\Testing\AssertableInertia as Assert;

function publicInvitationFixture(string $slug): KonvitteInvitation
{
    $type = KonvitteInviteType::firstOrCreate(['code' => 'CASAMENTO'], ['name' => 'Casamento']);
    $invite = KonvitteInvitation::create([
        'konvitte_invite_type_id' => $type->id,
        'groom_name' => 'Manecas', 'bride_name' => 'Victoria',
        'event_date' => '2028-05-20 14:00:00', 'venue' => 'Maputo',
        'groom_father_name' => 'Antonio',
        'couple_text' => 'A nossa historia',
    ]);
    $file = \App\Models\File::create(['name' => 'capa.jpg', 'path' => 'konvitte/capa.jpg', 'format' => 'jpg']);
    $invite->files()->attach($file->id, ['role' => 'cover']);
    $invite->slug()->create(['slug' => $slug]);
    return $invite;
}

it('renders saved invitation data publicly without example content', function () {
    publicInvitationFixture('casamento-teste');
    $this->get('/konvitte/casamento-teste/convidado')->assertOk()->assertInertia(fn(Assert $page) => $page
        ->component('welcome')->where('invitationData.groom', 'Manecas')
        ->where('invitationData.bride', 'Victoria')->where('invitationData.guest', 'Convidado especial')
        ->where('invitationData.parents.groom', 'Antonio')->where('invitationData.coupleText', 'A nossa historia')
        ->where('invitationData.coverImage', fn($url) => str_ends_with($url, '/storage/konvitte/capa.jpg'))
        ->has('invitationData.program', 0)->has('invitationData.gallery', 0));
});

it('loads the guest and table only within the matching invitation', function () {
    $invite = publicInvitationFixture('primeiro');
    $mesa = $invite->tables()->create(['name' => 'Esperanca']);
    $guest = $invite->guests()->create(['name' => 'Leia', 'konvitte_table_id' => $mesa->id, 'max_guests' => 3]);
    $guest->slug()->create(['slug' => 'leia']);
    $this->get('/konvitte/primeiro/convidado/leia')->assertOk()->assertInertia(fn(Assert $page) => $page
        ->where('invitationData.guest', 'Leia')->where('invitationData.table', 'Esperanca')
        ->where('invitationData.guestLimit', 'Válido para 3 pessoa(s)'));
    publicInvitationFixture('segundo');
    $this->get('/konvitte/segundo/convidado/leia')->assertNotFound();
    $this->get('/konvitte/primeiro/convidado/desconhecido')->assertNotFound();
    $this->get('/konvitte/desconhecido/convidado')->assertNotFound();
});
