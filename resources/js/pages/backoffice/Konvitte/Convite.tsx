import {Head, useForm} from '@inertiajs/react';
import {CalendarDays, FileImage, HeartHandshake, Plus, Save, Trash2, UsersRound} from 'lucide-react';
import {type ChangeEvent, type FormEvent} from 'react';
import DatePicker from '@/components/backoffice/DatePicker';
import SelectField from '@/components/backoffice/SelectField';

type InviteType = { id: number; name: string; code: string };
type ProgramItem = { hora: string; nome: string; localizacao: string; googleMapsLink: string; icon: string };
type Contact = { categoria: string; nome: string; telefone: string; email: string };
type ExistingGallery = { id: number; name: string; url: string };
type ExistingInvite =
    {
        id: number;
        slug: string | null;
        inviteTypeId: number;
        nomeNoiva: string;
        nomeNoivo: string;
        data: string;
        local: string;
        textoBiblico: string | null;
        livroBiblico: string | null;
        fotoCapa: string | null;
        fotoInicial: string | null;
        musica: string | null;
        textoCasal: string | null;
        fotoInformacoes: string | null;
        textoCelebre: string;
        textoOrientacoes: string | null;
        program: ProgramItem[];
        contacts: Contact[];
        gallery: ExistingGallery[]
    }
    | null;
type Props = { inviteTypes: InviteType[]; convite: ExistingInvite };
type FormData = {
    inviteTypeId: string;
    nomeNoiva: string;
    nomeNoivo: string;
    data: string;
    local: string;
    textoBiblico: string;
    livroBiblico: string;
    textoCasal: string;
    textoCelebre: string;
    textoOrientacoes: string;
    fotoCapa: File | null;
    fotoInicial: File | null;
    fotoInformacoes: File | null;
    musica: File | null;
    gallery: File[];
    program: ProgramItem[];
    contacts: Contact[]
};

const icons = [{value: 'church', label: 'Igreja'}, {value: 'camera', label: 'Fotografia'}, {
    value: 'glass',
    label: 'Receção'
}, {value: 'music', label: 'Música'}, {value: 'heart', label: 'Celebração'}, {value: 'calendar', label: 'Agenda'}];
const contactCategories = [{value: 'noivos', label: 'Noivos'}, {
    value: 'pais_noivo',
    label: 'Pais do noivo'
}, {value: 'pais_noiva', label: 'Pais da noiva'}];
const emptyProgram = (): ProgramItem => ({hora: '', nome: '', localizacao: '', googleMapsLink: '', icon: 'calendar'});
const emptyContact = (): Contact => ({categoria: 'noivos', nome: '', telefone: '', email: ''});
const initialData = (convite: ExistingInvite): FormData => ({
    inviteTypeId: convite ? String(convite.inviteTypeId) : '',
    nomeNoiva: convite?.nomeNoiva ?? '',
    nomeNoivo: convite?.nomeNoivo ?? '',
    data: convite?.data ?? '',
    local: convite?.local ?? '',
    textoBiblico: convite?.textoBiblico ?? '',
    livroBiblico: convite?.livroBiblico ?? '',
    textoCasal: convite?.textoCasal ?? '',
    textoCelebre: convite?.textoCelebre ?? 'Com a bênção de Deus e dos nossos pais, ',
    textoOrientacoes: convite?.textoOrientacoes ?? '',
    fotoCapa: null,
    fotoInicial: null,
    fotoInformacoes: null,
    musica: null,
    gallery: [],
    program: convite?.program?.length ? convite.program : [emptyProgram()],
    contacts: convite?.contacts?.length ? convite.contacts : [emptyContact()]
});

