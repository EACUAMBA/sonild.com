<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use Filament\Actions\ViewAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;
use Throwable;

class EditUser extends EditRecord
{
    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [ViewAction::make()->label('Ver')];
    }

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        $record->fill($data);

        if ($record->isDirty('email')) {
            $record->email_verified_at = null;
        }

        $record->save();

        return $record;
    }

    protected function afterSave(): void
    {
        if (!$this->getRecord()->wasChanged('email')) {
            return;
        }

        try {
            $this->getRecord()->sendEmailVerificationNotification();
        } catch (Throwable $exception) {
            report($exception);

            Notification::make()->warning()
                ->title('Utilizador atualizado, mas o email não foi enviado')
                ->body('O utilizador pode pedir um novo link ao iniciar sessão.')
                ->persistent()->send();
        }
    }
}
