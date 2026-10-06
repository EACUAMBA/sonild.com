<?php

namespace App\Http\Controllers\Backoffice;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\User;
use App\Models\UserGroup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class BackofficeController extends Controller
{
    public function dashboard(): Response|RedirectResponse
    {
        if (!request()->user()->hasModulePermission('backoffice', 'ACL') && request()->user()->canManageKonvitte()) return to_route('backoffice.konvitte.invitations.index');
        $this->ensureAccess();
        return Inertia::render('backoffice/Dashboard', [
            'stats' => [
                'users' => User::count(),
                'groups' => UserGroup::count(),
                'permissions' => Permission::count(),
            ],
        ]);
    }

    private function ensureAccess(): void
    {
        abort_unless(request()->user()?->hasModulePermission('backoffice', 'ACL'), 403);
    }

    public function users(): Response
    {
        $this->ensureAccess();
        return Inertia::render('backoffice/Users', [
            'users' => User::query()->with('userGroups:id,name')->latest()->paginate(12)->through(fn(User $user) => [
                'id' => $user->id, 'name' => $user->name, 'email' => $user->email,
                'verified' => $user->email_verified_at !== null,
                'groups' => $user->userGroups->pluck('name')->values(),
            ]),
            'groups' => UserGroup::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function storeUser(Request $request): RedirectResponse
    {
        $this->ensureAccess();
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'email' => ['required', 'email', 'max:255', 'unique:users,email'], 'password' => ['required', 'string', 'min:8'], 'groupId' => ['nullable', 'exists:user_groups,id']]);
        $user = User::create(['name' => $data['name'], 'email' => $data['email'], 'password' => Hash::make($data['password'])]);
        if (!empty($data['groupId'])) $user->userGroups()->sync([$data['groupId']]);
        return back()->with('success', 'Utilizador criado com sucesso.');
    }

    public function groups(): Response
    {
        $this->ensureAccess();
        return Inertia::render('backoffice/Groups', [
            'groups' => UserGroup::query()->withCount(['users', 'permissions'])->with('permissions:id,name')->orderBy('name')->paginate(12)->through(fn(UserGroup $group) => ['id' => $group->id, 'name' => $group->name, 'code' => $group->code, 'usersCount' => $group->users_count, 'permissionsCount' => $group->permissions_count, 'permissions' => $group->permissions->pluck('name')->values()]),
            'permissions' => Permission::query()->orderBy('module')->orderBy('resource')->orderBy('action')->get(['id', 'name', 'module', 'resource', 'action']),
        ]);
    }

    public function storeGroup(Request $request): RedirectResponse
    {
        $this->ensureAccess();
        $data = $request->validate(['name' => ['required', 'string', 'max:255', 'unique:user_groups,name'], 'permissionIds' => ['array'], 'permissionIds.*' => ['integer', 'exists:permissions,id']]);
        $group = UserGroup::create(['name' => $data['name']]);
        $group->permissions()->sync($data['permissionIds'] ?? []);
        return back()->with('success', 'Grupo criado com sucesso.');
    }

    public function permissions(): Response
    {
        $this->ensureAccess();
        return Inertia::render('backoffice/Permissions', ['permissions' => Permission::query()->withCount('userGroups')->orderBy('module')->orderBy('resource')->orderBy('action')->paginate(15)->through(fn(Permission $permission) => ['id' => $permission->id, 'name' => $permission->name, 'scope' => $permission->scope, 'module' => $permission->module, 'resource' => $permission->resource, 'action' => $permission->action, 'groupsCount' => $permission->user_groups_count])]);
    }

    public function storePermission(Request $request): RedirectResponse
    {
        $this->ensureAccess();
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'scope' => ['required', 'string', 'max:80'], 'module' => ['required', 'string', 'max:80'], 'resource' => ['required', 'string', 'max:80'], 'action' => ['required', 'string', 'max:80']]);
        Permission::create($data);
        return back()->with('success', 'Permissão criada com sucesso.');
    }
}
