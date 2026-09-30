<?php

namespace App\Filament\Tables;

use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class UserGroupsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->label('Nome')->searchable()->sortable(),
                TextColumn::make('code')->label('Código')->searchable()->sortable(),
            ])
            ->modifyQueryUsing(fn(Builder $query) => $query->whereNotIn('user_groups.id', $table->getArguments()['excluded'] ?? []))
            ->defaultSort('name')
            ->paginationPageOptions([10, 25, 50])
            ->defaultPaginationPageOption(10);
    }
}
