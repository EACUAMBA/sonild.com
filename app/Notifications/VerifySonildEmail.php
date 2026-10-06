<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class VerifySonildEmail extends VerifyEmail
{
    protected function buildMailMessage($url)
    {
        return (new MailMessage)->subject('Confirme o seu email — Sonild')
            ->greeting('Bem-vindo à Sonild!')
            ->line('Confirme o seu endereço de email para começar a gerir os seus convites no Konvitte.')
            ->action('Confirmar email', $url)
            ->line('Esta ligação expira em ' . config('auth.verification.expire', 60) . ' minutos.')
            ->line('Se não criou esta conta, pode ignorar esta mensagem.')
            ->salutation('A equipa Sonild');
    }
}
