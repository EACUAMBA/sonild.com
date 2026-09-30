<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Auth\Events\Registered;
use Throwable;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;

    protected function afterCreate(): void
    {
        try {
            event(new Registered($this->getRecord()));
        } catch (Throwable $exception) {
            report($exception);

            Notification::make()->warning()
                ->title('Utilizador registado, mas o email não foi enviado')
                ->body('Verifique a configuração de email. O utilizador pode pedir um novo link ao iniciar sessão.')
                ->persistent()->send();
        }
    }
}
