<?php

namespace App\Livewire;

use App\Filament\Tables\GroupPermissionsTable;
use App\Filament\Tables\GroupUsersTable;
use App\Filament\Tables\UserGroupsTable;
use App\Models\Permission;
use App\Models\User;
use App\Models\UserGroup;
use Filament\Actions\Action;
use Filament\Actions\Concerns\InteractsWithActions;
use Filament\Actions\Contracts\HasActions;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Modelable;
use Livewire\Component;
use Livewire\WithoutUrlPagination;

class GroupRelationTable extends Component implements HasActions, HasForms, HasTable
{
    use InteractsWithActions;
    use InteractsWithForms;
    use InteractsWithTable;
    use WithoutUrlPagination;

    /** @var array<string> */
    #[Modelable]
    public array $state = [];

    #[Locked]
    public string $relationshipName;

    #[Locked]
    public bool $isDisabled = false;

    public function table(Table $table): Table
    {
        [$model, $configuration] = match ($this->relationshipName) {
            'users' => [User::class, GroupUsersTable::class],
            'permissions' => [Permission::class, GroupPermissionsTable::class],
            'userGroups' => [UserGroup::class, UserGroupsTable::class],
        };

        return $configuration::configure($table)
            ->query(fn() => $model::query()->whereKey($this->state))
            ->emptyStateHeading('Nenhum registo adicionado')
            ->emptyStateDescription('Clique em Adicionar para pesquisar e selecionar registos.')
            ->recordActions([
                Action::make('remove')
                    ->label('Remover')
                    ->icon('heroicon-o-x-mark')
                    ->color('danger')
                    ->disabled(fn(): bool => $this->isDisabled)
                    ->action(function (Model $record): void {
                        $this->state = array_values(array_filter(
                            $this->state,
                            fn($id): bool => (string)$id !== (string)$record->getKey(),
                        ));
                        $this->resetPage();
                    }),
            ]);
    }

    public function render(): string
    {
        return '<div>{{ $this->table }}</div>';
    }
}
