import {Head, useForm} from '@inertiajs/react';
import {CalendarDays, Edit3, Plus, X} from 'lucide-react';
import {type FormEvent, useState} from 'react';
import DatePicker from '@/components/backoffice/DatePicker';
import SelectField from '@/components/backoffice/SelectField';

type EventType = { id: number; name: string; code: string };
type Evento = { id: number; nome: string; data: string; eventType: { name: string; code: string } | null };
type Props = { eventos: { data: Evento[] }; eventTypes: EventType[] };

const formatDate = (value: string) => new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'long',
    timeStyle: 'short'
}).format(new Date(value));

export default function Events({eventos, eventTypes}: Props) {
    const [formOpen, setFormOpen] = useState(false);
    const eventForm = useForm({nome: '', data: '', eventtuEventTypeId: ''});
    const closeForm = () => {
        setFormOpen(false);
        eventForm.reset();
    };
    const submitEvent = (event: FormEvent) => {
        event.preventDefault();
        eventForm.post('/backoffice/eventtu/eventos', {onSuccess: closeForm});
    };
    return <><Head title="Eventtu — Eventos"/>
        <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div><p className="text-sm text-muted-foreground">Eventtu</p><h1
                    className="mt-1 text-3xl font-semibold tracking-tight">Eventos</h1><p
                    className="mt-2 text-muted-foreground">Crie e consulte os eventos registados.</p></div>
                <button className="action-button sm:w-auto" onClick={() => setFormOpen(true)}><Plus
                    className="mr-2 size-4"/>Novo evento
                </button>
            </div>
            <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b px-5 py-4"><CalendarDays
                    className="size-5 text-primary"/><h2 className="font-semibold">Eventos registados</h2><span
                    className="ml-auto rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{eventos.data.length}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-sm">
                        <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                            <th className="px-5 py-3">Nome</th>
                            <th className="px-5 py-3">Data</th>
                            <th className="px-5 py-3">Tipo de evento</th>
                            <th className="px-5 py-3 text-right">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y">{eventos.data.map((evento) => <tr key={evento.id}
                                                                                      className="hover:bg-muted/30">
                            <td className="px-5 py-4 font-medium">{evento.nome}</td>
                            <td className="px-5 py-4 text-muted-foreground">{formatDate(evento.data)}</td>
                            <td className="px-5 py-4"><span
                                className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{evento.eventType?.name ?? 'Sem tipo'}</span>
                            </td>
                            <td className="px-5 py-4">
                                <div className="flex justify-end">
                                    <button
                                        className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                                        title="Editar em breve"><Edit3 className="size-4"/></button>
                                </div>
                            </td>
                        </tr>)}{!eventos.data.length && <tr>
                            <td className="px-5 py-12 text-center text-muted-foreground" colSpan={4}>Nenhum evento
                                criado.
                            </td>
                        </tr>}</tbody>
                    </table>
                </div>
            </section>
            <p className="text-sm text-muted-foreground"><a className="text-primary hover:underline"
                                                            href="/backoffice/eventtu/event-types">Gerir tipos de
                eventos</a></p>{formOpen &&
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog"
                 aria-modal="true">
                <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl">
                    <div className="flex items-start justify-between gap-4">
                        <div><h2 className="text-lg font-semibold">Novo evento</h2><p
                            className="mt-1 text-sm text-muted-foreground">Preencha os dados principais do evento.</p>
                        </div>
                        <button className="rounded-md p-2 text-muted-foreground hover:bg-muted" onClick={closeForm}
                                aria-label="Fechar formulário"><X className="size-4"/></button>
                    </div>
                    <form className="mt-6 space-y-4" onSubmit={submitEvent}><label className="field-label">Nome<input
                        autoFocus className="field-input" value={eventForm.data.nome}
                        onChange={(e) => eventForm.setData('nome', e.target.value)}
                        placeholder="Ex.: Casamento Edilson & Ilda" required/></label><label className="field-label">Data<DatePicker
                        value={eventForm.data.data}
                        onChange={(value) => eventForm.setData('data', value)}/></label><label className="field-label">Tipo
                        de evento<SelectField value={eventForm.data.eventtuEventTypeId}
                                              onChange={(value) => eventForm.setData('eventtuEventTypeId', value)}
                                              options={eventTypes.map((type) => ({
                                                  value: String(type.id),
                                                  label: type.name
                                              }))} placeholder="Selecionar tipo"/></label>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button"
                                    className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                                    onClick={closeForm}>Cancelar
                            </button>
                            <button
                                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                                disabled={eventForm.processing}
                                type="submit">{eventForm.processing ? 'A guardar…' : 'Criar evento'}</button>
                        </div>
                    </form>
                </div>
            </div>}</div>
    </>;
}
