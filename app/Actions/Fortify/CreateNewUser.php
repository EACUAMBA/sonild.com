<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Models\User;
use App\Services\KonvitteRegistrationGroup;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => [...$this->passwordRules(), \Illuminate\Validation\Rules\Password::min(12)->mixedCase()->numbers()->symbols()],
        ], ['required' => 'O campo :attribute é obrigatório.', 'email.email' => 'Introduza um email válido.', 'email.unique' => 'Este email já tem uma conta.', 'password.confirmed' => 'As palavras-passe não coincidem.'])->validate();
        return DB::transaction(function () use ($input) {
            $user = User::create(['name' => $input['name'], 'email' => $input['email'], 'password' => $input['password']]);
            $user->userGroups()->attach(KonvitteRegistrationGroup::ensure());
            return $user;
        });
    }
}
