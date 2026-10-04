<?php

use App\Models\Konvitte\KonvitteInvitation;
use App\Models\Konvitte\KonvitteInviteType;
use App\Models\Permission;
use App\Models\User;
use App\Models\UserGroup;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withSession(['_token' => 'konvitte-test-token'])->withHeader('X-CSRF-TOKEN', 'konvitte-test-token');
});

function konvitteAdmin(): User
{
    $user = User::factory()->create();
    $group = UserGroup::create(['name' => 'Konvitte managers']);
    $permission = Permission::create(['name' => 'Manage', 'scope' => 'backoffice', 'module' => 'ACL', 'resource' => 'user', 'action' => 'view']);
    $group->permissions()->attach($permission);
    $user->userGroups()->attach($group);
    return $user;
}

function konvitteManagedInvitation(): KonvitteInvitation
{
    $type = KonvitteInviteType::firstOrCreate(['code' => 'WEDDING'], ['name' => 'Wedding']);
    return KonvitteInvitation::create(['konvitte_invite_type_id' => $type->id, 'groom_name' => 'Edilson', 'bride_name' => 'Ilda', 'event_date' => '2027-06-26 15:00:00', 'venue' => 'Maputo']);
}

it('serves separate screens and preserves invitation context', function () {
    $this->actingAs(konvitteAdmin());
    $invitation = konvitteManagedInvitation();
    $other = konvitteManagedInvitation();
    $other->tables()->create(['name' => 'Other table']);
    $this->get("/backoffice/konvitte/tables/{$invitation->id}")->assertOk()->assertInertia(fn(Assert $page) => $page->component('backoffice/Konvitte/KonvitteTables')->where('invitation.id', $invitation->id)->has('tables', 0));
    $this->post("/backoffice/konvitte/tables/{$invitation->id}", ['name' => 'Family'])->assertSessionHasNoErrors();
    $table = $invitation->tables()->firstOrFail();
    $this->post("/backoffice/konvitte/guests/{$invitation->id}", ['name' => 'Leia', 'tableId' => $table->id, 'maxGuests' => 3])->assertSessionHasNoErrors();
    $this->get("/backoffice/konvitte/guests/{$invitation->id}")->assertOk()->assertInertia(fn(Assert $page) => $page->component('backoffice/Konvitte/KonvitteGuests')->has('guests.data', 1)->where('guests.data.0.table', 'Family')->where('guests.data.0.maxGuests', 3));
    $this->get("/backoffice/konvitte/invitations/{$invitation->id}")->assertOk()->assertInertia(fn(Assert $page) => $page->component('backoffice/Konvitte/KonvitteInvitation')->missing('mesas')->missing('convidados'));
    $this->post("/backoffice/konvitte/guests/{$invitation->id}", ['name' => 'Wrong table', 'tableId' => $other->tables()->first()->id, 'maxGuests' => 1])->assertSessionHasErrors('tableId');
    expect($invitation->guests()->count())->toBe(1);
});

it('handles empty data and enforces access', function () {
    $this->actingAs(konvitteAdmin())->get('/backoffice/konvitte/tables')->assertOk()->assertInertia(fn(Assert $page) => $page->where('invitation', null)->has('tables', 0));
    $this->actingAs(User::factory()->create())->get('/backoffice/konvitte/guests')->assertForbidden();
    $invitation = konvitteManagedInvitation();
    $this->post("/backoffice/konvitte/tables/{$invitation->id}", ['name' => 'Forbidden'])->assertForbidden();
});

it('lists multiple invitations and opens a blank creation form', function () {
    $this->actingAs(konvitteAdmin());
    $first = konvitteManagedInvitation();
    $second = konvitteManagedInvitation();
    $this->get('/backoffice/konvitte/invitations')->assertOk()->assertInertia(fn(Assert $page) => $page
        ->component('backoffice/Konvitte/KonvitteInvitations')->has('invitations.data', 2)
        ->where('invitations.total', 2)->where('invitations.data.0.id', $second->id)
        ->where('invitations.data.0.type', 'Wedding')->where('invitations.data.0.date', '2027-06-26'));
    $this->get('/backoffice/konvitte/invitations/create')->assertOk()->assertInertia(fn(Assert $page) => $page->where('convite', null));
    $this->get("/backoffice/konvitte/invitations/{$first->id}")->assertOk()->assertInertia(fn(Assert $page) => $page->where('convite.id', $first->id));
});

