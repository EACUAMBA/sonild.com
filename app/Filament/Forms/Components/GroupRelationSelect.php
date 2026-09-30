<?php

namespace App\Filament\Forms\Components;

use App\Livewire\GroupRelationTable;
use Filament\Actions\Action;
use Filament\Forms\Components\ModalTableSelect;
use Livewire\Livewire;

class GroupRelationSelect extends ModalTableSelect
{
    public function getSelectAction(): Action
    {
        return parent::getSelectAction()
            ->label('Adicionar')
            ->icon('heroicon-o-plus')
            ->button()
            ->modalHeading('Adicionar ' . mb_strtolower((string)$this->getLabel()))
            ->modalSubmitActionLabel('Adicionar')
            ->modalCancelActionLabel('Cancelar')
            ->fillForm(['selection' => []])
            ->action(function (array $data): void {
                $this->state(array_values(array_unique([
                    ...($this->getState() ?? []),
                    ...($data['selection'] ?? []),
                ])))->callAfterStateUpdated();
            });
    }

    public function fillStateFromRelationship(): void
    {
        $relationship = $this->getRelationship();

        $this->state($relationship
            ->pluck($relationship->getRelated()->getQualifiedKeyName())
            ->map(fn($id): string => (string)$id)
            ->all());
    }

    public function toEmbeddedHtml(): string
    {
        $table = Livewire::mount(GroupRelationTable::class, [
            'relationshipName' => $this->getRelationshipName(),
            'isDisabled' => $this->isDisabled(),
            $this->applyStateBindingModifiers('wire:model') => $this->getStatePath(),
        ], $this->getLivewire()->getId() . '.' . $this->getStatePath() . '.selected');

        $action = $this->isDisabled() ? '' : $this->getAction('select')->toHtml();

        return $this->wrapEmbeddedHtml(
            '<div style="display: grid; gap: 1rem"><div>' . $action . '</div>' . $table . '</div>',
            labelTag: 'div',
        );
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->multiple()->live()->default([]);
        $this->tableArguments(fn(): array => ['excluded' => $this->getState() ?? []]);
    }
}
