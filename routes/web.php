<?php

use App\Http\Controllers\Backoffice\BackofficeController;
use Filament\Facades\Filament;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

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
    });
});

require __DIR__.'/settings.php';