it('deletes only the selected invitation and protects shared files', function () {
    $this->actingAs(konvitteAdmin());
    $first = konvitteManagedInvitation();
    $second = konvitteManagedInvitation();
    $first->slug()->create(['slug' => 'delete-me']);
    $table = $first->tables()->create(['name' => 'Family']);
    $guest = $first->guests()->create(['name' => 'Leia', 'konvitte_table_id' => $table->id, 'max_guests' => 2]);
    $guest->slug()->create(['slug' => 'leia-delete']);
    $file = \App\Models\File::create(['name' => 'Shared', 'path' => 'files/shared.jpg', 'format' => 'jpg']);
    foreach ([$first, $second] as $invitation) $invitation->files()->attach($file->id, ['role' => 'cover']);
    $this->delete("/backoffice/konvitte/invitations/{$first->id}")->assertRedirect('/backoffice/konvitte/invitations');
    $this->assertDatabaseMissing('konvitte_invitations', ['id' => $first->id]);
    $this->assertDatabaseMissing('konvitte_tables', ['id' => $table->id]);
    $this->assertDatabaseMissing('konvitte_guests', ['id' => $guest->id]);
    $this->assertDatabaseMissing('konvitte_guest_slugs', ['slug' => 'leia-delete']);
    expect($second->fresh()->fileFor('cover')->id)->toBe($file->id);
    $this->get('/konvitte/delete-me/convidado')->assertNotFound();
    $this->actingAs(User::factory()->create())->delete("/backoffice/konvitte/invitations/{$second->id}")->assertForbidden();
    expect($second->fresh())->not->toBeNull();
});

it('preserves shared public links when editing and creates separate invitations', function () {
    $this->actingAs(konvitteAdmin());
    $first = konvitteManagedInvitation();
    $first->slug()->create(['slug' => 'already-shared']);
    $payload = ['inviteTypeId' => $first->konvitte_invite_type_id, 'nomeNoiva' => 'New bride', 'nomeNoivo' => 'New groom', 'nomePaiNoivo' => 'A', 'nomeMaeNoivo' => 'B', 'nomePaiNoiva' => 'C', 'nomeMaeNoiva' => 'D', 'data' => '2028-05-01 12:00', 'local' => 'Maputo', 'textoCelebre' => 'Celebrate', 'googleMapsLink' => 'https://maps.google.com/?q=Maputo'];
    $this->post("/backoffice/konvitte/invitations/{$first->id}", $payload)->assertSessionHasNoErrors()->assertRedirect("/backoffice/konvitte/invitations/{$first->id}");
    expect($first->fresh()->slug->slug)->toBe('already-shared');
    expect($first->fresh()->google_maps_link)->toBe('https://maps.google.com/?q=Maputo');
    $this->get("/backoffice/konvitte/invitations/{$first->id}")->assertInertia(fn(Assert $page) => $page->where('convite.googleMapsLink', 'https://maps.google.com/?q=Maputo'));
    $this->post("/backoffice/konvitte/invitations/{$first->id}", array_replace($payload, ['googleMapsLink' => 'javascript:alert(1)']))->assertSessionHasErrors('googleMapsLink');
    $this->post('/backoffice/konvitte/invitations', $payload)->assertSessionHasNoErrors()->assertRedirect();
    expect(KonvitteInvitation::count())->toBe(2);
    $this->assertDatabaseHas('konvitte_invitations', ['id' => $first->id, 'groom_name' => 'New groom']);
});

