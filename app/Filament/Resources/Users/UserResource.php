<?php

namespace App\Filament\Resources\Users;

use App\Filament\Forms\Components\GroupRelationSelect;
use App\Filament\Resources\Users\Pages\CreateUser;
use App\Filament\Resources\Users\Pages\EditUser;
use App\Filament\Resources\Users\Pages\ListUsers;
use App\Filament\Resources\Users\Pages\ViewUser;
use App\Filament\Tables\UserGroupsTable;
use App\Models\User;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\TextInput;
use Filament\Infolists\Components\TextEntry;
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
                ->afterStateHydrated(fn(TextInput $component) => $component->state(null))
                ->required(fn(string $operation): bool => $operation === 'create')
                ->dehydrated(fn(?string $state): bool => filled($state))
                ->rule(Password::defaults())->confirmed(),
            TextInput::make('password_confirmation')->label('Confirmar senha')->password()
                ->revealable()->requiredWith('password')->dehydrated(false),
            GroupRelationSelect::make('userGroups')->label('Grupos')
                ->relationship('userGroups', 'name')
                ->tableConfiguration(UserGroupsTable::class)
                ->columnSpanFull(),
        ]);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            TextEntry::make('name')->label('Nome'),
            TextEntry::make('email')->label('Email'),
            TextEntry::make('email_verified_at')->label('Confirmação de email')
                ->dateTime('d/m/Y H:i')->placeholder('Pendente'),
            TextEntry::make('created_at')->label('Registado em')->dateTime('d/m/Y H:i'),
            TextEntry::make('userGroups.name')->label('Grupos')->badge()
                ->placeholder('Sem grupos')->columnSpanFull(),
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
            ->recordActions([
                ViewAction::make()->label('Ver'),
                EditAction::make()->label('Editar'),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListUsers::route('/'),
            'create' => CreateUser::route('/create'),
            'view' => ViewUser::route('/{record}'),
            'edit' => EditUser::route('/{record}/edit'),
        ];
    }
}
