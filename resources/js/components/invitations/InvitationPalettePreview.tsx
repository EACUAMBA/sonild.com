import {useEffect, useState} from 'react';
import useInvitationPalette from '@/hooks/use-invitation-palette';

export default function InvitationPalettePreview({file}: { file: File | null }) {
    const [source, setSource] = useState<{ file: File; url: string } | null>(null);
    useEffect(() => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        setSource({file, url});
        return () => URL.revokeObjectURL(url);
    }, [file]);
    const palette = useInvitationPalette(source?.file === file ? source?.url : null);
    if (!file || !palette) return null;
    return <div style={{
        ...palette, marginTop: 12, padding: 16, borderRadius: 12,
        background: 'var(--paper)', color: 'var(--ink)', border: '1px solid var(--border)'
    }}>
        <strong style={{color: 'var(--olive)'}}>Tons do seu convite</strong>
        <div style={{display: 'flex', gap: 8, marginBlock: 10}} aria-label="Paleta extraída da foto de capa">
            {['--olive', '--gold', '--soft', '--cream'].map((colour) => <span key={colour} aria-hidden="true"
                                                                              style={{
                                                                                  width: 28,
                                                                                  height: 28,
                                                                                  borderRadius: '50%',
                                                                                  background: palette[colour as `--${string}`],
                                                                                  border: '1px solid var(--border)'
                                                                              }}/>)}
        </div>
        <small>Ao guardar, o convite usará automaticamente estes tons da fotografia.</small>
    </div>;
}
