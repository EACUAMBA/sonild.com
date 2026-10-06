import {Form, Head, Link} from '@inertiajs/react';
import {Button} from '@/components/ui/button';
import InputError from '@/components/input-error';

export default function VerifyEmail({status}: { status?: string }) {
    return <><Head title="Confirme o seu email"/>
        <p className="mb-6 text-sm text-muted-foreground">Enviámos uma ligação para o seu email. Abra a mensagem e
            clique em “Confirmar email” para aceder ao Konvitte. Se não a encontrar, verifique a pasta de spam.</p>
        {status === 'verification-link-sent' &&
            <p role="status" className="sonild-auth-status">Enviámos uma nova ligação de confirmação.</p>}
        <Form action="/email/verification-notification" method="post" className="mt-5 grid gap-4">
            {({processing, errors}) => <><InputError message={errors.email}/><Button type="submit"
                                                                                     disabled={processing}>{processing ? 'A enviar…' : 'Reenviar email de confirmação'}</Button></>}
        </Form><Link href="/logout" method="post" as="button" className="mt-6 text-sm underline">Sair da conta</Link>
    </>;
}
VerifyEmail.layout = {title: 'Falta só confirmar o email', description: 'A sua conta Sonild está quase pronta.'};
