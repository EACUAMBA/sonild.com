<?php

namespace App\Filament\Tables;

use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Grouping\Group;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class GroupPermissionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->label('Nome')->searchable()->sortable(),
                TextColumn::make('scope')->label('Scope')->searchable()->sortable(),
                TextColumn::make('module')->label('Módulo')->searchable()->sortable(),
                TextColumn::make('resource')->label('Resource')->searchable()->sortable(),
                TextColumn::make('action')->label('Action')->searchable()->sortable(),
            ])
            ->modifyQueryUsing(fn(Builder $query) => $query->whereNotIn('permissions.id', $table->getArguments()['excluded'] ?? []))
            ->defaultSort('name')
            ->groups([Group::make('module')->label('Módulo')->collapsible()])
            ->defaultGroup('module')
            ->paginationPageOptions([10, 25, 50])
            ->defaultPaginationPageOption(10);
    }
}