it('defaults tables and guests to the latest invitation and honours explicit selection', function () {
    $this->actingAs(konvitteAdmin());
    $older = konvitteManagedInvitation();
    $latest = konvitteManagedInvitation();
    foreach (['tables', 'guests'] as $section) {
        $this->get("/backoffice/konvitte/{$section}")->assertOk()->assertInertia(fn(Assert $page) => $page
            ->where('invitation.id', $latest->id)->where('invitations.0.id', $latest->id));
        $this->get("/backoffice/konvitte/{$section}/{$older->id}")->assertOk()->assertInertia(fn(Assert $page) => $page->where('invitation.id', $older->id));
    }
    $this->post("/backoffice/konvitte/tables/{$older->id}", ['name' => 'Selected table'])->assertSessionHasNoErrors();
    $this->post("/backoffice/konvitte/guests/{$older->id}", ['name' => 'Selected guest', 'maxGuests' => 1])->assertSessionHasNoErrors();
    expect($older->tables()->count())->toBe(1)->and($older->guests()->count())->toBe(1);
    expect($latest->tables()->count())->toBe(0)->and($latest->guests()->count())->toBe(0);
});


it('creates a table with capacity while registering a guest and reuses it', function () {
    $this->actingAs(konvitteAdmin());
    $invitation = konvitteManagedInvitation();
    $other = konvitteManagedInvitation();
    $other->tables()->create(['name' => 'Família', 'capacity' => 20]);
    $payload = ['name' => 'Ana', 'tableName' => 'Família', 'tableCapacity' => 8, 'maxGuests' => 3];
    $this->post("/backoffice/konvitte/guests/{$invitation->id}", $payload)->assertSessionHasNoErrors();
    $table = $invitation->tables()->firstOrFail();
    expect($table->capacity)->toBe(8);
    expect($invitation->guests()->firstOrFail()->konvitte_table_id)->toBe($table->id);
    $this->post("/backoffice/konvitte/guests/{$invitation->id}", array_replace($payload, ['name' => 'Luís', 'tableCapacity' => 10, 'maxGuests' => 2]))->assertSessionHasNoErrors();
    expect($invitation->tables()->count())->toBe(1)->and($table->fresh()->capacity)->toBe(8);
    $this->get("/backoffice/konvitte/guests/{$invitation->id}")->assertInertia(fn(Assert $page) => $page
        ->where('tables.0.capacity', 8)->where('tables.0.allocatedSeats', 5)->where('tables.0.guestCount', 2));
});

it('creates only a table and validates capacity before creating records', function () {
    $this->actingAs(konvitteAdmin());
    $invitation = konvitteManagedInvitation();
    $this->post("/backoffice/konvitte/tables/{$invitation->id}", ['name' => 'Amigos', 'capacity' => 6])->assertSessionHasNoErrors();
    expect($invitation->tables()->firstOrFail()->capacity)->toBe(6)->and($invitation->guests()->count())->toBe(0);
    foreach ([0, -1, 1000, 'invalid'] as $capacity) {
        $this->post("/backoffice/konvitte/tables/{$invitation->id}", ['name' => 'Inválida', 'capacity' => $capacity])->assertSessionHasErrors('capacity');
        $this->post("/backoffice/konvitte/guests/{$invitation->id}", ['name' => 'Ana', 'tableName' => 'Inválida', 'tableCapacity' => $capacity, 'maxGuests' => 1])->assertSessionHasErrors('tableCapacity');
    }
    $this->post("/backoffice/konvitte/guests/{$invitation->id}", ['name' => 'Ana', 'tableName' => 'Não criar', 'tableCapacity' => 6, 'maxGuests' => 0])->assertSessionHasErrors('maxGuests');
    expect($invitation->tables()->count())->toBe(1)->and($invitation->guests()->count())->toBe(0);
});
it('edits a guest without changing its public link and can clear the table', function () {
    $this->actingAs(konvitteAdmin());
    $invitation = konvitteManagedInvitation();
    $table = $invitation->tables()->create(['name' => 'Família', 'capacity' => 8]);
    $guest = $invitation->guests()->create(['name' => 'Ana', 'max_guests' => 2]);
    $guest->slug()->create(['slug' => 'ana-original']);
    $url = "/backoffice/konvitte/guests/{$invitation->id}/{$guest->id}";
    $this->put($url, ['name' => 'Ana Maria', 'tableId' => $table->id, 'maxGuests' => 4])->assertSessionHasNoErrors()->assertRedirect();
    expect($guest->fresh()->name)->toBe('Ana Maria')->and($guest->fresh()->max_guests)->toBe(4)
        ->and($guest->fresh()->konvitte_table_id)->toBe($table->id)->and($guest->fresh()->slug->slug)->toBe('ana-original');
    $this->get("/backoffice/konvitte/guests/{$invitation->id}")->assertInertia(fn(Assert $page) => $page
        ->where('guests.data.0.tableId', $table->id)->where('tables.0.allocatedSeats', 4));
    $this->put($url, ['name' => 'Ana Maria', 'tableId' => null, 'maxGuests' => 1])->assertSessionHasNoErrors();
    expect($guest->fresh()->konvitte_table_id)->toBeNull()->and($invitation->guests()->count())->toBe(1);
    $this->put($url, ['name' => 'Ana Maria', 'tableName' => 'Amigos', 'tableCapacity' => 6, 'maxGuests' => 2])->assertSessionHasNoErrors();
    expect($guest->fresh()->table->name)->toBe('Amigos')->and($guest->fresh()->table->capacity)->toBe(6);
});

