import {Head, Link, router} from '@inertiajs/react';
import {Eye, Pencil, Plus, Trash2} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';

type Invitation = { id: number; name: string; type: string | null; date: string | null; slug: string | null };
type Props = { invitations: { data: Invitation[]; current_page: number; last_page: number; total: number } };

export default function KonvitteInvitations({invitations}: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const remove = (invitation: Invitation) => {
        if (!window.confirm(`Delete the invitation for ${invitation.name}? Its guests, tables and public links will also be removed. This cannot be undone.`)) return;
        setDeletingId(invitation.id);
        router.delete(`/backoffice/konvitte/invitations/${invitation.id}`, {
            onSuccess: () => toast.success('Invitation deleted.'),
            onError: () => toast.error('Could not delete the invitation. Please try again.'),
            onFinish: () => setDeletingId(null),
        });
    };
    return <><Head title="Konvitte Invitations"/>
        <div className="mx-auto max-w-6xl space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div><p className="text-sm text-muted-foreground">Konvitte</p><h1
                    className="mt-1 text-3xl font-semibold">Invitations</h1><p
                    className="mt-2 text-muted-foreground">Manage your invitations, dates and guests.</p></div>
                <Link className="action-button sm:w-auto" href="/backoffice/konvitte/invitations/create"><Plus
                    className="mr-2 size-4"/>New invitation</Link></header>
            <section className="form-card">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left text-sm">
                        <thead className="border-b text-muted-foreground">
                        <tr>
                            <th className="p-3">Invitation</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y">{invitations.data.map((invitation) => <tr key={invitation.id}>
                            <td className="p-3 font-medium">{invitation.name}</td>
                            <td className="p-3">{invitation.type ?? '—'}</td>
                            <td className="p-3">
                                <time
                                    dateTime={invitation.date ?? undefined}>{invitation.date ? invitation.date.split('-').reverse().join('/') : '—'}</time>
                            </td>
                            <td className="p-3">
                                <div className="flex flex-wrap items-center gap-4"><Link
                                    className="inline-flex items-center gap-1 hover:underline"
                                    href={`/backoffice/konvitte/guests/${invitation.id}`}
                                    aria-label={`View guests for ${invitation.name}`}><Eye className="size-4"/>View
                                    guests</Link><Link className="inline-flex items-center gap-1 hover:underline"
                                                       href={`/backoffice/konvitte/invitations/${invitation.id}`}
                                                       aria-label={`Edit ${invitation.name}`}><Pencil
                                    className="size-4"/>Edit</Link>
                                    <button type="button"
                                            className="inline-flex items-center gap-1 text-destructive hover:underline disabled:opacity-50"
                                            disabled={deletingId !== null} onClick={() => remove(invitation)}
                                            aria-label={`Delete ${invitation.name}`}><Trash2
                                        className="size-4"/>{deletingId === invitation.id ? 'Deleting…' : 'Delete'}
                                    </button>
                                </div>
                            </td>
                        </tr>)}{!invitations.data.length && <tr>
                            <td className="p-10 text-center text-muted-foreground" colSpan={4}>No invitations yet.
                                Create your first invitation to get started.
                            </td>
                        </tr>}</tbody>
                    </table>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <span>{invitations.total} invitation(s)</span>{invitations.last_page > 1 &&
                    <nav className="flex items-center gap-4"
                         aria-label="Invitation pages">{invitations.current_page > 1 &&
                        <Link className="secondary-button"
                              href={`/backoffice/konvitte/invitations?page=${invitations.current_page - 1}`}>Previous</Link>}<span>Page {invitations.current_page} of {invitations.last_page}</span>{invitations.current_page < invitations.last_page &&
                        <Link className="secondary-button"
                              href={`/backoffice/konvitte/invitations?page=${invitations.current_page + 1}`}>Next</Link>}
                    </nav>}</div>
            </section>
        </div>
    </>;
}
