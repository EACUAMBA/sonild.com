<?php

use App\Http\Controllers\Backoffice\BackofficeController;
use App\Http\Controllers\Backoffice\Eventtu\EventtuEventoController;
use App\Http\Controllers\Backoffice\Konvitte\KonvitteConviteController;
use Filament\Facades\Filament;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::get('konvitte/{slug}/convidado', fn() => abort(404))->name('konvitte.guest');

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
        Route::get('/konvitte/convite/{convite?}', [KonvitteConviteController::class, 'edit'])->name('konvitte.convite');
        Route::post('/konvitte/convite/{convite?}', [KonvitteConviteController::class, 'save'])->name('konvitte.convite.save');
        Route::post('/konvitte/convite/{convite}/mesas', [KonvitteConviteController::class, 'storeMesa'])->name('konvitte.convite.mesas.store');
        Route::post('/konvitte/convite/{convite}/convidados', [KonvitteConviteController::class, 'storeConvidado'])->name('konvitte.convite.convidados.store');
    });
});

require __DIR__.'/settings.php';
