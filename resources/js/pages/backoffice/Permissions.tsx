import {Head, useForm} from '@inertiajs/react';
import {ShieldCheck} from 'lucide-react';
import {FormEvent} from 'react';

type Permission = {
    id: number;
    name: string;
    scope: string;
    module: string;
    resource: string;
    action: string;
    groupsCount: number
};
type Props = { permissions: { data: Permission[] } };
export default function Permissions({permissions}: Props) {
    const form = useForm({name: '', scope: 'backoffice', module: 'ACL', resource: '', action: ''});
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/backoffice/permissions', {onSuccess: () => form.reset()});
    };
    return <><Head title="Permissões"/>
        <div className="mx-auto max-w-7xl space-y-6">
            <div><p className="text-sm text-muted-foreground">Configuração</p><h1
                className="mt-1 text-3xl font-semibold tracking-tight">Permissões</h1><p
                className="mt-2 text-muted-foreground">Defina as ações disponíveis para cada grupo.</p></div>
            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-sm">
                            <thead
                                className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3">Permissão</th>
                                <th className="px-5 py-3">Módulo</th>
                                <th className="px-5 py-3">Recurso</th>
                                <th className="px-5 py-3">Ação</th>
                                <th className="px-5 py-3">Grupos</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y">{permissions.data.map((permission) => <tr key={permission.id}
                                                                                                  className="hover:bg-muted/30">
                                <td className="px-5 py-4 font-medium">{permission.name}</td>
                                <td className="px-5 py-4 text-muted-foreground">{permission.module}</td>
                                <td className="px-5 py-4 text-muted-foreground">{permission.resource}</td>
                                <td className="px-5 py-4 text-muted-foreground">{permission.action}</td>
                                <td className="px-5 py-4 text-muted-foreground">{permission.groupsCount}</td>
                            </tr>)}{!permissions.data.length && <tr>
                                <td className="px-5 py-10 text-center text-muted-foreground" colSpan={5}>Nenhuma
                                    permissão encontrada.
                                </td>
                            </tr>}</tbody>
                        </table>
                    </div>
                </section>
                <section className="h-fit rounded-xl border bg-card p-5 shadow-sm">
                    <div className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary"/><h2
                        className="font-semibold">Nova permissão</h2></div>
                    <form className="mt-5 space-y-4" onSubmit={submit}><label className="field-label">Nome<input
                        className="field-input" value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)} placeholder="Ex.: Gerir utilizadores"
                        required/></label><label className="field-label">Scope<input className="field-input"
                                                                                     value={form.data.scope}
                                                                                     onChange={(e) => form.setData('scope', e.target.value)}
                                                                                     required/></label><label
                        className="field-label">Módulo<input className="field-input" value={form.data.module}
                                                             onChange={(e) => form.setData('module', e.target.value)}
                                                             required/></label><label
                        className="field-label">Recurso<input className="field-input" value={form.data.resource}
                                                              onChange={(e) => form.setData('resource', e.target.value)}
                                                              placeholder="Ex.: user" required/></label><label
                        className="field-label">Ação<input className="field-input" value={form.data.action}
                                                           onChange={(e) => form.setData('action', e.target.value)}
                                                           placeholder="Ex.: update" required/></label>
                        <button className="action-button" disabled={form.processing}
                                type="submit">{form.processing ? 'A criar…' : 'Criar permissão'}</button>
                    </form>
                </section>
            </div>
        </div>
    </>
}