export default function Convite({inviteTypes, convite}: Props) {
    const form = useForm<FormData>(initialData(convite));
    const setFile = (key: 'fotoCapa' | 'fotoInicial' | 'fotoInformacoes' | 'musica', event: ChangeEvent<HTMLInputElement>) => form.setData(key, event.target.files?.[0] ?? null);
    const setGallery = (event: ChangeEvent<HTMLInputElement>) => form.setData('gallery', Array.from(event.target.files ?? []));
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(convite ? `/backoffice/konvitte/convite/${convite.id}` : '/backoffice/konvitte/convite', {forceFormData: true});
    };
    const updateProgram = (index: number, key: keyof ProgramItem, value: string) => form.setData('program', form.data.program.map((item, itemIndex) => itemIndex === index ? {
        ...item,
        [key]: value
    } : item));
    const updateContact = (index: number, key: keyof Contact, value: string) => form.setData('contacts', form.data.contacts.map((item, itemIndex) => itemIndex === index ? {
        ...item,
        [key]: value
    } : item));
    const fieldError = (key: keyof FormData) => form.errors[key] ?
        <p className="text-xs text-destructive">{form.errors[key]}</p> : null;
    return <><Head title="Konvitte — Convite"/>
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div><p className="text-sm text-muted-foreground">Konvitte</p><h1
                    className="mt-1 text-3xl font-semibold tracking-tight">Configurar convite</h1><p
                    className="mt-2 text-muted-foreground">Configure o conteúdo do convite de casamento num único
                    formulário.</p>{convite?.slug &&
                    <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">Link
                        reservado: <code
                            className="text-foreground">sonild.test/konvitte/{convite.slug}/convidado</code> <span
                            className="ml-1">(a página pública será ativada depois)</span></p>}</div>
                <button className="action-button sm:w-auto" disabled={form.processing} onClick={submit}><Save
                    className="mr-2 size-4"/>{form.processing ? 'A guardar…' : 'Guardar convite'}</button>
            </div>
            <form className="space-y-6" onSubmit={submit}>
                <section className="form-card">
                    <div className="form-card-heading"><HeartHandshake/>
                        <div><h2>Identidade do convite</h2><p>Escolha o tipo e defina os dados principais.</p></div>
                    </div>
                    <div className="form-grid"><label className="field-label">Tipo de convite<SelectField
                        value={form.data.inviteTypeId} onChange={(value) => form.setData('inviteTypeId', value)}
                        options={inviteTypes.map((type) => ({value: String(type.id), label: type.name}))}
                        placeholder="Selecionar tipo"/>{fieldError('inviteTypeId')}</label><label
                        className="field-label">Nome da noiva<input className="field-input" value={form.data.nomeNoiva}
                                                                    onChange={(e) => form.setData('nomeNoiva', e.target.value)}
                                                                    placeholder="Ex.: Ilda"/>{fieldError('nomeNoiva')}
                    </label><label className="field-label">Nome do noivo<input className="field-input"
                                                                               value={form.data.nomeNoivo}
                                                                               onChange={(e) => form.setData('nomeNoivo', e.target.value)}
                                                                               placeholder="Ex.: Edilson"/>{fieldError('nomeNoivo')}
                    </label><label className="field-label">Data do evento<DatePicker value={form.data.data}
                                                                                     onChange={(value) => form.setData('data', value)}/>{fieldError('data')}
                    </label><label className="field-label">Local<input className="field-input" value={form.data.local}
                                                                       onChange={(e) => form.setData('local', e.target.value)}
                                                                       placeholder="Ex.: Jardins da Baía"/>{fieldError('local')}
                    </label></div>
                </section>
                <section className="form-card">
                    <div className="form-card-heading"><FileImage/>
                        <div><h2>Fotografias e música</h2><p>Todos os ficheiros de imagem têm limite máximo de 5 MB.</p>
                        </div>
                    </div>
                    <div className="form-grid"><label className="field-label">Foto de capa<input className="field-input"
                                                                                                 type="file"
                                                                                                 accept="image/*"
                                                                                                 onChange={(e) => setFile('fotoCapa', e)}/>{convite?.fotoCapa &&
                        <span className="field-hint">Foto de capa já carregada.</span>}</label><label
                        className="field-label">Foto inicial<input className="field-input" type="file" accept="image/*"
                                                                   onChange={(e) => setFile('fotoInicial', e)}/>{convite?.fotoInicial &&
                        <span className="field-hint">Foto inicial já carregada.</span>}</label><label
                        className="field-label">Foto da área dos noivos<input className="field-input" type="file"
                                                                              accept="image/*"
                                                                              onChange={(e) => setFile('fotoInformacoes', e)}/>{convite?.fotoInformacoes &&
                        <span className="field-hint">Foto de informações já carregada.</span>}</label><label
                        className="field-label">Música de fundo<input className="field-input" type="file"
                                                                      accept="audio/mpeg,audio/wav,audio/ogg"
                                                                      onChange={(e) => setFile('musica', e)}/><span
                        className="field-hint">MP3, WAV ou OGG até 20 MB.</span></label></div>
                </section>
                <section className="form-card">
                    <div className="form-card-heading"><HeartHandshake/>
                        <div><h2>Textos e celebração</h2><p>Conte a história e personalize a mensagem de
                            boas-vindas.</p></div>
                    </div>
                    <div className="stack-fields"><label className="field-label">Texto bíblico<textarea
                        className="field-input" rows={3} value={form.data.textoBiblico}
                        onChange={(e) => form.setData('textoBiblico', e.target.value)}
                        placeholder="Escreva o texto bíblico"/></label><label className="field-label">Livro e referência<input
                        className="field-input" value={form.data.livroBiblico}
                        onChange={(e) => form.setData('livroBiblico', e.target.value)}
                        placeholder="Ex.: 1 Coríntios 13:4-7"/></label><label className="field-label">Texto do
                        casal<textarea className="field-input" rows={4} value={form.data.textoCasal}
                                       onChange={(e) => form.setData('textoCasal', e.target.value)}
                                       placeholder="Uma mensagem dos noivos"/></label><label className="field-label">Celebre
                        connosco<textarea className="field-input" rows={3} value={form.data.textoCelebre}
                                          onChange={(e) => form.setData('textoCelebre', e.target.value)}/></label><label
                        className="field-label">Orientações<textarea className="field-input" rows={4}
                                                                     value={form.data.textoOrientacoes}
                                                                     onChange={(e) => form.setData('textoOrientacoes', e.target.value)}
                                                                     placeholder="Dress code, estacionamento, confirmação, etc."/></label>
                    </div>
                </section>
                <section className="form-card">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="form-card-heading mb-0"><CalendarDays/>
                            <div><h2>Programa</h2><p>Adicione atividades com hora, local, mapa e ícone.</p></div>
                        </div>
                        <button type="button" className="secondary-button"
                                onClick={() => form.setData('program', [...form.data.program, emptyProgram()])}><Plus
                            className="mr-2 size-4"/>Adicionar atividade
                        </button>
                    </div>
                    <div className="repeater-list">{form.data.program.map((item, index) => <div
                        className="repeater-item" key={index}>
                        <div className="repeater-title">Atividade {index + 1}
                            <button type="button"
                                    onClick={() => form.setData('program', form.data.program.filter((_, itemIndex) => itemIndex !== index))}
                                    title="Remover atividade"><Trash2 className="size-4"/></button>
                        </div>
                        <div className="form-grid"><label className="field-label">Hora<input className="field-input"
                                                                                             type="time"
                                                                                             value={item.hora}
                                                                                             onChange={(e) => updateProgram(index, 'hora', e.target.value)}/></label><label
                            className="field-label">Nome<input className="field-input" value={item.nome}
                                                               onChange={(e) => updateProgram(index, 'nome', e.target.value)}
                                                               placeholder="Ex.: Cerimónia"/></label><label
                            className="field-label">Ícone<SelectField value={item.icon}
                                                                      onChange={(value) => updateProgram(index, 'icon', value)}
                                                                      options={icons}/></label><label
                            className="field-label">Localização<input className="field-input" value={item.localizacao}
                                                                      onChange={(e) => updateProgram(index, 'localizacao', e.target.value)}
                                                                      placeholder="Ex.: Igreja de São José"/></label><label
                            className="field-label sm:col-span-2">Link Google Maps<input className="field-input"
                                                                                         type="url"
                                                                                         value={item.googleMapsLink}
                                                                                         onChange={(e) => updateProgram(index, 'googleMapsLink', e.target.value)}
                                                                                         placeholder="https://maps.google.com/..."/></label>
                        </div>
                    </div>)}</div>
                </section>
                <section className="form-card">
                    <div className="form-card-heading"><FileImage/>
                        <div><h2>Galeria</h2><p>Faça upload de quantas fotografias quiser, com máximo de 5 MB por
                            foto.</p></div>
                    </div>
                    <label className="upload-zone"><FileImage className="size-7 text-primary"/><span
                        className="font-medium">Selecionar fotografias</span><small>Pode escolher várias imagens de uma
                        vez</small><input type="file" accept="image/*" multiple
                                          onChange={setGallery}/>{form.data.gallery.length > 0 &&
                        <strong>{form.data.gallery.length} novas fotografias selecionadas</strong>}
                    </label>{convite?.gallery.length ?
                    <div className="mt-4 flex flex-wrap gap-2">{convite.gallery.map((image) => <span
                        className="rounded-full bg-muted px-3 py-1 text-xs"
                        key={image.id}>{image.name}</span>)}</div> : null}</section>
                <section className="form-card">
                    <div className="form-card-heading"><UsersRound/>
                        <div><h2>Contactos</h2><p>Defina os contactos dos noivos, pais do noivo e pais da noiva.</p>
                        </div>
                    </div>
                    <div className="repeater-list">{form.data.contacts.map((contact, index) => <div
                        className="repeater-item" key={index}>
                        <div className="repeater-title">Contacto {index + 1}
                            <button type="button"
                                    onClick={() => form.setData('contacts', form.data.contacts.filter((_, itemIndex) => itemIndex !== index))}
                                    title="Remover contacto"><Trash2 className="size-4"/></button>
                        </div>
                        <div className="form-grid"><label className="field-label">Categoria<SelectField
                            value={contact.categoria} onChange={(value) => updateContact(index, 'categoria', value)}
                            options={contactCategories}/></label><label className="field-label">Nome<input
                            className="field-input" value={contact.nome}
                            onChange={(e) => updateContact(index, 'nome', e.target.value)}
                            placeholder="Nome do contacto"/></label><label className="field-label">Telefone<input
                            className="field-input" value={contact.telefone}
                            onChange={(e) => updateContact(index, 'telefone', e.target.value)} placeholder="+258 ..."/></label><label
                            className="field-label">Email<input className="field-input" type="email"
                                                                value={contact.email}
                                                                onChange={(e) => updateContact(index, 'email', e.target.value)}
                                                                placeholder="email@exemplo.com"/></label></div>
                    </div>)}</div>
                    <button type="button" className="secondary-button mt-4"
                            onClick={() => form.setData('contacts', [...form.data.contacts, emptyContact()])}><Plus
                        className="mr-2 size-4"/>Adicionar contacto
                    </button>
                </section>
                <div className="flex justify-end">
                    <button className="action-button sm:w-auto" disabled={form.processing} type="submit"><Save
                        className="mr-2 size-4"/>{form.processing ? 'A guardar…' : 'Guardar configuração'}</button>
                </div>
            </form>
        </div>
    </>;
}
