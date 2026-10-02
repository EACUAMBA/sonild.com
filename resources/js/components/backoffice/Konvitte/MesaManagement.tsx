import {useForm} from '@inertiajs/react';
import {Plus, Table2, X} from 'lucide-react';
import {type FormEvent, useState} from 'react';

type Mesa = { id: number; nome: string };
type Props = { conviteId: number; mesas: Mesa[] };

export default function MesaManagement({conviteId, mesas}: Props) {
    const [open, setOpen] = useState(false);
    const form = useForm({nome: ''});
    const close = () => {
        setOpen(false);
        form.reset();
    };
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/backoffice/konvitte/convite/${conviteId}/mesas`, {preserveScroll: true, onSuccess: close});
    };
    return <section className="form-card">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="form-card-heading mb-0"><Table2/>
                <div><h2>Mesas</h2><p>Crie e organize as mesas que poderão ser atribuídas aos convidados.</p></div>
            </div>
            <button type="button" className="action-button sm:w-auto" onClick={() => setOpen(true)}><Plus
                className="mr-2 size-4"/>Adicionar mesa
            </button>
        </div>
        <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                    <th className="px-4 py-3">Nome da mesa</th>
                    <th className="px-4 py-3 text-right">Estado</th>
                </tr>
                </thead>
                <tbody className="divide-y">{mesas.map((mesa) => <tr key={mesa.id} className="hover:bg-muted/30">
                    <td className="px-4 py-4 font-medium">{mesa.nome}</td>
                    <td className="px-4 py-4 text-right text-muted-foreground">Disponível</td>
                </tr>)}{!mesas.length && <tr>
                    <td className="px-4 py-10 text-center text-muted-foreground" colSpan={2}>Ainda não existem mesas.
                    </td>
                </tr>}</tbody>
            </table>
        </div>
        {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog"
                      aria-modal="true">
            <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl">
                <div className="flex items-start justify-between gap-4">
                    <div><h2 className="text-lg font-semibold">Adicionar mesa</h2><p
                        className="mt-1 text-sm text-muted-foreground">A mesa ficará disponível no modal de
                        convidados.</p></div>
                    <button className="rounded-md p-2 text-muted-foreground hover:bg-muted" onClick={close}
                            aria-label="Fechar"><X className="size-4"/></button>
                </div>
                <form className="mt-6 space-y-4" onSubmit={submit}><label className="field-label">Nome da mesa<input
                    autoFocus className="field-input" value={form.data.nome}
                    onChange={(e) => form.setData('nome', e.target.value)} placeholder="Ex.: Mesa 1" required/></label>
                    <div className="flex justify-end gap-2">
                        <button type="button"
                                className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                                onClick={close}>Cancelar
                        </button>
                        <button
                            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                            disabled={form.processing}
                            type="submit">{form.processing ? 'A guardar…' : 'Adicionar mesa'}</button>
                    </div>
                </form>
            </div>
        </div>}</section>;
}
