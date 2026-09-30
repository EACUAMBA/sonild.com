<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['create' => 'Criar evento', 'read' => 'Ler eventos', 'update' => 'Editar eventos', 'delete' => 'Eliminar eventos'] as $action => $name) {
            Permission::updateOrCreate([
                'scope' => 'konvitte',
                'resource' => 'event',
                'action' => $action,
            ], [
                'name' => $name,
                'module' => 'Eventos',
            ]);
        }

        $resources = [
            'user' => 'utilizadores',
            'usergroup' => 'grupos de utilizadores',
        ];

        $actions = [
            'create' => 'Criar',
            'read' => 'Ler',
            'update' => 'Editar',
            'delete' => 'Eliminar',
        ];

        foreach ($resources as $resource => $resourceLabel) {
            foreach ($actions as $action => $actionLabel) {
                Permission::updateOrCreate([
                    'scope' => 'backoffice',
                    'resource' => $resource,
                    'action' => $action,
                ], [
                    'name' => $actionLabel . ' ' . $resourceLabel,
                    'module' => 'ACL',
                ]);
            }
        }

        Permission::updateOrCreate([
            'scope' => 'backoffice',
            'resource' => 'permission',
            'action' => 'read',
        ], [
            'name' => 'Ler permissões',
            'module' => 'ACL',
        ]);
    }
}
