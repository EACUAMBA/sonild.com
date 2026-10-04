import {Check, Copy} from 'lucide-react';
import {useState} from 'react';

type Props = { invitationSlug: string; guestSlug: string };

export default function KonvitteGuestLink({invitationSlug, guestSlug}: Props) {
    const [copied, setCopied] = useState(false);
    const [manualLink, setManualLink] = useState('');
    const copy = async () => {
        const path = `/konvitte/${encodeURIComponent(invitationSlug)}/convidado/${encodeURIComponent(guestSlug)}`;
        const url = new URL(path, window.location.origin).href;
        setCopied(false);
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setManualLink('');
        } catch {
            // Support local HTTP domains where the Clipboard API is unavailable.
            const input = document.createElement('textarea');
            const previousFocus = document.activeElement;
            input.value = url;
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.appendChild(input);
            let succeeded = false;
            try {
                input.select();
                succeeded = document.execCommand('copy');
            } catch {
                succeeded = false;
            } finally {
                input.remove();
                if (previousFocus instanceof HTMLElement) previousFocus.focus();
            }
            setCopied(succeeded);
            setManualLink(succeeded ? '' : url);
        }
    };
    return <div className="space-y-1">
        <button type="button"
                className="inline-flex max-w-xs items-center gap-2 rounded-md border bg-muted/40 px-2 py-1 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={copy} title="Copiar ligação completa do convite"
                aria-label={`Copiar ligação do convite de ${guestSlug}`}>
            <code className="break-all text-xs">{guestSlug}</code>{copied ?
            <Check className="size-4 shrink-0 text-green-600"/> : <Copy className="size-4 shrink-0"/>}</button>
        <p className="text-xs text-muted-foreground" role="status"
           aria-live="polite">{copied ? 'Ligação copiada!' : manualLink ? 'Selecione e copie a ligação abaixo.' : 'Clique para copiar a ligação do convite'}</p>{manualLink &&
        <input aria-label="Ligação do convite para copiar" className="field-input" readOnly value={manualLink}
               onFocus={(event) => event.currentTarget.select()} autoFocus/>}</div>;
}
