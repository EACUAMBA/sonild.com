<?php

use App\Models\File;
use App\Models\Konvitte\KonvitteInvitation;
use App\Models\Konvitte\KonvitteInviteType;
use App\Models\Permission;
use App\Models\User;
use App\Models\UserGroup;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('stores all invitation media in files and keeps unchanged media when editing', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $group = UserGroup::create(['name' => 'File managers']);
    $permission = Permission::create(['name' => 'Manage', 'scope' => 'backoffice', 'module' => 'ACL', 'resource' => 'user', 'action' => 'view']);
    $group->permissions()->attach($permission);
    $user->userGroups()->attach($group);
    $this->actingAs($user)->withSession(['_token' => 'file-test'])->withHeader('X-CSRF-TOKEN', 'file-test');
    $type = KonvitteInviteType::firstOrCreate(['code' => 'WEDDING'], ['name' => 'Wedding']);
    $payload = ['inviteTypeId' => $type->id, 'nomeNoiva' => 'Ilda', 'nomeNoivo' => 'Edilson', 'nomePaiNoivo' => 'A', 'nomeMaeNoivo' => 'B', 'nomePaiNoiva' => 'C', 'nomeMaeNoiva' => 'D', 'data' => '2027-06-26 15:00', 'local' => 'Maputo', 'textoCelebre' => 'Celebrate', 'program' => [['hora' => '15:00', 'nome' => 'Ceremony', 'localizacao' => 'Church']], 'contacts' => [['nome' => 'Contact', 'telefone' => '840000000']]];
    // A real one-pixel PNG keeps this test independent of the GD extension.
    $image = fn($name) => UploadedFile::fake()->createWithContent($name, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='));
    $this->post('/backoffice/konvitte/invitations', $payload + ['fotoCapa' => $image('cover.png'), 'fotoInicial' => $image('hero.png'), 'fotoInformacoes' => $image('info.png'), 'musica' => UploadedFile::fake()->create('song.mp3', 10, 'audio/mpeg'), 'gallery' => [$image('gallery.png')]])->assertRedirect()->assertSessionHasNoErrors();
    $invitation = KonvitteInvitation::firstOrFail();
    expect(File::count())->toBe(5)->and($invitation->files()->count())->toBe(5)->and($invitation->gallery()->count())->toBe(1);
    expect($invitation->fileFor('cover')->name)->toBe('cover.png')->and($invitation->fileFor('music')->format)->toBe('mp3');
    foreach ($invitation->files as $file) Storage::disk('public')->assertExists($file->path);
    $oldCover = $invitation->fileFor('cover')->id;
    $this->post("/backoffice/konvitte/invitations/{$invitation->id}", $payload)->assertRedirect()->assertSessionHasNoErrors();
    expect($invitation->fresh()->fileFor('cover')->id)->toBe($oldCover);
    $this->post("/backoffice/konvitte/invitations/{$invitation->id}", $payload + ['fotoCapa' => $image('replacement.png')])->assertRedirect()->assertSessionHasNoErrors();
    $invitation = $invitation->fresh();
    expect($invitation->files()->wherePivot('role', 'cover')->count())->toBe(1)->and($invitation->fileFor('cover')->id)->not->toBe($oldCover)->and($invitation->fileFor('music')->name)->toBe('song.mp3');
    $this->get('/konvitte/' . $invitation->slug->slug)->assertOk()->assertInertia(fn(Assert $page) => $page->where('invitationData.coverImage', $invitation->fileFor('cover')->url())->has('invitationData.gallery', 1));
    $galleryId = $invitation->gallery()->firstOrFail()->id;
    $other = KonvitteInvitation::create(['konvitte_invite_type_id' => $type->id, 'groom_name' => 'Other', 'bride_name' => 'Couple', 'event_date' => '2027-06-26', 'venue' => 'Maputo']);
    $other->files()->attach($galleryId, ['role' => 'gallery']);
    $heroId = $invitation->fileFor('hero')->id;
    $this->post("/backoffice/konvitte/invitations/{$invitation->id}", $payload + [
            'removeMedia' => ['fotoCapa', 'musica', 'fotoInformacoes'],
            'removeGallery' => [$galleryId, $heroId],
        ])->assertSessionHasNoErrors();
    $invitation = $invitation->fresh();
    expect($invitation->fileFor('cover'))->toBeNull()
        ->and($invitation->fileFor('music'))->toBeNull()
        ->and($invitation->fileFor('information'))->toBeNull()
        ->and($invitation->fileFor('hero')->id)->toBe($heroId)
        ->and($invitation->gallery()->count())->toBe(0)
        ->and($other->gallery()->count())->toBe(1);
    $this->get('/konvitte/' . $invitation->slug->slug)->assertOk()->assertInertia(fn(Assert $page) => $page
        ->where('invitationData.coverImage', null)->where('invitationData.music', null)->has('invitationData.gallery', 0));
});
