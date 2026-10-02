<?php

use Filament\Facades\Filament;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('email/verify', fn() => redirect(
    Filament::getPanel('backoffice')->getEmailVerificationPromptUrl(),
))->middleware('auth')->name('verification.notice');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

});

require __DIR__.'/settings.php';
