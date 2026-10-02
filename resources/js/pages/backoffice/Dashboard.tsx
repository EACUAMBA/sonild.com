import {Head, Link} from '@inertiajs/react';
import {ArrowRight, ShieldCheck, Users, UsersRound} from 'lucide-react';

type Props = { stats: { users: number; groups: number; permissions: number } };
export default function Dashboard({stats}: Props) {
    const cards = [{
        label: 'Utilizadores',
        value: stats.users,
        href: '/backoffice/users',
        icon: Users
    }, {
        label: 'Grupos de utilizadores',
        value: stats.groups,
        href: '/backoffice/groups',
        icon: UsersRound
    }, {label: 'Permissões', value: stats.permissions, href: '/backoffice/permissions', icon: ShieldCheck}];
    return <><Head title="Backoffice"/>
        <div className="mx-auto max-w-7xl space-y-8">
            <div><p className="text-sm text-muted-foreground">Visão geral</p><h1
                className="mt-1 text-3xl font-semibold tracking-tight">Dashboard</h1><p
                className="mt-2 text-muted-foreground">Gerencie os acessos e configurações da plataforma Sonild.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map((card) => {
                const Icon = card.icon;
                return <Link key={card.label} href={card.href}
                             className="group rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="size-5"/></div>
                        <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1"/>
                    </div>
                    <p className="mt-5 text-sm text-muted-foreground">{card.label}</p><p
                    className="mt-1 text-3xl font-semibold">{card.value}</p></Link>;
            })}</div>
            <section className="rounded-xl border bg-card p-6"><h2 className="text-lg font-semibold">Configuração</h2><p
                className="mt-1 text-sm text-muted-foreground">Escolha uma área na barra lateral para começar.</p>
                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3"><Link
                    className="rounded-lg border p-4 hover:bg-muted"
                    href="/backoffice/users"><strong>Utilizadores</strong><span
                    className="mt-1 block text-muted-foreground">Contas e acessos da equipa.</span></Link><Link
                    className="rounded-lg border p-4 hover:bg-muted"
                    href="/backoffice/groups"><strong>Grupos</strong><span className="mt-1 block text-muted-foreground">Perfis de acesso por função.</span></Link><Link
                    className="rounded-lg border p-4 hover:bg-muted"
                    href="/backoffice/permissions"><strong>Permissões</strong><span
                    className="mt-1 block text-muted-foreground">Recursos e ações disponíveis.</span></Link></div>
            </section>
        </div>
    </>
}
