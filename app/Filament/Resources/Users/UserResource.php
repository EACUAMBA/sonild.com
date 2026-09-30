<?php

namespace App\Filament\Resources\Users;

use App\Filament\Resources\Users\Pages\CreateUser;
use App\Filament\Resources\Users\Pages\ListUsers;
use App\Models\User;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Validation\Rules\Password;
use UnitEnum;

/** @extends resource<User> */
class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static string|UnitEnum|null $navigationGroup = 'Settings';

    protected static ?string $navigationParentItem = 'Controle de acesso';

    protected static ?int $navigationSort = 0;

    protected static ?string $modelLabel = 'Utilizador';

    protected static ?string $pluralModelLabel = 'Utilizadores';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->label('Nome')->required()->maxLength(255),
            TextInput::make('email')->label('Email')->email()->required()->maxLength(255)
                ->unique(ignoreRecord: true),
            TextInput::make('password')->label('Senha')->password()->revealable()
                ->required()->rule(Password::defaults())->confirmed(),
            TextInput::make('password_confirmation')->label('Confirmar senha')->password()
                ->revealable()->required()->dehydrated(false),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->label('Nome')->searchable()->sortable(),
                TextColumn::make('email')->label('Email')->searchable()->sortable(),
                TextColumn::make('email_verified_at')->label('Confirmação de email')
                    ->dateTime('d/m/Y H:i')->placeholder('Pendente')->sortable(),
                TextColumn::make('user_groups_count')->label('Grupos')->counts('userGroups')->sortable(),
                TextColumn::make('created_at')->label('Registado em')->dateTime('d/m/Y H:i')->sortable(),
            ])
            ->filters([
                TernaryFilter::make('email_verified_at')->label('Email confirmado')->nullable()
                    ->trueLabel('Confirmado')->falseLabel('Pendente'),
            ])
            ->defaultSort('created_at', 'desc')
            ->recordUrl(null);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListUsers::route('/'),
            'create' => CreateUser::route('/create'),
        ];
    }
}
