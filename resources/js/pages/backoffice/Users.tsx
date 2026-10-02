import {Head, useForm} from '@inertiajs/react';
import {UserPlus} from 'lucide-react';
import {FormEvent} from 'react';

type UserRow = { id: number; name: string; email: string; verified: boolean; groups: string[] };
type Group = { id: number; name: string };
type Props = { users: { data: UserRow[]; current_page: number; last_page: number }; groups: Group[] };
export default function Users({users, groups}: Props) {
    const form = useForm({name: '', email: '', password: '', groupId: ''});
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/backoffice/users', {onSuccess: () => form.reset()});
    };
    return <><Head title="Utilizadores"/>
        <div className="mx-auto max-w-7xl space-y-6">
            <div><p className="text-sm text-muted-foreground">Configuração</p><h1
                className="mt-1 text-3xl font-semibold tracking-tight">Utilizadores</h1><p
                className="mt-2 text-muted-foreground">Crie e consulte as contas que utilizam a plataforma.</p></div>
            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[680px] text-left text-sm">
                            <thead
                                className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3">Utilizador</th>
                                <th className="px-5 py-3">Estado</th>
                                <th className="px-5 py-3">Grupos</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y">{users.data.map((user) => <tr key={user.id}
                                                                                      className="hover:bg-muted/30">
                                <td className="px-5 py-4"><p className="font-medium">{user.name}</p><p
                                    className="text-muted-foreground">{user.email}</p></td>
                                <td className="px-5 py-4"><span
                                    className={`rounded-full px-2 py-1 text-xs ${user.verified ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>{user.verified ? 'Verificado' : 'Pendente'}</span>
                                </td>
                                <td className="px-5 py-4 text-muted-foreground">{user.groups.length ? user.groups.join(', ') : 'Sem grupo'}</td>
                            </tr>)}{!users.data.length && <tr>
                                <td className="px-5 py-10 text-center text-muted-foreground" colSpan={3}>Nenhum
                                    utilizador encontrado.
                                </td>
                            </tr>}</tbody>
                        </table>
                    </div>
                </section>
                <section className="h-fit rounded-xl border bg-card p-5 shadow-sm">
                    <div className="flex items-center gap-2"><UserPlus className="size-5 text-primary"/><h2
                        className="font-semibold">Novo utilizador</h2></div>
                    <form className="mt-5 space-y-4" onSubmit={submit}><label className="field-label">Nome<input
                        className="field-input" value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)} required/></label><label
                        className="field-label">Email<input className="field-input" type="email" value={form.data.email}
                                                            onChange={(e) => form.setData('email', e.target.value)}
                                                            required/></label><label className="field-label">Palavra-passe<input
                        className="field-input" type="password" value={form.data.password}
                        onChange={(e) => form.setData('password', e.target.value)} minLength={8}
                        required/></label><label className="field-label">Grupo<select className="field-input"
                                                                                      value={form.data.groupId}
                                                                                      onChange={(e) => form.setData('groupId', e.target.value)}>
                        <option value="">Sem grupo</option>
                        {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
                        <button className="action-button" disabled={form.processing}
                                type="submit">{form.processing ? 'A criar…' : 'Criar utilizador'}</button>
                    </form>
                </section>
            </div>
        </div>
    </>
}
