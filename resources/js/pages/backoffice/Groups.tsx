import {Head, useForm} from '@inertiajs/react';
import {UsersRound} from 'lucide-react';
import {FormEvent} from 'react';

type Permission = { id: number; name: string; module: string; resource: string; action: string };
type Group = {
    id: number;
    name: string;
    code: string;
    usersCount: number;
    permissionsCount: number;
    permissions: string[]
};
type Props = { groups: { data: Group[] }; permissions: Permission[] };
export default function Groups({groups, permissions}: Props) {
    const form = useForm<{ name: string; permissionIds: number[] }>({name: '', permissionIds: []});
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/backoffice/groups', {onSuccess: () => form.reset()});
    };
    const toggle = (id: number) => form.setData('permissionIds', form.data.permissionIds.includes(id) ? form.data.permissionIds.filter((item) => item !== id) : [...form.data.permissionIds, id]);
    return <><Head title="Grupos de utilizadores"/>
        <div className="mx-auto max-w-7xl space-y-6">
            <div><p className="text-sm text-muted-foreground">Configuração</p><h1
                className="mt-1 text-3xl font-semibold tracking-tight">Grupos de utilizadores</h1><p
                className="mt-2 text-muted-foreground">Organize permissões por função e atribua-as à equipa.</p></div>
            <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
                <section className="grid gap-4 md:grid-cols-2">{groups.data.map((group) => <article key={group.id}
                                                                                                    className="rounded-xl border bg-card p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div><h2 className="font-semibold">{group.name}</h2><p
                            className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{group.code}</p>
                        </div>
                        <UsersRound className="size-5 text-primary"/></div>
                    <div className="mt-6 flex gap-5 text-sm"><span><strong>{group.usersCount}</strong><small
                        className="ml-1 text-muted-foreground">utilizadores</small></span><span><strong>{group.permissionsCount}</strong><small
                        className="ml-1 text-muted-foreground">permissões</small></span></div>
                    <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{group.permissions.length ? group.permissions.join(', ') : 'Sem permissões atribuídas'}</p>
                </article>)}{!groups.data.length && <div
                    className="rounded-xl border bg-card p-8 text-center text-muted-foreground md:col-span-2">Nenhum
                    grupo encontrado.</div>}</section>
                <section className="h-fit rounded-xl border bg-card p-5 shadow-sm"><h2 className="font-semibold">Novo
                    grupo</h2>
                    <form className="mt-5 space-y-4" onSubmit={submit}><label className="field-label">Nome do
                        grupo<input className="field-input" value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)} placeholder="Ex.: Gestores"
                                    required/></label>
                        <div><p className="field-label">Permissões</p>
                            <div
                                className="mt-2 max-h-64 space-y-2 overflow-y-auto rounded-lg border p-3">{permissions.map((permission) =>
                                <label className="flex cursor-pointer items-start gap-2 text-sm"
                                       key={permission.id}><input type="checkbox"
                                                                  checked={form.data.permissionIds.includes(permission.id)}
                                                                  onChange={() => toggle(permission.id)}/><span><strong>{permission.name}</strong><small
                                    className="block text-muted-foreground">{permission.module} · {permission.resource} · {permission.action}</small></span></label>)}</div>
                        </div>
                        <button className="action-button" disabled={form.processing}
                                type="submit">{form.processing ? 'A criar…' : 'Criar grupo'}</button>
                    </form>
                </section>
            </div>
        </div>
    </>
}
