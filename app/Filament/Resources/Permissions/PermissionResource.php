<?php

namespace App\Filament\Resources\Permissions;

use App\Filament\Resources\Permissions\Pages\ListPermissions;
use App\Models\Permission;
use Filament\Resources\Resource;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use UnitEnum;

/** @extends resource<Permission> */
class PermissionResource extends Resource
{
    protected static ?string $model = Permission::class;

    protected static string|UnitEnum|null $navigationGroup = 'Settings';

    protected static ?string $navigationParentItem = 'Controle de acesso';

    protected static ?string $modelLabel = 'Permissão';

    protected static ?string $pluralModelLabel = 'Permissões';

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')->label('ID')->sortable(),
                TextColumn::make('name')->label('Nome')->searchable()->sortable(),
                TextColumn::make('scope')->label('Scope')->searchable()->sortable(),
                TextColumn::make('resource')->label('Resource')->searchable()->sortable(),
                TextColumn::make('action')->label('Action')->searchable()->sortable(),
                TextColumn::make('created_at')->label('Criado em')->dateTime('d/m/Y H:i')->sortable(),
                TextColumn::make('updated_at')->label('Atualizado em')->dateTime('d/m/Y H:i')->sortable(),
            ])
            ->defaultSort('name')
            ->recordUrl(null)
            ->recordActions([])
            ->toolbarActions([]);
    }

    public static function getPages(): array
    {
        return ['index' => ListPermissions::route('/')];
    }
}
