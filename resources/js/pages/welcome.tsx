import useInvitationPalette from '@/hooks/use-invitation-palette';
import PublicMessages, {type GuestMessage} from '@/components/invitations/PublicMessages';
import InvitationGallery from '@/components/invitations/InvitationGallery';
import InvitationMusicPlayer from '@/components/invitations/InvitationMusicPlayer';
import PublicRsvp, {type RsvpResponse} from '@/components/invitations/PublicRsvp';
import {Head} from '@inertiajs/react';
import {
    Armchair,
    CalendarDays,
    ChevronRight,
    CircleAlert,
    Gift,
    Heart,
    MailOpen,
    MessageCircle,
    Send,
    Sparkles,
    Users
} from 'lucide-react';
import {type FormEvent, useEffect, useMemo, useRef, useState} from 'react';
import '../../css/invitation.css';

type InvitationData = {
    notExtendedToChildren?: boolean;
    messagesUrl?: string | null;
    messages?: GuestMessage[];
    rsvpEnabled?: boolean; rsvpUrl?: string | null; rsvp?: RsvpResponse | null;
    groom: string; bride: string; guest: string; date: string; dateLabel: string; dayLabel: string;
    bible: string | null; bibleReference: string | null; table: string; invitationType: string;
    guestLimit: string; children: string; parents: { groom: string; bride: string }; venue: string; address: string;
    coverImage?: string | null;
    heroImage?: string | null;
    informationImage?: string | null;
    music?: string | null;
    musicTitle?: string | null;
    musicArtist?: string | null;
    coupleText?: string | null; celebrationText?: string | null; instructions?: string | null;
    contacts?: { name: string; phone: string | null; email: string | null }[];
    program?: { time: string; title: string; description: string; mapUrl?: string | null }[];
    gallery?: { src: string; alt: string }[];
};

const fallbackInvitation: InvitationData = {
    groom: 'Edilson',
    bride: 'Ilda',
    guest: 'Leia Pedro Munguambe',
    date: '2027-06-26T15:00:00',
    dateLabel: '26 de Junho de 2027',
    dayLabel: 'Sábado',
    bible: '“O amor é paciente, o amor é bondoso. Tudo sofre, tudo crê, tudo espera, tudo suporta.”',
    bibleReference: '1 Coríntios 13:4,7',
    table: 'Mesa Esperança',
    invitationType: 'Convite familiar',
    guestLimit: 'Válido para 3 pessoas',
    children: 'Crianças incluídas',
    parents: {groom: 'Sr. António & D. Rosa Cuamba', bride: 'Sr. Joaquim & D. Helena Munguambe'},
    venue: 'Jardins da Baía',
    address: 'Avenida Marginal, Maputo'
};
const fallbackSchedule: NonNullable<InvitationData['program']> = [{
    time: '15:00',
    title: 'Cerimónia',
    description: 'Celebração na Igreja de São José.'
}, {
    time: '16:30',
    title: 'Fotografias',
    description: 'Registos com a família e pessoas especiais.'
}, {time: '18:00', title: 'Receção', description: 'Cocktail de boas-vindas nos Jardins da Baía.'}, {
    time: '19:30',
    title: 'Jantar',
    description: 'Uma mesa preparada para celebrar o amor.'
}, {time: '21:00', title: 'Festa', description: 'Música, dança e alegria até ao fim da noite.'}];
const fallbackGallery = [{
    src: '/images/invitation-cover.jpeg',
    alt: 'Edilson e Ilda junto ao mar'
}, {src: '/images/invitation-cover.jpeg', alt: 'Momento especial do casal'}, {
    src: '/images/invitation-cover.jpeg',
    alt: 'Celebração de Edilson e Ilda'
}];
const initialMessages = [{
    name: 'Família Cuamba',
    text: 'Que o amor de vocês cresça a cada dia. Estamos muito felizes!'
}, {name: 'Marta & Carlos', text: 'Mal podemos esperar para celebrar este dia tão bonito convosco.'}];

