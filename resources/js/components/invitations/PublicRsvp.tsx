import {useForm} from '@inertiajs/react';
import {Check, Heart, MailOpen, Send, X} from 'lucide-react';
import {type FormEvent, useEffect, useRef, useState} from 'react';

export type RsvpResponse = { status: 'CONFIRMED' | 'DECLINED' | 'PENDING'; message: string | null };
type Props = { guest: string; url: string | null; response: RsvpResponse | null };
const labels = {
    CONFIRMED: 'Presença confirmada',
    DECLINED: 'Não poderá estar presente',
    PENDING: 'Ainda está indeciso'
};
const choices = [
    {value: 'CONFIRMED', label: 'Sim, estarei presente', hint: 'Vamos celebrar juntos.'},
    {value: 'DECLINED', label: 'Não poderei estar presente', hint: 'Estarei convosco em pensamento.'},
    {value: 'PENDING', label: 'Ainda não tenho a certeza', hint: 'Confirmarei assim que puder.'},
] as const;

export default function PublicRsvp({guest, url, response}: Props) {
    const [open, setOpen] = useState(Boolean(url && !response));
    const [saved, setSaved] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const form = useForm<{ status: RsvpResponse['status'] | ''; message: string }>({
        status: response?.status ?? '',
        message: response?.message ?? ''
    });
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
        if (!open) return;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = overflow;
        };
    }, [open]);
    const close = () => {
        if (form.processing) return;
        setOpen(false);
        triggerRef.current?.focus({preventScroll: true});
    };
    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!url) return;
        form.post(url, {
            preserveScroll: true, onSuccess: () => {
                setSaved(true);
                setOpen(false);
                triggerRef.current?.focus({preventScroll: true});
            }
        });
    };
    return <section id="confirmacao-presenca" className="invitation-section public-rsvp" aria-labelledby="rsvp-heading">
        <div className="public-rsvp-seal" aria-hidden="true"><MailOpen size={28}/></div>
        <p className="invitation-eyebrow"><span/> A sua presença <span/></p>
        <h2 id="rsvp-heading">Um lugar à sua espera</h2>
        <p className="public-rsvp-intro">{guest}, a sua presença torna este dia ainda mais especial.<br/>Diga-nos se
            podemos contar consigo.</p>
        {url ? <>
            {(response || saved) && <p className="public-rsvp-status" role="status"><Check
                size={17}/>{saved ? 'A sua resposta foi guardada. Obrigado pelo carinho!' : labels[response!.status]}
            </p>}
            <button ref={triggerRef} type="button" className="invitation-button" onClick={() => setOpen(true)}><Heart
                size={17}/>{response || saved ? 'Alterar a minha resposta' : 'Confirmar a minha presença'}</button>
            <p className="public-rsvp-note">Pode também deixar uma mensagem aos noivos.</p>
        </> : <p className="public-rsvp-note">Para confirmar, abra a ligação pessoal que recebeu com o seu convite.</p>}
        <dialog ref={dialogRef} className="public-rsvp-dialog" aria-labelledby="rsvp-dialog-title"
                onCancel={(event) => {
                    event.preventDefault();
                    close();
                }} onClose={() => setOpen(false)}>
            <button type="button" className="public-rsvp-close" aria-label="Fechar confirmação de presença"
                    onClick={close} disabled={form.processing}><X size={21}/></button>
            <div className="public-rsvp-seal" aria-hidden="true"><Heart size={25}/></div>
            <p className="invitation-eyebrow">Celebre connosco</p>
            <h2 id="rsvp-dialog-title">Contamos consigo?</h2>
            <p className="public-rsvp-intro">{guest}, reserve um momento para nos dar a sua resposta.</p>
            <form onSubmit={submit} className="public-rsvp-form">
                <fieldset disabled={form.processing}>
                    <legend>A sua presença</legend>
                    {choices.map((choice) => <label className="public-rsvp-choice" key={choice.value}>
                        <input type="radio" name="rsvp-status" value={choice.value}
                               checked={form.data.status === choice.value} required
                               aria-invalid={Boolean(form.errors.status)}
                               aria-describedby={form.errors.status ? 'rsvp-status-error' : undefined}
                               onChange={() => {
                                   setSaved(false);
                                   form.setData('status', choice.value);
                               }}/>
                        <span><strong>{choice.label}</strong><small>{choice.hint}</small></span>
                    </label>)}
                </fieldset>
                {form.errors.status &&
                    <p id="rsvp-status-error" className="public-rsvp-error" role="alert">{form.errors.status}</p>}
                <label className="public-rsvp-message" htmlFor="rsvp-message">Uma mensagem aos
                    noivos <span>(opcional)</span></label>
                <textarea id="rsvp-message" value={form.data.message} onChange={(event) => {
                    setSaved(false);
                    form.setData('message', event.target.value);
                }}
                          rows={4} maxLength={5000} disabled={form.processing}
                          placeholder="Escreva aqui as suas palavras de carinho…"
                          aria-invalid={Boolean(form.errors.message)}
                          aria-describedby={form.errors.message ? 'rsvp-message-error' : undefined}/>
                {form.errors.message &&
                    <p id="rsvp-message-error" className="public-rsvp-error" role="alert">{form.errors.message}</p>}
                <button className="invitation-button" type="submit" disabled={form.processing}><Send
                    size={16}/>{form.processing ? 'A enviar…' : 'Enviar a minha resposta'}</button>
                <button className="public-rsvp-later" type="button" onClick={close} disabled={form.processing}>Responder
                    mais tarde
                </button>
            </form>
        </dialog>
    </section>;
}
