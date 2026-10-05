import {router, useForm} from '@inertiajs/react';
import {Heart, MessageCircle, Send} from 'lucide-react';
import {type FormEvent, useState} from 'react';

export type GuestMessage = {
    id: number;
    text: string | null;
    sentAt: string;
    hiddenByGuest: boolean;
    hiddenByAdmin: boolean
};

export default function PublicMessages({url, messages}: { url: string | null; messages: GuestMessage[] }) {
    const [busy, setBusy] = useState(false);
    const [visibilityError, setVisibilityError] = useState(false);
    const toggleVisibility = (message: GuestMessage) => {
        if (!url || busy) return;
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
            <p>Deixe uma mensagem aos noivos e recorde as palavras que já enviou.</p>
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
                {saved && <p role="status">Mensagem enviada. Obrigado pelo carinho!</p>}
                <button className="invitation-button" type="submit"
                        disabled={form.processing || !form.data.text.trim()}>
                    <Send size={16}/>{form.processing ? 'A enviar…' : 'Enviar mensagem'}</button>
            </form>
            <h3>As suas mensagens anteriores</h3>
            {visibilityError && <p role="alert">Não foi possível alterar a visibilidade. Tente novamente.</p>}
            {messages.length ? <div className="messages-list">{messages.map((message) => <article key={message.id}>
                <Heart size={15} aria-hidden="true"/><p
                style={{whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'}}>{message.text ?? 'Mensagem oculta'}</p>
                <time dateTime={message.sentAt}>{new Intl.DateTimeFormat('pt-PT', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    timeZone: 'Africa/Maputo'
                }).format(new Date(message.sentAt))}</time>
                <div style={{marginTop: 12}}>
                    {message.hiddenByAdmin ? <small>Ocultada pelo gestor do convite.</small> :
                        <button type="button" className="invitation-button invitation-button-outline" disabled={busy}
                                onClick={() => toggleVisibility(message)}>{message.hiddenByGuest ? 'Mostrar novamente' : 'Ocultar mensagem'}</button>}
                </div>
            </article>)}</div> : <p>Ainda não enviou mensagens.</p>}
        </> : <p>Para enviar e consultar as suas mensagens, abra a ligação pessoal do seu convite.</p>}
    </section>;
}
