import {Head, Link, router, useForm} from '@inertiajs/react';
import {type FormEvent, useState} from 'react';
import KonvitteGuestLink from './KonvitteGuestLink';

type Invitation = { id: number; name: string; slug: string | null };
type Table = { id: number; name: string; guestCount: number; capacity: number | null; allocatedSeats: number };
export type KonvitteManagementProps = {
    invitation: Invitation | null;
    invitations: { id: number; name: string }[];
    tables: Table[];
    guests: {
        data: { id: number; name: string; table: string | null; maxGuests: number; slug: string | null }[];
        current_page: number;
        last_page: number;
    };
};

const capacityLabel = (table: Table) => table.capacity === null ? 'Capacidade não definida' : `${table.capacity} lugares`;

export default function KonvitteManagement(props: KonvitteManagementProps & { section: 'tables' | 'guests' }) {
    // Reset forms when switching invitations, including navigation that preserves state.
    return <ManagementForm key={`${props.section}:${props.invitation?.id ?? 'none'}`} {...props}/>;
}

function ManagementForm({invitation, invitations, tables, guests, section}: KonvitteManagementProps & {
    section: 'tables' | 'guests'
}) {
    const isGuest = section === 'guests';
    const title = isGuest ? 'Convidados' : 'Mesas';
    const [showTableForm, setShowTableForm] = useState(false);
    const form = useForm({name: '', tableId: '', tableName: '', tableCapacity: '', maxGuests: '1'});
    const tableForm = useForm({name: '', capacity: ''});
    const selectedTable = tables.find((table) => table.name.toLocaleLowerCase() === form.data.tableName.trim().toLocaleLowerCase());
    const isNewTable = Boolean(form.data.tableName.trim()) && !selectedTable;
    const busy = form.processing || tableForm.processing;
    const submitGuest = (event: FormEvent) => {
        event.preventDefault();
        if (!invitation) return;
        form.transform((data) => ({
            ...data,
            tableId: selectedTable ? String(selectedTable.id) : '',
            tableName: selectedTable ? '' : data.tableName.trim(),
            tableCapacity: isNewTable ? data.tableCapacity : '',
        }));
        form.post(`/backoffice/konvitte/guests/${invitation.id}`, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };
    const submitTable = (event: FormEvent) => {
        event.preventDefault();
        if (!invitation) return;
        tableForm.post(`/backoffice/konvitte/tables/${invitation.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (isGuest) form.setData('tableName', tableForm.data.name.trim());
                tableForm.reset();
                setShowTableForm(false);
            },
        });
    };
    const paginate = (page: number) => router.get(`/backoffice/konvitte/guests/${invitation!.id}`, {page}, {
        preserveState: true,
        preserveScroll: true
    });
    return <><Head title={`${title} — Konvitte`}/>
        <div className="mx-auto max-w-6xl space-y-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div><p className="text-sm text-muted-foreground">Konvitte</p><h1
                    className="mt-1 text-3xl font-semibold">{title}</h1>
                    <p className="mt-2 text-muted-foreground">{isGuest ? 'Registe convidados, associe mesas e defina quantas pessoas cada convite pode levar.' : 'Crie e organize as mesas do seu convite.'}</p>
                </div>
                <label className="field-label w-full md:w-80 md:shrink-0">Convite
                    <select className="field-input" value={invitation?.id ?? ''} disabled={!invitations.length || busy}
                            onChange={(event) => router.get(`/backoffice/konvitte/${section}/${event.target.value}`)}>
                        <option value="" disabled>Selecione um convite</option>
                        {invitations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                </label>
            </header>
            <nav className="form-card flex flex-wrap gap-3">
                <Link className="secondary-button"
                      href={`/backoffice/konvitte/invitations${invitation ? `/${invitation.id}` : '/create'}`}>Convite</Link>
                {invitation && <Link className="secondary-button"
                                     href={`/backoffice/konvitte/${isGuest ? 'tables' : 'guests'}/${invitation.id}`}>{isGuest ? 'Mesas' : 'Convidados'}</Link>}
                {invitation && isGuest &&
                    <button type="button" className="secondary-button" aria-expanded={showTableForm}
                            onClick={() => setShowTableForm(!showTableForm)}>Adicionar apenas uma mesa</button>}
            </nav>
            {invitation ? <>
                {(!isGuest || showTableForm) && <form className="form-card space-y-4" onSubmit={submitTable}>
                    <h2 className="text-lg font-semibold">Adicionar mesa</h2>
                    <p className="text-sm text-muted-foreground">Convite: <strong>{invitation.name}</strong></p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="field-label">Nome da mesa<input className="field-input"
                                                                          value={tableForm.data.name} maxLength={120}
                                                                          required
                                                                          onChange={(event) => tableForm.setData('name', event.target.value)}/>
                            {tableForm.errors.name &&
                                <span role="alert" className="text-destructive">{tableForm.errors.name}</span>}</label>
                        <label className="field-label">Capacidade da mesa<input className="field-input" type="number"
                                                                                min="1" max="999" required
                                                                                value={tableForm.data.capacity}
                                                                                onChange={(event) => tableForm.setData('capacity', event.target.value)}/>
                            <span className="field-hint">Número de pessoas que a mesa suporta.</span>
                            {tableForm.errors.capacity &&
                                <span role="alert" className="text-destructive">{tableForm.errors.capacity}</span>}
                        </label>
                    </div>
                    <button className="action-button sm:w-auto" type="submit"
                            disabled={busy}>{tableForm.processing ? 'A guardar…' : 'Adicionar mesa'}</button>
                </form>}
                {isGuest && <form className="form-card space-y-4" onSubmit={submitGuest}>
                    <h2 className="text-lg font-semibold">Registar convidado</h2>
                    <p className="text-sm text-muted-foreground">Convite: <strong>{invitation.name}</strong></p>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <label className="field-label">Nome do convidado<input className="field-input"
                                                                               value={form.data.name} maxLength={255}
                                                                               required
                                                                               onChange={(event) => form.setData('name', event.target.value)}/>
                            {form.errors.name &&
                                <span role="alert" className="text-destructive">{form.errors.name}</span>}</label>
                        <label className="field-label">Mesa<input className="field-input" list="invitation-tables"
                                                                  value={form.data.tableName} maxLength={120}
                                                                  placeholder="Escolha ou escreva uma nova mesa"
                                                                  onChange={(event) => form.setData('tableName', event.target.value)}/>
                            <datalist id="invitation-tables">{tables.map((table) => <option key={table.id}
                                                                                            value={table.name}>{capacityLabel(table)} · {table.allocatedSeats} lugares
                                previstos</option>)}</datalist>
                            <span
                                className="field-hint">{selectedTable ? `${capacityLabel(selectedTable)} · ${selectedTable.allocatedSeats} lugares previstos` : isNewTable ? 'A nova mesa será criada ao guardar o convidado.' : 'Deixe vazio para registar sem mesa.'}</span>
                            {(form.errors.tableId || form.errors.tableName) && <span role="alert"
                                                                                     className="text-destructive">{form.errors.tableId || form.errors.tableName}</span>}
                        </label>
                        <label className="field-label">Número máximo de convidados<input className="field-input"
                                                                                         type="number" min="1" max="999"
                                                                                         required
                                                                                         value={form.data.maxGuests}
                                                                                         onChange={(event) => form.setData('maxGuests', event.target.value)}/>
                            <span className="field-hint">Total de pessoas deste convite, incluindo acompanhantes.</span>
                            {form.errors.maxGuests &&
                                <span role="alert" className="text-destructive">{form.errors.maxGuests}</span>}</label>
                        {isNewTable &&
                            <label className="field-label">Capacidade da nova mesa<input className="field-input"
                                                                                         type="number" min="1" max="999"
                                                                                         required
                                                                                         value={form.data.tableCapacity}
                                                                                         onChange={(event) => form.setData('tableCapacity', event.target.value)}/>
                                <span className="field-hint">Número de pessoas que a mesa suporta.</span>
                                {form.errors.tableCapacity &&
                                    <span role="alert" className="text-destructive">{form.errors.tableCapacity}</span>}
                            </label>}
                    </div>
                    {selectedTable?.capacity != null && selectedTable.allocatedSeats + Number(form.data.maxGuests) > selectedTable.capacity &&
                        <p role="status" className="text-sm text-destructive">Com este convite, o número de pessoas
                            previsto ultrapassa a capacidade da mesa.</p>}
                    <button className="action-button sm:w-auto" type="submit"
                            disabled={busy}>{form.processing ? 'A guardar…' : 'Registar convidado'}</button>
                </form>}
                <section className="form-card overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b text-muted-foreground">
                        <tr>
                            <th className="p-3">Nome</th>
                            {isGuest ? <>
                                    <th className="p-3">Mesa</th>
                                    <th className="p-3">Máximo de pessoas</th>
                                    <th className="p-3">Ligação</th>
                                    <th className="p-3">Convite</th>
                                </> :
                                <>
                                    <th className="p-3">Capacidade</th>
                                    <th className="p-3">Lugares previstos</th>
                                    <th className="p-3">Convidados registados</th>
                                </>}
                        </tr>
                        </thead>
                        <tbody className="divide-y">{isGuest ? guests.data.map((guest) => <tr key={guest.id}>
                            <td className="p-3">{guest.name}</td>
                            <td className="p-3">{guest.table ?? 'Sem mesa'}</td>
                            <td className="p-3">{guest.maxGuests}</td>
                            <td className="p-3">{invitation.slug && guest.slug ?
                                <KonvitteGuestLink key={`${invitation.slug}/${guest.slug}`}
                                                   invitationSlug={invitation.slug} guestSlug={guest.slug}/> :
                                <span className="text-muted-foreground">Ligação indisponível</span>}</td>
                            <td className="p-3">{invitation.slug && guest.slug &&
                                <a className="underline" target="_blank" rel="noreferrer"
                                   href={`/konvitte/${invitation.slug}/convidado/${guest.slug}`}>Abrir convite</a>}</td>
                        </tr>) : tables.map((table) => <tr key={table.id}>
                            <td className="p-3">{table.name}</td>
                            <td className="p-3">{capacityLabel(table)}</td>
                            <td className="p-3">{table.allocatedSeats}</td>
                            <td className="p-3">{table.guestCount}</td>
                        </tr>)}{!(isGuest ? guests.data.length : tables.length) && <tr>
                            <td className="p-8 text-center text-muted-foreground"
                                colSpan={isGuest ? 5 : 4}>{isGuest ? 'Ainda não existem convidados.' : 'Ainda não existem mesas.'}</td>
                        </tr>}</tbody>
                    </table>
                    {isGuest && guests.last_page > 1 && <div className="mt-4 flex items-center justify-between">
                        <button className="secondary-button disabled:opacity-50"
                                disabled={guests.current_page <= 1 || busy}
                                onClick={() => paginate(guests.current_page - 1)}>Anterior
                        </button>
                        <span>Página {guests.current_page} de {guests.last_page}</span>
                        <button className="secondary-button disabled:opacity-50"
                                disabled={guests.current_page >= guests.last_page || busy}
                                onClick={() => paginate(guests.current_page + 1)}>Seguinte
                        </button>
                    </div>}
                </section>
            </> : <section className="form-card">Crie e guarde um convite antes de adicionar mesas ou
                convidados.</section>}
        </div>
    </>;
}
