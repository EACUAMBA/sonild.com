import {Link} from '@inertiajs/react';
import {ArrowLeft, CalendarDays, Layers3, Mail, ShieldCheck} from 'lucide-react';
import {home} from '@/routes';
import type {AuthLayoutProps} from '@/types';
import '../../../css/auth.css';

export default function AuthSimpleLayout({children, title, description}: AuthLayoutProps) {
    return <div className="sonild-auth">
        <aside className="sonild-auth-panel">
            <Link href={home()} className="sonild-auth-brand" aria-label="Sonild, página inicial"><span
                className="sonild-auth-mark"><Layers3 size={24}/></span>sonild<span
                className="sonild-auth-platform">PLATAFORMA</span></Link>
            <div className="sonild-auth-presentation"><span
                className="sonild-auth-eyebrow">O SEU ESPAÇO DE GESTÃO</span>
                <h2>Tudo preparado.<br/><span>Para o próximo<br/>grande momento.</span></h2>
                <p>Os seus eventos, convites e convidados. Organizados num só lugar.</p>
                <div className="sonild-auth-products">
                    <div><Mail
                        size={21}/><span><strong>Konvitte</strong><small>Convites digitais e convidados</small></span>
                    </div>
                    <div><CalendarDays
                        size={21}/><span><strong>Eventtu</strong><small>Organização e gestão de eventos</small></span>
                    </div>
                </div>
            </div>
            <p className="sonild-auth-panel-footer">Tecnologia para aproximar pessoas.</p>
        </aside>
        <main className="sonild-auth-main">
            <Link href={home()} className="sonild-auth-back"><ArrowLeft size={16}/> Voltar ao site</Link>
            <div className="sonild-auth-card">
                <div className="sonild-auth-mobile-brand">sonild<span> / PLATAFORMA</span></div>
                <div className="sonild-auth-heading"><span className="sonild-auth-lock"><ShieldCheck size={25}/></span>
                    <p>ÁREA RESERVADA</p><h1>{title}</h1><span>{description}</span></div>
                {children}
                <div className="sonild-auth-help"><ShieldCheck
                    size={16}/><span>Acesso reservado à sua conta Sonild.</span></div>
            </div>
            <footer className="sonild-auth-footer">© {new Date().getFullYear()} Sonild <span>Konvitte · Eventtu</span>
            </footer>
        </main>
    </div>;
}
