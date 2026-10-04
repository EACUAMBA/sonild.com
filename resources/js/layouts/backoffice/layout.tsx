import {Link, router, usePage} from '@inertiajs/react';
import {
    CalendarDays,
    ChevronDown,
    ChevronRight,
    HeartHandshake,
    LayoutDashboard,
    LogOut,
    Menu,
    Moon,
    PartyPopper,
    Settings2,
    ShieldCheck,
    Sun,
    Tags,
    Users,
    UsersRound,
    X
} from 'lucide-react';
import {type PropsWithChildren, useState} from 'react';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {useAppearance} from '@/hooks/use-appearance';
import {useInitials} from '@/hooks/use-initials';
import {logout} from '@/routes';
import type {Auth} from '@/types/auth';

const nav = [{label: 'Dashboard', href: '/backoffice', icon: LayoutDashboard}];
const accessNav = [
    {label: 'Utilizadores', href: '/backoffice/users', icon: Users},
    {label: 'Grupos de utilizadores', href: '/backoffice/groups', icon: UsersRound},
    {label: 'Permissões', href: '/backoffice/permissions', icon: ShieldCheck},
];

const currentPathStartsWithAccess = (path: string): boolean => accessNav.some((item) => path === item.href || path.startsWith(`${item.href}/`));
const currentPathStartsWithEventtu = (path: string): boolean => path === '/backoffice/eventtu' || path.startsWith('/backoffice/eventtu/');
const currentPathStartsWithKonvitte = (path: string): boolean => path === '/backoffice/konvitte' || path.startsWith('/backoffice/konvitte/');

