import {Head, router, useForm} from '@inertiajs/react';
import {Edit3, Plus, Tags, Trash2, X} from 'lucide-react';
import {type FormEvent, useState} from 'react';

type EventType = { id: number; name: string; code: string; eventos_count?: number };
type Props = { eventTypes: EventType[] };

export default function EventTypes({eventTypes}: Props) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingType, setEditingType] = useState<EventType | null>(null);
    const form = useForm({name: '', code: ''});
    const openCreate = () => {
        setEditingType(null);
        form.reset();
        setFormOpen(true);
    };
    const openEdit = (type: EventType) => {
        setEditingType(type);
        form.setData({name: type.name, code: type.code});
        setFormOpen(true);
    };
    const closeForm = () => {
        setFormOpen(false);
        setEditingType(null);
        form.reset();
    };
    const submit = (event: FormEvent) => {
        event.preventDefault();
        const options = {onSuccess: closeForm};
        if (editingType) form.put(`/backoffice/eventtu/event-types/${editingType.id}`, options); else form.post('/backoffice/eventtu/event-types', options);
    };
    const destroy = (type: EventType) => {
        if (window.confirm(`Eliminar o tipo “${type.name}”?`)) router.delete(`/backoffice/eventtu/event-types/${type.id}`);
    };
    return <><Head title="Eventtu — Tipos de eventos"/>
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div><p className="text-sm text-muted-foreground">Eventtu</p><h1
                    className="mt-1 text-3xl font-semibold tracking-tight">Tipos de eventos</h1><p
                    className="mt-2 text-muted-foreground">Configure os tipos que podem ser usados nos eventos.</p>
                </div>
                <button className="action-button sm:w-auto" onClick={openCreate}><Plus className="mr-2 size-4"/>Novo
                    tipo de evento
                </button>
            </div>
            <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b px-5 py-4"><Tags className="size-5 text-primary"/><h2
                    className="font-semibold">Tipos registados</h2><span
                    className="ml-auto rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{eventTypes.length}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left text-sm">
                        <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                            <th className="px-5 py-3">Nome</th>
                            <th className="px-5 py-3">Código</th>
                            <th className="px-5 py-3">Eventos associados</th>
                            <th className="px-5 py-3 text-right">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y">{eventTypes.map((type) => <tr key={type.id}
                                                                                  className="hover:bg-muted/30">
                            <td className="px-5 py-4 font-medium">{type.name}</td>
                            <td className="px-5 py-4"><code
                                className="rounded bg-muted px-2 py-1 text-xs">{type.code}</code></td>
                            <td className="px-5 py-4 text-muted-foreground">{type.eventos_count ?? 0}</td>
                            <td className="px-5 py-4">
                                <div className="flex justify-end gap-1">
                                    <button
                                        className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                                        onClick={() => openEdit(type)} title="Editar"><Edit3 className="size-4"/>
                                    </button>
                                    <button
                                        className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => destroy(type)} title="Eliminar"><Trash2 className="size-4"/>
                                    </button>
                                </div>
                            </td>
                        </tr>)}{!eventTypes.length && <tr>
                            <td className="px-5 py-12 text-center text-muted-foreground" colSpan={4}>Nenhum tipo de
                                evento registado.
                            </td>
                        </tr>}</tbody>
                    </table>
                </div>
            </section>
            {formOpen &&
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog"
                     aria-modal="true">
                    <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div><h2
                                className="text-lg font-semibold">{editingType ? 'Editar tipo de evento' : 'Novo tipo de evento'}</h2>
                                <p className="mt-1 text-sm text-muted-foreground">O código é gerado automaticamente se
                                    ficar vazio.</p></div>
                            <button className="rounded-md p-2 text-muted-foreground hover:bg-muted" onClick={closeForm}
                                    aria-label="Fechar formulário"><X className="size-4"/></button>
                        </div>
                        <form className="mt-6 space-y-4" onSubmit={submit}><label className="field-label">Nome<input
                            autoFocus className="field-input" value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)} placeholder="Ex.: Casamento"
                            required/></label><label className="field-label">Código <span
                            className="font-normal text-muted-foreground">(opcional)</span><input
                            className="field-input" value={form.data.code}
                            onChange={(e) => form.setData('code', e.target.value)}
                            placeholder="Ex.: CASAMENTO"/></label>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button"
                                        className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                                        onClick={closeForm}>Cancelar
                                </button>
                                <button
                                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                                    disabled={form.processing}
                                    type="submit">{form.processing ? 'A guardar…' : editingType ? 'Guardar alterações' : 'Criar tipo'}</button>
                            </div>
                        </form>
                    </div>
                </div>}</div>
    </>;
}
