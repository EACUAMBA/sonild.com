import KonvitteGuestLink from './KonvitteGuestLink';
import {Head, Link, router, useForm} from '@inertiajs/react';
import {type FormEvent} from 'react';

type Invitation = { id: number; name: string; slug: string | null };
export type KonvitteManagementProps = {
    invitation: Invitation | null;
    invitations: { id: number; name: string }[];
    tables: { id: number; name: string; guestCount: number }[];
    guests: {
        data: { id: number; name: string; table: string | null; maxGuests: number; slug: string | null }[];
        current_page: number;
        last_page: number
    };
};

export default function KonvitteManagement({
                                               invitation,
                                               invitations,
                                               tables,
                                               guests,
                                               section
                                           }: KonvitteManagementProps & { section: 'tables' | 'guests' }) {
    const isGuest = section === 'guests';
    const title = isGuest ? 'Konvitte Guests' : 'Konvitte Tables';
    const form = useForm({name: '', tableId: '', maxGuests: '1'});
    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!invitation) return;
        form.post(`/backoffice/konvitte/${section}/${invitation.id}`, {
            preserveScroll: true,
            onSuccess: () => form.reset()
        });
    };
    const paginate = (page: number) => router.get(`/backoffice/konvitte/guests/${invitation!.id}`, {page}, {
        preserveState: true,
        preserveScroll: true
    });
    return <><Head title={title}/>
        <div className="mx-auto max-w-6xl space-y-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div><p className="text-sm text-muted-foreground">Konvitte</p><h1
                    className="mt-1 text-3xl font-semibold">{title}</h1><p
                    className="mt-2 text-muted-foreground">{isGuest ? 'Manage guests, table assignments and invitation limits.' : 'Create and organise the tables for your invitation.'}</p>
                </div>
                <label className="field-label w-full md:w-80 md:shrink-0">Konvitte Invitation
                    <select className="field-input" value={invitation?.id ?? ''}
                            onChange={(event) => router.get(`/backoffice/konvitte/${section}/${event.target.value}`)}
                            disabled={!invitations.length || form.processing}>
                        <option value="" disabled>Select an invitation</option>
                        {invitations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                </label>
            </header>
            <section className="form-card space-y-4">
                <nav className="flex flex-wrap gap-3"><Link className="secondary-button"
                                                            href={`/backoffice/konvitte/invitations${invitation ? `/${invitation.id}` : '/create'}`}>Konvitte
                    Invitation</Link>{invitation && <Link className="secondary-button"
                                                          href={`/backoffice/konvitte/${isGuest ? 'tables' : 'guests'}/${invitation.id}`}>{isGuest ? 'Konvitte Tables' : 'Konvitte Guests'}</Link>}
                </nav>
            </section>
            {invitation ? <>
                <form className="form-card space-y-4" onSubmit={submit}><h2
                    className="text-lg font-semibold">{isGuest ? 'Add guest' : 'Add table'}</h2><p
                    className="text-sm text-muted-foreground">Invitation: <strong
                    className="text-foreground">{invitation.name}</strong></p>
                    <div className="grid gap-4 sm:grid-cols-3"><label
                        className="field-label">{isGuest ? 'Guest name' : 'Table name'}<input className="field-input"
                                                                                              value={form.data.name}
                                                                                              onChange={(event) => form.setData('name', event.target.value)}
                                                                                              maxLength={isGuest ? 255 : 120}
                                                                                              required/>{form.errors.name &&
                        <span role="alert" className="text-destructive">{form.errors.name}</span>}</label>
                        {isGuest && <><label className="field-label">Table<select className="field-input"
                                                                                  value={form.data.tableId}
                                                                                  onChange={(event) => form.setData('tableId', event.target.value)}>
                            <option value="">No table</option>
                            {tables.map((table) => <option key={table.id} value={table.id}>{table.name}</option>)}
                        </select>{form.errors.tableId &&
                            <span role="alert" className="text-destructive">{form.errors.tableId}</span>}</label><label
                            className="field-label">Maximum guests<input className="field-input" type="number" min="1"
                                                                         max="999" value={form.data.maxGuests}
                                                                         onChange={(event) => form.setData('maxGuests', event.target.value)}
                                                                         required/>{form.errors.maxGuests &&
                            <span role="alert" className="text-destructive">{form.errors.maxGuests}</span>}</label></>}
                    </div>
                    <button className="action-button sm:w-auto" type="submit"
                            disabled={form.processing}>{form.processing ? 'Saving…' : isGuest ? 'Add guest' : 'Add table'}</button>
                </form>
                <section className="form-card overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b text-muted-foreground">
                        <tr>
                            <th className="p-3">Name</th>
                            {isGuest ? <>
                                <th className="p-3">Table</th>
                                <th className="p-3">Maximum guests</th>
                                <th className="p-3">Slug</th>
                                <th className="p-3">Invitation</th>
                            </> : <th className="p-3">Guest entries</th>}</tr>
                        </thead>
                        <tbody className="divide-y">{isGuest ? guests.data.map((guest) => <tr key={guest.id}>
                            <td className="p-3">{guest.name}</td>
                            <td className="p-3">{guest.table ?? 'No table'}</td>
                            <td className="p-3">{guest.maxGuests}</td>
                            <td className="p-3">{invitation.slug && guest.slug ?
                                <KonvitteGuestLink key={`${invitation.slug}/${guest.slug}`}
                                                   invitationSlug={invitation.slug} guestSlug={guest.slug}/> :
                                <span className="text-muted-foreground">Link unavailable</span>}</td>
                            <td className="p-3">{invitation.slug && guest.slug &&
                                <a className="underline" target="_blank" rel="noreferrer"
                                   href={`/konvitte/${invitation.slug}/convidado/${guest.slug}`}>Open
                                    invitation</a>}</td>
                        </tr>) : tables.map((table) => <tr key={table.id}>
                            <td className="p-3">{table.name}</td>
                            <td className="p-3">{table.guestCount}</td>
                        </tr>)}{!(isGuest ? guests.data.length : tables.length) && <tr>
                            <td className="p-8 text-center text-muted-foreground"
                                colSpan={isGuest ? 5 : 2}>{isGuest ? 'No guests yet.' : 'No tables yet.'}</td>
                        </tr>}</tbody>
                    </table>
                    {isGuest && guests.last_page > 1 && <div className="mt-4 flex items-center justify-between">
                        <button className="secondary-button disabled:opacity-50" disabled={guests.current_page <= 1}
                                onClick={() => paginate(guests.current_page - 1)}>Previous
                        </button>
                        <span>Page {guests.current_page} of {guests.last_page}</span>
                        <button className="secondary-button disabled:opacity-50"
                                disabled={guests.current_page >= guests.last_page}
                                onClick={() => paginate(guests.current_page + 1)}>Next
                        </button>
                    </div>}
                </section>
            </> : <section className="form-card">Create and save a Konvitte Invitation before adding tables or
                guests.</section>}
        </div>
    </>;
}
