import {CheckOutlined, CopyOutlined} from '@ant-design/icons';
import {Button, Flex, Input, Typography} from 'antd';
import {useState} from 'react';
import {guest as guestRoute} from '@/routes/konvitte';

type Props = { invitationSlug: string; guestSlug: string };

export default function KonvitteGuestLink({invitationSlug, guestSlug}: Props) {
    const [copied, setCopied] = useState(false);
    const [manualLink, setManualLink] = useState('');
    const copy = async () => {
        const path = guestRoute.url({
            slug: encodeURIComponent(invitationSlug),
            guestSlug: encodeURIComponent(guestSlug)
        });
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
    return <Flex vertical gap="small" style={{maxWidth: 280}}>
        <Button onClick={copy} icon={copied ? <CheckOutlined/> : <CopyOutlined/>}
                title="Copiar ligação completa do convite" aria-label={`Copiar ligação do convite de ${guestSlug}`}>
            <Typography.Text ellipsis>{guestSlug}</Typography.Text>
        </Button>
        <Typography.Text type="secondary" role="status"
                         aria-live="polite">{copied ? 'Ligação copiada!' : manualLink ? 'Selecione e copie a ligação abaixo.' : 'Clique para copiar a ligação do convite'}</Typography.Text>
        {manualLink && <Input aria-label="Ligação do convite para copiar" readOnly value={manualLink}
                              onFocus={(event) => event.currentTarget.select()} autoFocus/>}
    </Flex>;
}