export default function BackofficeLayout({children}: PropsWithChildren) {
    const page = usePage<{ auth: Auth }>();
    const {auth} = page.props;
    const {resolvedAppearance, updateAppearance} = useAppearance();
    const initials = useInitials();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(() => typeof window !== 'undefined' && currentPathStartsWithAccess(window.location.pathname));
    const [accessOpen, setAccessOpen] = useState(() => typeof window !== 'undefined' && currentPathStartsWithAccess(window.location.pathname));
    const [eventtuOpen, setEventtuOpen] = useState(() => typeof window !== 'undefined' && currentPathStartsWithEventtu(window.location.pathname));
    const [konvitteOpen, setKonvitteOpen] = useState(() => typeof window !== 'undefined' && currentPathStartsWithKonvitte(window.location.pathname));
    const currentPath = page.url.split('?')[0];
    const user = auth.user;
    const toggleTheme = () => updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    const signOut = () => router.post(logout().url);

    return <div className="min-h-screen bg-background text-foreground">
        <aside
            className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-card transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex h-16 items-center justify-between border-b px-6"><Link href="/backoffice"
                                                                                        className="text-xl font-semibold tracking-tight"
                                                                                        onClick={() => setMobileOpen(false)}>Sonild</Link>
                <button className="rounded-md p-2 hover:bg-muted lg:hidden" onClick={() => setMobileOpen(false)}
                        aria-label="Fechar menu"><X className="size-5"/></button>
            </div>
            <div className="px-6 py-5"><p
                className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Administração</p><p
                className="mt-1 text-sm text-muted-foreground">Configuração e acessos</p></div>
            <nav className="flex-1 space-y-1 px-3">{nav.map((item) => {
                const active = currentPath === item.href;
                const Icon = item.icon;
                return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                             className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon
                    className="size-4"/>{item.label}</Link>;
            })}
                <div className="pt-2">
                    <button type="button" onClick={() => setEventtuOpen((open) => !open)} aria-expanded={eventtuOpen}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
                        <CalendarDays className="size-4"/><span
                        className="flex-1 text-left">Eventtu</span>{eventtuOpen ? <ChevronDown className="size-4"/> :
                        <ChevronRight className="size-4"/>}
                    </button>
                    {eventtuOpen && <div className="ml-4 mt-1 space-y-1 border-l pl-3">
                        <Link href="/backoffice/eventtu/eventos" onClick={() => setMobileOpen(false)}
                              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${currentPath.startsWith('/backoffice/eventtu/eventos') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><PartyPopper
                            className="size-4"/>Eventos</Link>
                        <Link href="/backoffice/eventtu/event-types" onClick={() => setMobileOpen(false)}
                              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${currentPath.startsWith('/backoffice/eventtu/event-types') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Tags
                            className="size-4"/>Tipos de eventos</Link>
                    </div>}
                </div>
                <div className="pt-2">
                    <button type="button" onClick={() => setKonvitteOpen((open) => !open)} aria-expanded={konvitteOpen}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
                        <HeartHandshake className="size-4"/><span
                        className="flex-1 text-left">Konvitte</span>{konvitteOpen ? <ChevronDown className="size-4"/> :
                        <ChevronRight className="size-4"/>}
                    </button>
                    {konvitteOpen && <div className="ml-4 mt-1 space-y-1 border-l pl-3">
                        {[{label: 'Konvitte Invitations', path: 'invitations'}, {
                            label: 'Konvitte Tables',
                            path: 'tables'
                        }, {label: 'Konvitte Guests', path: 'guests'}].map((item) => <Link key={item.path}
                                                                                           href={`/backoffice/konvitte/${item.path}`}
                                                                                           onClick={() => setMobileOpen(false)}
                                                                                           className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${currentPath.startsWith(`/backoffice/konvitte/${item.path}`) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{item.label}</Link>)}
                    </div>}
                </div>
                <div className="pt-2">
                    <button type="button" onClick={() => setSettingsOpen((open) => !open)} aria-expanded={settingsOpen}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
                        <Settings2 className="size-4"/><span
                        className="flex-1 text-left">Configurações</span>{settingsOpen ?
                        <ChevronDown className="size-4"/> : <ChevronRight className="size-4"/>}
                    </button>
                    {settingsOpen && <div className="ml-4 mt-1 space-y-1 border-l pl-3">
                        <button type="button" onClick={() => setAccessOpen((open) => !open)} aria-expanded={accessOpen}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
                            <ShieldCheck className="size-4"/><span
                            className="flex-1">Controle de acesso</span>{accessOpen ?
                            <ChevronDown className="size-4"/> : <ChevronRight className="size-4"/>}
                        </button>
                        {accessOpen && <div className="ml-4 space-y-1 border-l pl-3">
                            {accessNav.map((item) => {
                                const active = currentPath === item.href;
                                const Icon = item.icon;
                                return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                                             className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon
                                    className="size-4"/>{item.label}</Link>;
                            })}
                        </div>}
                    </div>}
                </div>
            </nav>
            <div className="border-t p-4">
                <div className="flex items-center gap-3"><Avatar className="size-9"><AvatarImage src={user.avatar}
                                                                                                 alt={user.name}/><AvatarFallback>{initials(user.name)}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{user.name}</p><p
                        className="truncate text-xs text-muted-foreground">{user.email}</p></div>
                    <button className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            onClick={signOut} title="Sair"><LogOut className="size-4"/></button>
                </div>
            </div>
        </aside>
        {mobileOpen && <button className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)}
                               aria-label="Fechar menu"/>}
        <div className="lg:pl-72">
            <header
                className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
                <div className="flex items-center gap-3">
                    <button className="rounded-md p-2 hover:bg-muted lg:hidden" onClick={() => setMobileOpen(true)}
                            aria-label="Abrir menu"><Menu className="size-5"/></button>
                    <div><p className="text-sm font-medium">Sonild</p><p
                        className="hidden text-xs text-muted-foreground sm:block">Backoffice</p></div>
                </div>
                <div className="relative flex items-center gap-2"><Button variant="ghost" size="icon"
                                                                          onClick={toggleTheme}
                                                                          title="Mudar tema">{resolvedAppearance === 'dark' ?
                    <Sun className="size-4"/> : <Moon className="size-4"/>}</Button>
                    <button className="flex items-center gap-2 rounded-lg p-1.5 text-left hover:bg-muted"
                            onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}
                            aria-label="Abrir menu do utilizador"><Avatar className="size-8"><AvatarImage
                        src={user.avatar}
                        alt={user.name}/><AvatarFallback>{initials(user.name)}</AvatarFallback></Avatar><span
                        className="hidden max-w-40 truncate text-sm sm:block">{user.name}</span></button>
                    {profileOpen && <div
                        className="absolute right-0 top-12 z-50 w-64 rounded-xl border bg-popover p-2 text-popover-foreground shadow-lg">
                        <div className="border-b px-3 py-2"><p className="font-medium">{user.name}</p><p
                            className="truncate text-xs text-muted-foreground">{user.email}</p></div>
                        <button
                            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                            onClick={() => {
                                toggleTheme();
                                setProfileOpen(false);
                            }}>{resolvedAppearance === 'dark' ? <Sun className="size-4"/> : <Moon
                            className="size-4"/>}{resolvedAppearance === 'dark' ? 'Tema claro' : 'Tema escuro'}</button>
                        <button
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                            onClick={signOut}><LogOut className="size-4"/>Sair
                        </button>
                    </div>}</div>
            </header>
            <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
    </div>;
}
