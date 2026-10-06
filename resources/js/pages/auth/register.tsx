import {Form, Head, Link} from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';

export default function Register() {
    return <><Head title="Criar conta — Sonild"/>
        <Form action="/register" method="post" resetOnSuccess={['password', 'password_confirmation']}
              className="flex flex-col gap-5">
            {({processing, errors}) => <>
                <div className="grid gap-2"><Label htmlFor="name">Nome completo</Label><Input id="name" name="name"
                                                                                              autoComplete="name"
                                                                                              required maxLength={255}
                                                                                              autoFocus/><InputError
                    message={errors.name}/></div>
                <div className="grid gap-2"><Label htmlFor="email">Endereço de email</Label><Input id="email"
                                                                                                   name="email"
                                                                                                   type="email"
                                                                                                   autoComplete="email"
                                                                                                   required
                                                                                                   maxLength={255}/><InputError
                    message={errors.email}/></div>
                <div className="grid gap-2"><Label htmlFor="password">Palavra-passe</Label><PasswordInput id="password"
                                                                                                          name="password"
                                                                                                          autoComplete="new-password"
                                                                                                          required/><p
                    className="text-xs text-muted-foreground">Use pelo menos 12 caracteres, com maiúsculas, minúsculas,
                    números e símbolos.</p><InputError message={errors.password}/></div>
                <div className="grid gap-2"><Label htmlFor="password_confirmation">Confirmar
                    palavra-passe</Label><PasswordInput id="password_confirmation" name="password_confirmation"
                                                        autoComplete="new-password" required/></div>
                <p className="text-sm text-muted-foreground">Receberá um email de confirmação para ativar o acesso ao
                    Konvitte.</p>
                <Button type="submit" disabled={processing}>{processing ? 'A criar conta…' : 'Criar conta'}</Button>
            </>}
        </Form><p className="mt-6 text-center text-sm">Já tem conta? <Link href="/login"
                                                                           className="underline">Entrar</Link></p>
    </>;
}
Register.layout = {
    title: 'Comece com o Konvitte',
    description: 'Crie a sua conta para preparar e gerir os seus convites.'
};
