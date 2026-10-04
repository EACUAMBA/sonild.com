import {router, useForm} from '@inertiajs/react';
import {Plus, UsersRound, X} from 'lucide-react';
import {type FormEvent, useState} from 'react';
import SelectField from '@/components/backoffice/SelectField';

type Mesa = { id: number; nome: string };
type Guest = { id: number; nome: string; numeroMaximoConvidados: number; mesa: string | null; slug: string };
type PaginatedGuests = { data: Guest[]; current_page: number; last_page: number };
type Props = { conviteSlug: string | null; conviteId: number; convidados: PaginatedGuests; mesas: Mesa[] };
const mesaOptions = (mesas: Mesa[]) => mesas.map((mesa) => ({value: String(mesa.id), label: mesa.nome}));

export default function GuestManagement({conviteSlug, conviteId, convidados, mesas}: Props) {
    const [open, setOpen] = useState(false);
    const [mesaOpen, setMesaOpen] = useState(false);
    const guestForm = useForm({nome: '', mesaId: '', numeroMaximoConvidados: '1'});
    const mesaForm = useForm({nome: ''});
    const close = () => {
        setOpen(false);
        setMesaOpen(false);
        guestForm.reset();
        mesaForm.reset();
    };
    const submitGuest = (event: FormEvent) => {
        event.preventDefault();
        guestForm.post(`/backoffice/konvitte/convite/${conviteId}/convidados`, {
            preserveScroll: true,
            onSuccess: close
        });
    };
    const submitMesa = (event: FormEvent) => {
        event.preventDefault();
        mesaForm.post(`/backoffice/konvitte/convite/${conviteId}/mesas`, {
            preserveScroll: true, onSuccess: () => {
                mesaForm.reset();
                setMesaOpen(false);
            }
        });
    };
    const goToPage = (page: number) => router.get(window.location.pathname, {guest_page: page}, {
        preserveState: true,
        preserveScroll: true
    });
    return <section className="form-card">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="form-card-heading mb-0"><UsersRound/>
                <div><h2>Convidados</h2><p>Adicione convidados, associe mesas e defina quantas pessoas cada convite pode
                    levar.</p></div>
            </div>
            <button type="button" className="action-button sm:w-auto" onClick={() => setOpen(true)}><Plus
                className="mr-2 size-4"/>Adicionar convidado
            </button>
        </div>
        <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">Mesa</th>
                    <th className="px-4 py-3">Máximo de pessoas</th>
                    <th className="px-4 py-3">Slug do convidado</th>
                </tr>
                </thead>
                <tbody className="divide-y">{convidados.data.map((guest) => <tr key={guest.id}
                                                                                className="hover:bg-muted/30">
                    <td className="px-4 py-4 font-medium">{guest.nome}</td>
                    <td className="px-4 py-4 text-muted-foreground">{guest.mesa ?? 'Sem mesa'}</td>
                    <td className="px-4 py-4">{guest.numeroMaximoConvidados}</td>
                    <td className="px-4 py-4"><code
                        className="rounded bg-muted px-2 py-1 text-xs">{guest.slug}</code>{conviteSlug && guest.slug &&
                        <a className="ml-3 underline" href={`/konvitte/${conviteSlug}/convidado/${guest.slug}`}
                           target="_blank" rel="noreferrer">Abrir convite</a>}
                    </td>
                </tr>)}{!convidados.data.length && <tr>
                    <td className="px-4 py-10 text-center text-muted-foreground" colSpan={4}>Ainda não existem
                        convidados.
                    </td>
                </tr>}</tbody>
            </table>
        </div>
        {convidados.last_page > 1 && <div className="flex items-center justify-between border-t pt-4 text-sm">
            <button className="rounded-lg border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={convidados.current_page <= 1}
                    onClick={() => goToPage(convidados.current_page - 1)}>Anterior
            </button>
            <span className="text-muted-foreground">Página {convidados.current_page} de {convidados.last_page}</span>
            <button className="rounded-lg border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={convidados.current_page >= convidados.last_page}
                    onClick={() => goToPage(convidados.current_page + 1)}>Seguinte
            </button>
        </div>}{open &&
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog"
             aria-modal="true">
            <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl">
                <div className="flex items-start justify-between gap-4">
                    <div><h2 className="text-lg font-semibold">Adicionar convidado</h2><p
                        className="mt-1 text-sm text-muted-foreground">O slug será criado automaticamente a partir do
                        nome.</p></div>
                    <button className="rounded-md p-2 text-muted-foreground hover:bg-muted" onClick={close}
                            aria-label="Fechar"><X className="size-4"/></button>
                </div>
                <form className="mt-6 space-y-4" onSubmit={submitGuest}><label className="field-label">Nome do convidado<input
                    autoFocus className="field-input" value={guestForm.data.nome}
                    onChange={(e) => guestForm.setData('nome', e.target.value)} placeholder="Ex.: João Munguambe"
                    required/></label>
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto]"><label className="field-label">Mesa<SelectField
                        value={guestForm.data.mesaId} onChange={(value) => guestForm.setData('mesaId', value)}
                        options={mesaOptions(mesas)} placeholder="Sem mesa"/></label>
                        <button type="button" className="secondary-button self-end"
                                onClick={() => setMesaOpen((value) => !value)}><Plus className="mr-1 size-4"/>Nova mesa
                        </button>
                    </div>
                    {mesaOpen &&
                        <div className="rounded-lg border bg-muted/30 p-3"><label className="field-label">Nome da nova
                            mesa<input className="field-input" value={mesaForm.data.nome}
                                       onChange={(e) => mesaForm.setData('nome', e.target.value)}
                                       placeholder="Ex.: Mesa 1"/></label>
                            <button type="button" className="secondary-button mt-3" disabled={mesaForm.processing}
                                    onClick={submitMesa}>{mesaForm.processing ? 'A guardar…' : 'Adicionar mesa'}</button>
                        </div>}<label className="field-label">Número máximo de convidados<input className="field-input"
                                                                                                type="number" min="1"
                                                                                                max="999"
                                                                                                value={guestForm.data.numeroMaximoConvidados}
                                                                                                onChange={(e) => guestForm.setData('numeroMaximoConvidados', e.target.value)}
                                                                                                required/><span
                        className="field-hint">Indica quantas pessoas este convite pode levar.</span></label>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button"
                                className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                                onClick={close}>Cancelar
                        </button>
                        <button
                            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                            disabled={guestForm.processing}
                            type="submit">{guestForm.processing ? 'A guardar…' : 'Adicionar convidado'}</button>
                    </div>
                </form>
            </div>
        </div>}</section>;
}
