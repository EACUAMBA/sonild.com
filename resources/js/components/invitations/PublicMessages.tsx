import {router, useForm} from '@inertiajs/react';
import {Heart, MessageCircle, Send} from 'lucide-react';
import {type FormEvent, useState} from 'react';

export type GuestMessage = {
    id: number;
    author: string;
    isOwn: boolean;
    text: string | null;
    sentAt: string;
    hiddenByGuest: boolean;
    hiddenByAdmin: boolean
};

export default function PublicMessages({url, messages}: { url: string | null; messages: GuestMessage[] }) {
    const [busy, setBusy] = useState(false);
    const [visibilityError, setVisibilityError] = useState(false);
    const toggleVisibility = (message: GuestMessage) => {
        if (!url || busy || !message.isOwn) return;
        if (message.hiddenByGuest && !window.confirm('Ao mostrar novamente, a sua mensagem e o seu nome ficarão visíveis aos outros convidados deste convite. Deseja continuar?')) return;
        setBusy(true);
        setVisibilityError(false);
        router.patch(`${url}/${message.id}/visibility`, {hidden: !message.hiddenByGuest}, {
            preserveScroll: true, onError: () => setVisibilityError(true), onFinish: () => setBusy(false),
        });
    };
    const form = useForm({text: ''});
    const [saved, setSaved] = useState(false);
    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!url || form.processing) return;
        if (!window.confirm('A sua mensagem será pública para os outros convidados deste convite, juntamente com o seu nome. Deseja publicar?')) return;
        setSaved(false);
        form.post(url, {
            preserveScroll: true, onSuccess: () => {
                form.reset();
                setSaved(true);
            }
        });
    };
    return <section className="invitation-section messages-section" id="mensagens" aria-labelledby="messages-heading">
        <div className="invitation-section-heading"><MessageCircle className="section-icon"/>
            <p className="invitation-eyebrow"><span/>Palavras de carinho<span/></p>
            <h2 id="messages-heading">Mensagens aos noivos</h2></div>
        {url ? <>
            <p>Deixe uma mensagem aos noivos. O seu nome e a mensagem serão visíveis aos outros convidados deste
                convite.</p>
            <form onSubmit={submit} className="invitation-form message-form">
                <label htmlFor="guest-message">A sua mensagem</label>
                <textarea id="guest-message" rows={4} required maxLength={5000} value={form.data.text}
                          disabled={form.processing} aria-invalid={Boolean(form.errors.text)}
                          aria-describedby={form.errors.text ? 'guest-message-error' : undefined}
                          onChange={(event) => {
                              form.setData('text', event.target.value);
                              setSaved(false);
                          }}
                          placeholder="Escreva as suas palavras de carinho…"/>
                {form.errors.text &&
                    <p id="guest-message-error" className="public-rsvp-error" role="alert">{form.errors.text}</p>}
                {saved && <p role="status">Mensagem publicada. Obrigado pelo carinho!</p>}
                <button className="invitation-button" type="submit"
                        disabled={form.processing || !form.data.text.trim()}>
                    <Send size={16}/>{form.processing ? 'A enviar…' : 'Enviar mensagem'}</button>
            </form>
            <h3>Mensagens dos convidados</h3>
            {visibilityError && <p role="alert">Não foi possível alterar a visibilidade. Tente novamente.</p>}
            {messages.length ? <div className="messages-list">{messages.map((message) => <article key={message.id}>
                <Heart size={15} aria-hidden="true"/><strong>{message.author}{message.isOwn ? ' (você)' : ''}</strong><p
                style={{whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'}}>{message.text ?? 'Mensagem oculta'}</p>
                <time dateTime={message.sentAt}>{new Intl.DateTimeFormat('pt-PT', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    timeZone: 'Africa/Maputo'
                }).format(new Date(message.sentAt))}</time>
                {message.isOwn && <div style={{marginTop: 12}}>
                    {message.hiddenByAdmin ? <small>Ocultada pelo gestor do convite.</small> :
                        <button type="button" className="invitation-button invitation-button-outline" disabled={busy}
                                onClick={() => toggleVisibility(message)}>{message.hiddenByGuest ? 'Mostrar novamente' : 'Ocultar mensagem'}</button>}
                </div>}
            </article>)}</div> : <p>Ainda não há mensagens publicadas.</p>}
        </> : <p>Para publicar e consultar as mensagens dos convidados, abra a ligação pessoal do seu convite.</p>}
    </section>;
}