function Flowers({className}: { className: string }) {
    return <svg className={className} viewBox="0 0 420 520" fill="none" aria-hidden="true">
        <defs>
            <linearGradient id="leaf" x2="1" y2="1">
                <stop stopColor="#c2cda9"/>
                <stop offset="1" stopColor="#617760"/>
            </linearGradient>
            <radialGradient id="petal">
                <stop stopColor="#e4c6b5"/>
                <stop offset=".55" stopColor="#f1dfd0"/>
                <stop offset="1" stopColor="#fffaf0"/>
            </radialGradient>
        </defs>
        <g stroke="#7b8965" strokeWidth="1.5">
            <path d="M10 510Q190 320 295 50M45 455Q120 205 80 30M85 407Q250 380 400 230M90 405Q220 240 355 175"/>
            {Array.from({length: 9}, (_, i) => <g key={i}
                                                  transform={`translate(${73 + i * 24} ${416 - i * 42}) rotate(${i * 7 - 25})`}>
                <path d="M0 0Q-69-5-52-63Q-5-53 0 0Z" fill="url(#leaf)" opacity=".75"/>
                <path d="M0 0Q62 1 55-48Q16-46 0 0Z" fill="url(#leaf)" opacity=".6"/>
            </g>)}
            <path
                d="M74 326Q18 282 34 220Q91 248 74 326ZM89 230Q136 204 122 152Q80 177 89 230ZM225 348Q260 293 309 311Q284 360 225 348ZM314 290Q350 243 390 264Q365 307 314 290Z"
                fill="url(#leaf)" opacity=".7"/>
        </g>
        {[{x: 113, y: 330, s: 1}, {x: 201, y: 235, s: 0.82}, {x: 74, y: 163, s: 0.62}].map(({x, y, s}, i) => <g key={i}
                                                                                                                transform={`translate(${x} ${y}) scale(${s})`}>{Array.from({length: 8}, (_, n) =>
            <ellipse key={n} cy="-27" rx="25" ry="42" transform={`rotate(${n * 45})`} fill="url(#petal)"
                     stroke="#d9c5ae" strokeWidth=".6"/>)}
            <circle r="10" fill="#b99a61"/>
            <circle r="5" fill="#d6bb7b"/>
        </g>)}</svg>;
}

function SectionHeading({eyebrow, title, icon}: { eyebrow: string; title: string; icon?: React.ReactNode }) {
    return <div className="invitation-section-heading">{icon}<p className="invitation-eyebrow"><span/>{eyebrow}<span/>
    </p><h2>{title}</h2></div>;
}

function Countdown({date}: { date: string }) {
    const target = useMemo(() => new Date(date).getTime(), [date]);
    const [remaining, setRemaining] = useState(() => Math.max(0, target - Date.now()));
    useEffect(() => {
        const timer = window.setInterval(() => setRemaining(Math.max(0, target - Date.now())), 1000);
        return () => window.clearInterval(timer);
    }, [target]);
    const seconds = Math.floor(remaining / 1000);
    const values = {
        days: Math.floor(seconds / 86400),
        hours: Math.floor((seconds % 86400) / 3600),
        minutes: Math.floor((seconds % 3600) / 60),
        seconds: seconds % 60
    };
    return <div className="countdown-grid">{Object.entries(values).map(([label, value]) => <div
        className="countdown-item" key={label}>
        <strong>{String(value).padStart(2, '0')}</strong><span>{label === 'days' ? 'dias' : label === 'hours' ? 'horas' : label === 'minutes' ? 'minutos' : 'segundos'}</span>
    </div>)}</div>;
}