it('rejects guest edits with invalid data or another invitation context', function () {
    $this->actingAs(konvitteAdmin());
    $invitation = konvitteManagedInvitation();
    $other = konvitteManagedInvitation();
    $table = $other->tables()->create(['name' => 'Outra']);
    $guest = $invitation->guests()->create(['name' => 'Ana', 'max_guests' => 2]);
    $payload = ['name' => 'Alterado', 'maxGuests' => 3];
    $this->put("/backoffice/konvitte/guests/{$other->id}/{$guest->id}", $payload)->assertNotFound();
    $url = "/backoffice/konvitte/guests/{$invitation->id}/{$guest->id}";
    $this->put($url, $payload + ['tableId' => $table->id])->assertSessionHasErrors('tableId');
    $this->put($url, ['name' => '', 'maxGuests' => 0, 'tableName' => 'Não criar'])->assertSessionHasErrors(['name', 'maxGuests']);
    expect($guest->fresh()->name)->toBe('Ana')->and($guest->fresh()->max_guests)->toBe(2)->and($invitation->tables()->count())->toBe(0);
    $this->actingAs(User::factory()->create())->put($url, $payload)->assertForbidden();
    expect($guest->fresh()->name)->toBe('Ana');
});

it('edits tables while preserving assigned guests and allows unchanged or cross-invitation names', function () {
    $this->actingAs(konvitteAdmin());
    $invitation = konvitteManagedInvitation();
    $other = konvitteManagedInvitation();
    $table = $invitation->tables()->create(['name' => 'Família', 'capacity' => 8]);
    $other->tables()->create(['name' => 'Amigos', 'capacity' => 10]);
    $guest = $invitation->guests()->create(['name' => 'Ana', 'konvitte_table_id' => $table->id, 'max_guests' => 2]);
    $url = "/backoffice/konvitte/tables/{$invitation->id}/{$table->id}";
    $this->put($url, ['name' => 'Família', 'capacity' => 12])->assertSessionHasNoErrors()->assertRedirect();
    $this->put($url, ['name' => 'Amigos', 'capacity' => 6])->assertSessionHasNoErrors();
    expect($table->fresh()->name)->toBe('Amigos')->and($table->fresh()->capacity)->toBe(6)
        ->and($guest->fresh()->konvitte_table_id)->toBe($table->id)->and($invitation->tables()->count())->toBe(1);
    $this->get("/backoffice/konvitte/guests/{$invitation->id}")->assertInertia(fn(Assert $page) => $page
        ->where('guests.data.0.table', 'Amigos')->where('tables.0.capacity', 6)->where('tables.0.allocatedSeats', 2));
    $this->put($url, ['name' => 'Amigos', 'capacity' => null])->assertSessionHasNoErrors();
    expect($table->fresh()->capacity)->toBeNull();
});

