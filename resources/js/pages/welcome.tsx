import {Head, Link} from '@inertiajs/react';
import {ArrowDown, ArrowUpRight, CalendarDays, Check, Heart, Mail, Music2, Users} from 'lucide-react';
import '../../css/welcome.css';

export default function Landing() {
    return <div className="sonild-home">
        <Head title="Sonild — Convites e eventos">
            <meta name="description"
                  content="Conheça a Sonild: convites digitais com Konvitte e organização de eventos com Eventtu. Cada detalhe, mais perto de quem importa."/>
        </Head>
        <a className="sonild-skip" href="#conteudo">Saltar para o conteúdo</a>
        <header className="sonild-nav"><a href="/" className="sonild-brand"
                                          aria-label="Sonild, início">sonild<span>®</span></a>
            <nav aria-label="Navegação principal"><a href="#servicos">Os nossos serviços</a><a href="#como-funciona">Como
                funciona</a></nav>
            <Link href="/backoffice" className="sonild-login">Entrar <ArrowUpRight size={17}/></Link></header>
        <main id="conteudo">
            <section className="sonild-hero">
                <div className="sonild-hero-copy"><p className="sonild-kicker"><span/> PARA OS MOMENTOS QUE IMPORTAM</p>
                    <h1>Grandes momentos.<br/><em>Bonitos começos.</em></h1>
                    <p className="sonild-intro">Do primeiro convite ao dia da celebração, damos aos seus eventos um
                        lugar especial no digital.</p>
                    <div className="sonild-actions"><a href="#servicos" className="sonild-button">Conhecer os
                        serviços <ArrowUpRight size={19}/></a><a href="#como-funciona" className="sonild-text-link">Descubra
                        como <ArrowDown size={16}/></a></div>
                    <div className="sonild-hero-note"><Heart size={18}/><span>Pensado para celebrar. Feito para aproximar.</span>
                    </div>
                </div>
                <div className="sonild-showcase" aria-label="Exemplo ilustrativo de um convite digital">
                    <div className="sonild-orbit" aria-hidden="true"/>
                    <span className="sonild-example">UM PEQUENO OLHAR SOBRE O SEU GRANDE DIA</span>
                    <div className="sonild-invite">
                        <div className="sonild-invite-inner"><span>JUNTOS, UMA NOVA HISTÓRIA</span><Heart size={24}/>
                            <h2>O vosso<br/><em>grande dia</em></h2>
                            <div className="sonild-invite-line"/>
                            <p>Um convite com a vossa essência.<br/>Uma memória para guardar.</p><span
                                className="sonild-invite-bottom">COM CARINHO, KONVITTE</span></div>
                    </div>
                    <div className="sonild-floating-note"><span><Check size={18}/></span>
                        <div><strong>Eu vou estar lá!</strong><small>Cada presença faz a diferença.</small></div>
                    </div>
                    <span className="sonild-showcase-caption">O encanto do papel. A simplicidade do digital.</span>
                </div>
            </section>
            <div className="sonild-strip"><span>CONVIDAR</span><span
                aria-hidden="true">✳</span><span>ORGANIZAR</span><span aria-hidden="true">✳</span><span>CELEBRAR</span>
            </div>
            <section id="servicos" className="sonild-services">
                <div className="sonild-section-top">
                    <div><p className="sonild-kicker">O QUE FAZEMOS</p><h2>O seu evento.<br/><em>Todos os detalhes.</em>
                    </h2></div>
                    <p>Duas soluções que se complementam, para cuidar da experiência de quem organiza e de quem é
                        convidado.</p></div>
                <div className="sonild-service-grid">
                    <article className="sonild-service sonild-konvitte">
                        <div className="sonild-service-heading"><Mail size={28}/><span>01 / CONVITES DIGITAIS</span>
                        </div>
                        <h3>Konvitte<span>.</span></h3><p>O primeiro encanto da sua celebração. Um convite digital
                        personalizado, pronto para partilhar com as pessoas especiais.</p>
                        <ul>
                            <li><Check/>Fotografias, música e cores do seu momento</li>
                            <li><Check/>Confirmações de presença e mensagens</li>
                            <li><Check/>Programa, localização e informação dos convidados</li>
                        </ul>
                        <Link href="/backoffice/konvitte/invitations" className="sonild-service-link">Explorar
                            Konvitte <ArrowUpRight/></Link></article>
                    <article className="sonild-service sonild-eventtu">
                        <div className="sonild-service-heading"><CalendarDays size={28}/><span>02 / ORGANIZAÇÃO DE EVENTOS</span>
                        </div>
                        <h3>Eventtu<span>.</span></h3><p>Mais espaço para pensar na celebração. Reúna os seus eventos e
                        mantenha as informações essenciais organizadas num só lugar.</p>
                        <ul>
                            <li><Check/>Registo e gestão dos seus eventos</li>
                            <li><Check/>Organização por tipo de evento</li>
                            <li><Check/>Informação centralizada na plataforma</li>
                        </ul>
                        <Link href="/backoffice/eventtu/eventos" className="sonild-service-link">Explorar
                            Eventtu <ArrowUpRight/></Link></article>
                </div>
                <p className="sonild-access-note">O acesso aos serviços é feito através da sua conta na plataforma.</p>
            </section>
            <section id="como-funciona" className="sonild-how"><p className="sonild-kicker">DO PLANO À CELEBRAÇÃO</p>
                <h2>Menos complicações.<br/><em>Mais momentos.</em></h2>
                <div className="sonild-steps">
                    {[{
                        icon: CalendarDays,
                        title: 'Prepare o seu evento',
                        text: 'Comece pelos detalhes: a data, o local e as pessoas que quer ter por perto.'
                    }, {
                        icon: Music2,
                        title: 'Dê-lhe a sua identidade',
                        text: 'Escolha as fotografias, a música e as palavras que contam a sua história.'
                    }, {
                        icon: Users,
                        title: 'Partilhe e acompanhe',
                        text: 'Envie os convites e acompanhe as confirmações e mensagens dos convidados.'
                    }].map((step, index) => <article key={step.title}><span
                        className="sonild-step-number">0{index + 1}</span>
                        <step.icon size={25}/>
                        <h3>{step.title}</h3><p>{step.text}</p></article>)}
                </div>
            </section>
            <section className="sonild-cta"><span className="sonild-kicker">O PRÓXIMO MOMENTO É SEU</span><h2>Vamos dar
                vida<br/>à sua <em>celebração?</em></h2><Link href="/backoffice" className="sonild-button">Entrar na
                plataforma <ArrowUpRight size={20}/></Link></section>
        </main>
        <footer className="sonild-footer"><a href="/" className="sonild-brand">sonild<span>®</span></a><p>O digital ao
            serviço dos seus momentos.</p><a href="#servicos">Konvitte & Eventtu <ArrowUpRight
            size={15}/></a><small>© {new Date().getFullYear()} Sonild</small></footer>
    </div>;
}