function CalendarButton({invitation}: { invitation: InvitationData }) {
    const icsDate = new Date(invitation.date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Sonild Eventtu//Wedding//PT\nBEGIN:VEVENT\nDTSTART:${icsDate}\nSUMMARY:Casamento de ${invitation.groom} e ${invitation.bride}\nLOCATION:${invitation.venue}, ${invitation.address}\nEND:VEVENT\nEND:VCALENDAR`;
    return <a className="invitation-button invitation-button-light"
              href={`data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`}
              download={`${invitation.groom}-${invitation.bride}.ics`}><CalendarDays size={17}/>Adicionar ao calendário</a>;
}

export default function Welcome({invitationData}: { invitationData?: InvitationData }) {
    const invitation = invitationData ?? fallbackInvitation;
    const palette = useInvitationPalette(invitation.coverImage);
    const schedule = invitationData ? (invitation.program ?? []) : fallbackSchedule;
    const gallery = invitationData ? (invitation.gallery ?? []) : fallbackGallery;
    const eventDate = new Date(invitation.date);
    const dateOptions = {timeZone: 'Africa/Maputo'};
    const monthLabel = eventDate.toLocaleDateString('pt-PT', {...dateOptions, month: 'long'});
    const dayNumber = eventDate.toLocaleDateString('pt-PT', {...dateOptions, day: 'numeric'});
    const yearLabel = eventDate.toLocaleDateString('pt-PT', {...dateOptions, year: 'numeric'});
    const [opened, setOpened] = useState(false);
    const musicRef = useRef<HTMLAudioElement>(null);
    const openInvitation = () => {
        if (musicRef.current) void musicRef.current.play().catch(() => {
        });
        setOpened(true);
    };
    const closeInvitation = () => {
        musicRef.current?.pause();
        setOpened(false);
    };
    const [rsvp, setRsvp] = useState('CONFIRMED');
    const [rsvpMessage, setRsvpMessage] = useState('');
    const [messages, setMessages] = useState(invitationData ? [] : initialMessages);
    const [messageName, setMessageName] = useState('');
    const [messageText, setMessageText] = useState('');
    const contentRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (opened) contentRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [opened]);
    const submitRsvp = (event: FormEvent) => {
        event.preventDefault();
        window.alert(`Obrigado, ${invitation.guest}! A sua resposta foi registada.`);
    };
    const submitMessage = (event: FormEvent) => {
        event.preventDefault();
        if (!messageName.trim() || !messageText.trim()) return;
        setMessages((current) => [...current, {name: messageName, text: messageText}]);
        setMessageName('');
        setMessageText('');
    };
    return <><Head title={`${invitation.groom} & ${invitation.bride} — Convite de casamento`}>
        <meta name="description" content={`Convite de casamento de ${invitation.groom} e ${invitation.bride}.`}/>
    </Head>
        <main className={`invitation${opened && invitation.music ? ' invitation-with-music' : ''}`} lang="pt"
              style={palette}>
            {invitation.music && <InvitationMusicPlayer key={invitation.music} src={invitation.music}
                                                        title={invitation.musicTitle} artist={invitation.musicArtist}
                                                        visible={opened} audioRef={musicRef}/>}
            {!opened ?
            <section className="invitation-stage invitation-cover-stage" aria-label="Abertura do convite"
                     style={invitation.coverImage ? {backgroundImage: `linear-gradient(180deg, hsl(var(--cover-shade) / .4), hsl(var(--cover-shade) / .8)), url(${JSON.stringify(invitation.coverImage)})`} : invitationData ? {backgroundImage: 'linear-gradient(160deg, var(--olive), var(--ink))'} : undefined}>
                <div className="invitation-frame" aria-hidden="true"/>
                <Flowers className="flowers flowers-left"/>
                <div className="flowers-right"><Flowers className="flowers"/></div>
                <div className="invitation-content"><p className="save-the-date"><Sparkles size={13}/> Save the date</p>
                    <div className="invitation-eyebrow"><span/> UM AMOR, UMA VIDA <span/></div>
                    <h1>{invitation.groom} <span>&amp;</span> {invitation.bride}</h1>
                    <div className="wedding-date"><span>{monthLabel}</span><span
                        className="date-star">✳</span><strong>{dayNumber}</strong><span
                        className="date-star">✳</span><span>{yearLabel}</span></div>
                    <p className="wedding-day">{invitation.dayLabel}</p><p
                        className="bible-quote">{invitation.bible}<small>{invitation.bibleReference}</small></p><p
                        className="invitation-label">Cordialmente convidam</p><h2
                        className="guest-name">{invitation.guest}</h2>
                    <button className="open-invitation" onClick={openInvitation}><MailOpen
                        size={17}/> Abrir <ChevronRight size={17}/></button>
                </div>
            </section> : <div ref={contentRef} className="invitation-page">
                <header className="invitation-hero"
                        style={invitation.heroImage ? {backgroundImage: `linear-gradient(180deg, hsl(var(--cover-shade) / .2), hsl(var(--cover-shade) / .8)), url(${JSON.stringify(invitation.heroImage)})`} : invitationData ? {backgroundImage: 'linear-gradient(160deg, var(--olive), var(--ink))'} : undefined}>
                    <Flowers className="flowers flowers-left"/>
                    <div className="hero-photo"/>
                    <div className="hero-copy"><p className="save-the-date"><Sparkles size={13}/> Save the date</p>
                        <h1>{invitation.groom} <span>&amp;</span> {invitation.bride}</h1><p>{invitation.bible}</p>
                        <small>{invitation.bibleReference}</small></div>
                </header>
                {invitationData?.rsvpEnabled &&
                    <nav className="public-rsvp-shortcut" aria-label="Confirmação de presença">
                        <MailOpen size={18}/><span>A sua presença é especial para nós.</span><a
                        href="#confirmacao-presenca">Confirmar presença <ChevronRight size={16}/></a>
                    </nav>}
                <section className="invitation-section couple-section"><SectionHeading eyebrow="A nossa história"
                                                                                       title="Com as nossas famílias"
                                                                                       icon={<Heart
                                                                                           className="section-icon"/>}/>
                    {invitation.coupleText && <p>{invitation.coupleText}</p>}
                    <div className="couple-names">
                        <div><span>O noivo</span><h3>{invitation.groom}</h3><p>Filho
                            de<br/><strong>{invitation.parents.groom}</strong></p></div>
                        <Heart/>
                        <div><span>A noiva</span><h3>{invitation.bride}</h3><p>Filha
                            de<br/><strong>{invitation.parents.bride}</strong></p></div>
                    </div>
                </section>
                <section className="invitation-section guest-section"><SectionHeading eyebrow="Para si"
                                                                                      title="Celebre connosco"
                                                                                      icon={<Sparkles
                                                                                          className="section-icon"/>}/>
                    {invitation.celebrationText && <p>{invitation.celebrationText}</p>}
                    {invitation.informationImage && <img src={invitation.informationImage} alt="Os noivos" style={{
                        maxWidth: '100%',
                        maxHeight: 400,
                        margin: '20px auto'
                    }}/>}
                    <p className="guest-greeting"><span>Com carinho, para si</span><strong>{invitation.guest}</strong>
                    </p><p>Este dia será
                        ainda mais especial com a sua presença.</p>
                    <div className="guest-card">
                        <div><Armchair size={23} strokeWidth={1.4}
                                       aria-hidden="true"/><span>Mesa</span><strong>{invitation.table}</strong></div>
                        <div><Users size={23} strokeWidth={1.4}
                                    aria-hidden="true"/><span>Lotação</span><strong>{invitation.guestLimit}</strong>
                        </div>
                    </div>
                    {invitation.notExtendedToChildren && <div className="guest-children-alert" role="note">
                        <CircleAlert size={23} aria-hidden="true"/>
                        <div><strong>Convite não extensivo a crianças</strong>
                            <p>Agradecemos a sua compreensão.</p></div>
                    </div>}
                </section>
                <section className="invitation-section date-section"><SectionHeading eyebrow="Marque na agenda"
                                                                                     title="A nossa data"
                                                                                     icon={<CalendarDays
                                                                                         className="section-icon"/>}/>
                    <div className="big-date">
                        <span>{monthLabel}</span><strong>{dayNumber}</strong><span>{yearLabel}</span></div>
                    <p className="wedding-day">{invitation.dayLabel}</p><p>{invitation.venue}<br/>{invitation.address}
                    </p><CalendarButton invitation={invitation}/></section>
                <section className="invitation-section schedule-section"><SectionHeading eyebrow="O programa"
                                                                                         title="Um dia para recordar"/>
                    <div className="timeline">{schedule.map((item) => <div className="timeline-item" key={item.time}>
                        <time>{item.time}</time>
                        <div><h3>{item.title}</h3><p>{item.description}</p>{item.mapUrl &&
                            <a href={item.mapUrl} target="_blank" rel="noreferrer">Ver localização</a>}</div>
                    </div>)}</div>
                </section>
                <section className="invitation-section countdown-section"><SectionHeading eyebrow="A contagem começou"
                                                                                          title="Até ao nosso sim"/><Countdown
                    date={invitation.date}/>
                </section>
                {gallery.length > 0 &&
                    <section className="invitation-section gallery-section"><SectionHeading eyebrow="As nossas memórias"
                                                                                        title="Momentos especiais"/>
                        <InvitationGallery photos={gallery}/>
                    </section>}
                {invitationData?.rsvpEnabled &&
                    <PublicRsvp key={invitationData.rsvpUrl ?? 'general'} guest={invitation.guest}
                                url={invitationData.rsvpUrl ?? null} response={invitationData.rsvp ?? null}/>}
                    {invitationData && <PublicMessages key={invitationData.messagesUrl ?? 'general'}
                                                       url={invitationData.messagesUrl ?? null}
                                                       messages={invitationData.messages ?? []}/>}
                {!invitationData && <>
                    <section className="invitation-section rsvp-section"><SectionHeading eyebrow="A sua presença"
                                                                                     title="Confirme connosco"
                                                                                     icon={<MailOpen
                                                                                         className="section-icon"/>}/>
                    <form onSubmit={submitRsvp} className="invitation-form"><p>Olá, <strong>{invitation.guest}</strong>.
                        Pode confirmar a sua presença e deixar uma mensagem aos noivos.</p><select value={rsvp}
                                                                                                   onChange={(event) => setRsvp(event.target.value)}>
                        <option value="CONFIRMED">Sim, estarei presente</option>
                        <option value="DECLINED">Lamento, não poderei estar</option>
                        <option value="PENDING">Ainda não tenho a certeza</option>
                    </select><textarea value={rsvpMessage} onChange={(event) => setRsvpMessage(event.target.value)}
                                       placeholder="Mensagem para os noivos (opcional)" rows={4}/>
                        <button className="invitation-button" type="submit"><Send size={16}/>Enviar confirmação</button>
                    </form>
                </section>
                <section className="invitation-section messages-section"><SectionHeading eyebrow="Palavras de carinho"
                                                                                         title="Mensagens aos noivos"
                                                                                         icon={<MessageCircle
                                                                                             className="section-icon"/>}/>
                    <div className="messages-list">{messages.map((message, index) => <article
                        key={`${message.name}-${index}`}><Heart size={15}/><p>“{message.text}”</p>
                        <strong>{message.name}</strong></article>)}</div>
                    <form onSubmit={submitMessage} className="invitation-form message-form"><input value={messageName}
                                                                                                   onChange={(event) => setMessageName(event.target.value)}
                                                                                                   placeholder="O seu nome"/><textarea
                        value={messageText} onChange={(event) => setMessageText(event.target.value)}
                        placeholder="Escreva uma mensagem pública" rows={3}/>
                        <button className="invitation-button invitation-button-outline" type="submit">Publicar
                            mensagem
                        </button>
                    </form>
                </section>
                <section className="invitation-section gifts-section"><SectionHeading eyebrow="Com carinho"
                                                                                      title="Sugestões de presentes"
                                                                                      icon={<Gift
                                                                                          className="section-icon"/>}/>
                    <p>A sua presença é o nosso maior presente. Se desejar oferecer algo, pode escolher uma destas
                        opções:</p>
                    <div className="gift-grid">
                        <article><Gift/><h3>Lista de presentes</h3><p>Casa, cozinha e pequenos detalhes para o nosso
                            novo lar.</p>
                            <button className="invitation-button invitation-button-outline"
                                    onClick={() => window.alert('A lista de presentes estará disponível em breve.')}>Ver
                                sugestões
                            </button>
                        </article>
                        <article><Sparkles/><h3>Presente em dinheiro</h3><p>m-Pesa: <strong>84 000
                            2027</strong><br/>e-Mola: <strong>86 000 2027</strong></p>
                            <button className="invitation-button invitation-button-outline"
                                    onClick={() => navigator.clipboard?.writeText('84 000 2027')}>Copiar contacto
                            </button>
                        </article>
                    </div>
                </section>
                </>}
                {invitation.instructions &&
                    <section className="invitation-section"><SectionHeading eyebrow="Informações" title="Orientações"/>
                        <p style={{whiteSpace: 'pre-line'}}>{invitation.instructions}</p></section>}
                {!!invitation.contacts?.length &&
                    <section className="invitation-section"><SectionHeading eyebrow="Fale connosco"
                                                                            title="Contactos"/>{invitation.contacts.map((contact, index) =>
                        <p key={index}><strong>{contact.name}</strong><br/>{contact.phone &&
                            <span>{contact.phone}</span>} {contact.email &&
                            <a href={`mailto:${contact.email}`}>{contact.email}</a>}</p>)}</section>}
                <footer className="invitation-footer invitation-footer-full"><Heart size={17}/><p>Com
                    amor,<br/><strong>{invitation.groom} &amp; {invitation.bride}</strong></p>
                    <div className="eventtu-note"><span>Um convite especial por</span><strong>Sonild
                        Eventtu</strong><small>Convites digitais para momentos inesquecíveis</small></div>
                    <button className="back-to-cover" onClick={closeInvitation}>Voltar à capa</button>
                </footer>
            </div>}</main>
    </>;
}
