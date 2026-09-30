<?php

namespace App\Filament\Resources\UserGroups;

use App\Filament\Resources\UserGroups\Pages\CreateUserGroup;
use App\Filament\Resources\UserGroups\Pages\EditUserGroup;
use App\Filament\Resources\UserGroups\Pages\ListUserGroups;
use App\Models\Permission;
use App\Models\User;
use App\Models\UserGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use UnitEnum;

/** @extends resource<UserGroup> */
class UserGroupResource extends Resource
{
    protected static ?string $model = UserGroup::class;

    protected static string|UnitEnum|null $navigationGroup = 'Settings';

    protected static ?string $navigationParentItem = 'Controle de acesso';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'Grupo de utilizadores';

    protected static ?string $pluralModelLabel = 'Grupos de utilizadores';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')
                ->label('Nome')
                ->required()
                ->maxLength(255)
                ->live(onBlur: true)
                ->afterStateUpdated(fn(Set $set, ?string $state) => $set('code', UserGroup::codeFromName($state ?? ''))),
            TextInput::make('code')
                ->label('Código')
                ->readOnly()
                ->required()
                ->maxLength(255)
                ->unique(ignoreRecord: true)
                ->dehydrated(false)
                ->helperText('Gerado automaticamente a partir do nome.'),
            Select::make('users')
                ->label('Utilizadores')
                ->relationship('users', 'name')
                ->multiple()
                ->searchable(['name', 'email'])
                ->getOptionLabelFromRecordUsing(fn(User $record): string => "{$record->name} ({$record->email})")
                ->columnSpanFull(),
            Select::make('permissions')
                ->label('Permissões')
                ->relationship('permissions', 'name')
                ->multiple()
                ->searchable(['name', 'scope', 'resource', 'action'])
                ->getOptionLabelFromRecordUsing(fn(Permission $record): string => "{$record->name} — {$record->scope} / {$record->resource} / {$record->action}")
                ->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->label('Nome')->searchable()->sortable(),
                TextColumn::make('code')->label('Código')->searchable()->sortable(),
                TextColumn::make('users_count')->label('Utilizadores')->counts('users')->sortable(),
                TextColumn::make('permissions_count')->label('Permissões')->counts('permissions')->sortable(),
                TextColumn::make('created_at')->label('Criado em')->dateTime('d/m/Y H:i')->sortable(),
            ])
            ->defaultSort('name')
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListUserGroups::route('/'),
            'create' => CreateUserGroup::route('/create'),
            'edit' => EditUserGroup::route('/{record}/edit'),
        ];
    }
}