it('rejects invalid, duplicate and unauthorised table edits', function () {
    $this->actingAs(konvitteAdmin());
    $invitation = konvitteManagedInvitation();
    $other = konvitteManagedInvitation();
    $table = $invitation->tables()->create(['name' => 'Família', 'capacity' => 8]);
    $invitation->tables()->create(['name' => 'Amigos']);
    $url = "/backoffice/konvitte/tables/{$invitation->id}/{$table->id}";
    $this->put($url, ['name' => 'Amigos', 'capacity' => 6])->assertSessionHasErrors('name');
    $this->put($url, ['name' => '', 'capacity' => 0])->assertSessionHasErrors(['name', 'capacity']);
    foreach ([-1, 1000, 'invalid', 1.5] as $capacity) {
        $this->put($url, ['name' => 'Alterada', 'capacity' => $capacity])->assertSessionHasErrors('capacity');
    }
    $this->put("/backoffice/konvitte/tables/{$other->id}/{$table->id}", ['name' => 'Alterada', 'capacity' => 6])->assertNotFound();
    $this->actingAs(User::factory()->create())->put($url, ['name' => 'Alterada', 'capacity' => 6])->assertForbidden();
    expect($table->fresh()->name)->toBe('Família')->and($table->fresh()->capacity)->toBe(8);
});

it('filters guests by table across pages and supports unassigned guests and clearing', function () {
    $this->actingAs(konvitteAdmin());
    $invitation = konvitteManagedInvitation();
    $table = $invitation->tables()->create(['name' => 'Família']);
    $empty = $invitation->tables()->create(['name' => 'Vazia']);
    $invitation->guests()->create(['name' => 'Sem mesa', 'max_guests' => 1]);
    for ($i = 1; $i <= 12; $i++) {
        $invitation->guests()->create(['name' => "Convidado $i", 'konvitte_table_id' => $table->id, 'max_guests' => 1]);
    }
    $url = "/backoffice/konvitte/guests/{$invitation->id}";
    $this->get("$url?table={$table->id}")->assertOk()->assertInertia(fn(Assert $page) => $page
        ->where('filters.table', (string)$table->id)->where('guests.total', 12)->where('guests.last_page', 2)
        ->has('guests.data', 10)->where('guests.data.0.tableId', $table->id)
        ->where('guests.next_page_url', fn($url) => str_contains($url, "table={$table->id}") && str_contains($url, 'page=2')));
    $this->get("$url?table={$table->id}&page=2")->assertOk()->assertInertia(fn(Assert $page) => $page
        ->where('filters.table', (string)$table->id)->has('guests.data', 2)->where('guests.data.0.name', 'Convidado 11'));
    $this->get("$url?table=none")->assertOk()->assertInertia(fn(Assert $page) => $page
        ->where('guests.total', 1)->where('guests.data.0.name', 'Sem mesa')->where('guests.data.0.tableId', null));
    $this->get("$url?table={$empty->id}")->assertOk()->assertInertia(fn(Assert $page) => $page->where('guests.total', 0)->has('guests.data', 0));
    $this->get($url)->assertOk()->assertInertia(fn(Assert $page) => $page->where('filters.table', null)->where('guests.total', 13));
});

it('rejects table filters outside the invitation and malformed filters', function () {
    $this->actingAs(konvitteAdmin());
    $invitation = konvitteManagedInvitation();
    $other = konvitteManagedInvitation();
    $table = $other->tables()->create(['name' => 'Outra']);
    $url = "/backoffice/konvitte/guests/{$invitation->id}";
    $this->get("$url?table={$table->id}")->assertNotFound();
    $this->get("$url?table=invalid")->assertStatus(400);
    $this->get("$url?table[]=1")->assertStatus(400);
});
