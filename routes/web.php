<?php

use App\Http\Controllers\Backoffice\BackofficeController;
use App\Http\Controllers\Backoffice\Eventtu\EventtuEventoController;
use App\Http\Controllers\Backoffice\Konvitte\KonvitteInvitationController;
use App\Http\Controllers\Backoffice\Konvitte\KonvitteManagementController;
use App\Http\Controllers\Invitations\PublicKonvitteInvitationController;
use Filament\Facades\Filament;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::get('konvitte/{slug}/{guestSlug?}', [PublicKonvitteInvitationController::class, 'show'])->name('konvitte.guest');

Route::get('email/verify', fn() => redirect(
    Filament::getPanel('backoffice')->getEmailVerificationPromptUrl(),
))->middleware('auth')->name('verification.notice');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::prefix('backoffice')->name('backoffice.')->group(function () {
        Route::get('/', [BackofficeController::class, 'dashboard'])->name('dashboard');
        Route::get('/users', [BackofficeController::class, 'users'])->name('users');
        Route::post('/users', [BackofficeController::class, 'storeUser'])->name('users.store');
        Route::get('/groups', [BackofficeController::class, 'groups'])->name('groups');
        Route::post('/groups', [BackofficeController::class, 'storeGroup'])->name('groups.store');
        Route::get('/permissions', [BackofficeController::class, 'permissions'])->name('permissions');
        Route::post('/permissions', [BackofficeController::class, 'storePermission'])->name('permissions.store');
        Route::get('/eventtu/eventos', [EventtuEventoController::class, 'index'])->name('eventtu.eventos');
        Route::get('/eventtu/event-types', [EventtuEventoController::class, 'types'])->name('eventtu.event-types');
        Route::post('/eventtu/eventos', [EventtuEventoController::class, 'store'])->name('eventtu.eventos.store');
        Route::post('/eventtu/event-types', [EventtuEventoController::class, 'storeType'])->name('eventtu.event-types.store');
        Route::put('/eventtu/event-types/{eventType}', [EventtuEventoController::class, 'updateType'])->name('eventtu.event-types.update');
        Route::delete('/eventtu/event-types/{eventType}', [EventtuEventoController::class, 'destroyType'])->name('eventtu.event-types.destroy');

        Route::get('/konvitte/invitations', [KonvitteInvitationController::class, 'index'])->name('konvitte.invitations.index');
        Route::get('/konvitte/invitations/create', [KonvitteInvitationController::class, 'edit'])->name('konvitte.invitations.create');
        Route::delete('/konvitte/invitations/{invitation}', [KonvitteInvitationController::class, 'destroy'])->name('konvitte.invitations.destroy');
        Route::get('/konvitte/invitations/{invitation}', [KonvitteInvitationController::class, 'edit'])->name('konvitte.invitations.edit');
        Route::post('/konvitte/invitations/{invitation?}', [KonvitteInvitationController::class, 'save'])->name('konvitte.invitations.save');
        Route::get('/konvitte/tables/{invitation?}', [KonvitteManagementController::class, 'tables'])->name('konvitte.tables.index');
        Route::post('/konvitte/tables/{invitation}', [KonvitteManagementController::class, 'storeTable'])->name('konvitte.tables.store');
        Route::put('/konvitte/tables/{invitation}/{table}', [KonvitteManagementController::class, 'updateTable'])->name('konvitte.tables.update');
        Route::get('/konvitte/guests/{invitation?}', [KonvitteManagementController::class, 'guests'])->name('konvitte.guests.index');
        Route::post('/konvitte/guests/{invitation}', [KonvitteManagementController::class, 'storeGuest'])->name('konvitte.guests.store');
        Route::put('/konvitte/guests/{invitation}/{guest}', [KonvitteManagementController::class, 'updateGuest'])->name('konvitte.guests.update');
        Route::get('/konvitte/convite/{invitation?}', [KonvitteInvitationController::class, 'edit'])->name('konvitte.convite');
        Route::post('/konvitte/convite/{invitation?}', [KonvitteInvitationController::class, 'save'])->name('konvitte.convite.save');
        Route::post('/konvitte/convite/{invitation}/mesas', [KonvitteInvitationController::class, 'storeLegacyTable'])->name('konvitte.convite.mesas.store');
        Route::post('/konvitte/convite/{invitation}/convidados', [KonvitteInvitationController::class, 'storeLegacyGuest'])->name('konvitte.convite.convidados.store');
    });
});

require __DIR__.'/settings.php';
