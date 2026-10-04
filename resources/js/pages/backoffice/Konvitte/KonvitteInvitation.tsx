import {Head, router, useForm} from '@inertiajs/react';
import {ArrowLeftOutlined, DeleteOutlined, PlusOutlined, SaveOutlined, UploadOutlined} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Flex,
    Form,
    Grid,
    Input,
    Row,
    Select,
    Tag,
    TimePicker,
    Typography,
    Upload
} from 'antd';
import dayjs from 'dayjs';
import type {RcFile} from 'antd/es/upload/interface';
import type {ReactNode} from 'react';

type InviteType = { id: number; name: string; code: string };
type ProgramItem = { hora: string; nome: string; localizacao: string; googleMapsLink: string; icon: string };
type Contact = { nome: string; telefone: string; email: string };
type ExistingGallery = { id: number; name: string; url: string };
type ExistingInvite =
    {
        id: number;
        slug: string | null;
        inviteTypeId: number;
        nomeNoiva: string;
        nomeNoivo: string;
        nomePaiNoivo: string;
        nomeMaeNoivo: string;
        nomePaiNoiva: string;
        nomeMaeNoiva: string;
        data: string;
        local: string;
        googleMapsLink: string | null;
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
type Props = {
    inviteTypes: InviteType[];
    convite: ExistingInvite;

};
type FormData = {
    inviteTypeId: string;
    nomeNoiva: string;
    nomeNoivo: string;
    nomePaiNoivo: string;
    nomeMaeNoivo: string;
    nomePaiNoiva: string;
    nomeMaeNoiva: string;
    data: string;
    local: string;
    googleMapsLink: string;
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
const emptyProgram = (): ProgramItem => ({hora: '', nome: '', localizacao: '', googleMapsLink: '', icon: 'calendar'});
const emptyContact = (): Contact => ({nome: '', telefone: '', email: ''});
const initialData = (convite: ExistingInvite): FormData => ({
    inviteTypeId: convite ? String(convite.inviteTypeId) : '',
    nomeNoiva: convite?.nomeNoiva ?? '',
    nomeNoivo: convite?.nomeNoivo ?? '',
    nomePaiNoivo: convite?.nomePaiNoivo ?? '',
    nomeMaeNoivo: convite?.nomeMaeNoivo ?? '',
    nomePaiNoiva: convite?.nomePaiNoiva ?? '',
    nomeMaeNoiva: convite?.nomeMaeNoiva ?? '',
    data: convite?.data ?? '',
    local: convite?.local ?? '',
    googleMapsLink: convite?.googleMapsLink ?? '',
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

export default function KonvitteInvitation({inviteTypes, convite}: Props) {
    const form = useForm<FormData>(`KonvitteInvitation:${convite?.id ?? 'new'}`, initialData(convite));
    const screens = Grid.useBreakpoint();
    const errors = form.errors as Record<string, string>;
    const errorProps = (key: string) => ({
        validateStatus: errors[key] ? 'error' as const : undefined,
        help: errors[key]
    });
    const submit = () => form.post(convite ? `/backoffice/konvitte/invitations/${convite.id}` : '/backoffice/konvitte/invitations', {forceFormData: true});
    const updateProgram = (index: number, key: keyof ProgramItem, value: string) => form.setData('program', form.data.program.map((item, i) => i === index ? {
        ...item,
        [key]: value
    } : item));
    const updateContact = (index: number, key: keyof Contact, value: string) => form.setData('contacts', form.data.contacts.map((item, i) => i === index ? {
        ...item,
        [key]: value
    } : item));
    const textField = (key: keyof FormData, label: string, required = false, multiline = false) => <Form.Item name={key}
                                                                                                              label={label}
                                                                                                              rules={required ? [{
                                                                                                                  required: true,
                                                                                                                  whitespace: true
                                                                                                              }] : undefined} {...errorProps(key)}>
        {multiline ? <Input.TextArea autoSize={{minRows: 3, maxRows: 8}}/> : <Input/>}
    </Form.Item>;
    const fileField = (key: 'fotoCapa' | 'fotoInicial' | 'fotoInformacoes' | 'musica', label: string, accept: string) =>
        <Form.Item label={label} {...errorProps(key)}
                   extra={convite?.[key] ? 'Já existe um ficheiro guardado. Selecione outro para o substituir.' : undefined}>
            <Upload accept={accept} maxCount={1} beforeUpload={() => false}
                    fileList={form.data[key] ? [{uid: key, name: form.data[key].name, status: 'done'}] : []}
                    onChange={({fileList}) => form.setData(key, fileList[0]?.originFileObj ?? null)}>
                <Button icon={<UploadOutlined/>}>Selecionar ficheiro</Button>
            </Upload>
        </Form.Item>;
    const nestedField = (label: string, errorKey: string, control: ReactNode) => <Form.Item
        label={label} {...errorProps(errorKey)}>{control}</Form.Item>;
    return <><Head title="Convite"/>
        <Flex vertical gap="large" style={{maxWidth: 1200, margin: '0 auto', minWidth: 0}}>
            <Flex wrap gap="middle" justify="space-between" align="center">
                <Button icon={<ArrowLeftOutlined/>} onClick={() => router.get('/backoffice/konvitte/invitations')}>Voltar
                    aos convites</Button>
                <Button type="primary" icon={<SaveOutlined/>} loading={form.processing} htmlType="submit"
                        form="konvitte-invitation-form" block={!screens.sm}>Guardar convite</Button>
            </Flex>
            <div><Typography.Text type="secondary">Konvitte</Typography.Text><Typography.Title
                level={2}>Convite</Typography.Title>
                <Typography.Paragraph>Configure o conteúdo do convite de casamento num único
                    formulário.</Typography.Paragraph></div>
            <Form id="konvitte-invitation-form" layout="vertical" disabled={form.processing} onFinish={submit}
                  fields={Object.entries(form.data).filter(([, value]) => typeof value === 'string').map(([name, value]) => ({
                      name,
                      value
                  }))}
                  onValuesChange={(values) => form.setData({...form.data, ...values})}>
                <Flex vertical gap="large">
                    <Card title="Identidade do convite">
                        <Row gutter={16}>
                            <Col span={24}><Form.Item name="inviteTypeId" label="Tipo de convite"
                                                      rules={[{required: true}]} {...errorProps('inviteTypeId')}>
                                <Select placeholder="Selecionar tipo" options={inviteTypes.map((type) => ({
                                    value: String(type.id),
                                    label: type.name
                                }))}/>
                            </Form.Item></Col>
                            {([['nomeNoivo', 'Nome do noivo'], ['nomeNoiva', 'Nome da noiva'], ['nomePaiNoivo', 'Nome do pai do noivo'], ['nomeMaeNoivo', 'Nome da mãe do noivo'], ['nomePaiNoiva', 'Nome do pai da noiva'], ['nomeMaeNoiva', 'Nome da mãe da noiva']] as const).map(([key, label]) =>
                                <Col xs={24} md={12} key={key}>{textField(key, label, true)}</Col>)}
                            <Col xs={24} md={12}><Form.Item name="data" label="Data do evento"
                                                            rules={[{required: true}]} {...errorProps('data')}
                                                            getValueProps={(value: string) => ({value: value ? dayjs(value) : null})}
                                                            getValueFromEvent={(value) => value ? value.format('YYYY-MM-DDTHH:mm') : ''}>
                                <DatePicker showTime={{format: 'HH:mm'}} format="DD/MM/YYYY HH:mm" showNow={false}
                                            style={{width: '100%'}} placeholder="Selecionar data e hora"/>
                            </Form.Item></Col>
                            <Col xs={24} md={12}>{textField('local', 'Local', true)}</Col>
                            <Col span={24}><Form.Item name="googleMapsLink"
                                                      label="Ligação do Google Maps" {...errorProps('googleMapsLink')}><Input
                                type="url" maxLength={500} placeholder="https://maps.google.com/..."/></Form.Item></Col>
                        </Row>
                    </Card>
                    <Card title="Fotografias e música">
                        <Typography.Paragraph type="secondary">Imagens até 5 MB. Música em MP3, WAV ou OGG até 20
                            MB.</Typography.Paragraph>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>{fileField('fotoCapa', 'Foto de capa', 'image/*')}</Col>
                            <Col xs={24} md={12}>{fileField('fotoInicial', 'Foto inicial', 'image/*')}</Col>
                            <Col xs={24}
                                 md={12}>{fileField('fotoInformacoes', 'Foto da área dos noivos', 'image/*')}</Col>
                            <Col xs={24}
                                 md={12}>{fileField('musica', 'Música de fundo', 'audio/mpeg,audio/wav,audio/ogg')}</Col>
                        </Row>
                    </Card>
                    <Card title="Textos e celebração">
                        {textField('textoBiblico', 'Texto bíblico', false, true)}
                        {textField('livroBiblico', 'Livro e referência')}
                        {textField('textoCasal', 'Texto do casal', false, true)}
                        {textField('textoCelebre', 'Celebre connosco', false, true)}
                        {textField('textoOrientacoes', 'Orientações', false, true)}
                    </Card>
                    <Card title="Programa">
                        <Flex vertical gap="middle">
                            {form.data.program.map((item, index) => <Card size="small" key={index}
                                                                          title={`Atividade ${index + 1}`}
                                                                          extra={<Button type="text" danger
                                                                                         icon={<DeleteOutlined/>}
                                                                                         aria-label={`Remover atividade ${index + 1}`}
                                                                                         onClick={() => form.setData('program', form.data.program.filter((_, i) => i !== index))}/>}>
                                <Row gutter={16}>
                                    <Col xs={24} md={12}>{nestedField('Hora', `program.${index}.hora`, <TimePicker
                                        format="HH:mm" style={{width: '100%'}}
                                        value={item.hora ? dayjs(`2000-01-01T${item.hora}`) : null}
                                        onChange={(value) => updateProgram(index, 'hora', value ? value.format('HH:mm') : '')}/>)}</Col>
                                    <Col xs={24} md={12}>{nestedField('Nome', `program.${index}.nome`, <Input
                                        value={item.nome}
                                        onChange={(event) => updateProgram(index, 'nome', event.target.value)}/>)}</Col>
                                    <Col xs={24} md={12}>{nestedField('Ícone', `program.${index}.icon`, <Select
                                        value={item.icon} options={icons}
                                        onChange={(value) => updateProgram(index, 'icon', value)}/>)}</Col>
                                    <Col xs={24} md={12}>{nestedField('Localização', `program.${index}.localizacao`,
                                        <Input value={item.localizacao}
                                               onChange={(event) => updateProgram(index, 'localizacao', event.target.value)}/>)}</Col>
                                    <Col
                                        span={24}>{nestedField('Ligação do Google Maps', `program.${index}.googleMapsLink`,
                                        <Input type="url" value={item.googleMapsLink}
                                               onChange={(event) => updateProgram(index, 'googleMapsLink', event.target.value)}/>)}</Col>
                                </Row>
                            </Card>)}
                            <Button icon={<PlusOutlined/>}
                                    onClick={() => form.setData('program', [...form.data.program, emptyProgram()])}>Adicionar
                                atividade</Button>
                        </Flex>
                    </Card>
                    <Card title="Galeria">
                        <Form.Item {...errorProps('gallery')}>
                            <Upload.Dragger accept="image/*" multiple beforeUpload={() => false}
                                            fileList={form.data.gallery.map((file, index) => ({
                                                uid: `gallery-${index}`,
                                                name: file.name,
                                                status: 'done',
                                                originFileObj: file as RcFile
                                            }))}
                                            onChange={({fileList}) => form.setData('gallery', fileList.flatMap((file) => file.originFileObj ? [file.originFileObj] : []))}>
                                <UploadOutlined style={{fontSize: 32}}/>
                                <Typography.Paragraph>Selecione ou arraste fotografias para aqui.</Typography.Paragraph>
                                <Typography.Text type="secondary">Pode escolher várias imagens, até 5 MB por
                                    fotografia.</Typography.Text>
                            </Upload.Dragger>
                        </Form.Item>
                        {Object.entries(errors).filter(([key]) => key.startsWith('gallery.')).map(([key, error]) =>
                            <Typography.Paragraph type="danger" key={key}>{error}</Typography.Paragraph>)}
                        <Flex wrap gap="small">{convite?.gallery.map((image) => <Tag
                            key={image.id}>{image.name}</Tag>)}</Flex>
                    </Card>
                    <Card title="Contactos">
                        <Flex vertical gap="middle">
                            {form.data.contacts.map((contact, index) => <Card size="small" key={index}
                                                                              title={`Contacto ${index + 1}`}
                                                                              extra={<Button type="text" danger
                                                                                             icon={<DeleteOutlined/>}
                                                                                             aria-label={`Remover contacto ${index + 1}`}
                                                                                             onClick={() => form.setData('contacts', form.data.contacts.filter((_, i) => i !== index))}/>}>
                                <Row
                                    gutter={16}>{([['nome', 'Nome'], ['telefone', 'Telefone'], ['email', 'Email']] as const).map(([key, label]) =>
                                    <Col xs={24} md={8} key={key}>
                                        {nestedField(label, `contacts.${index}.${key}`, <Input
                                            type={key === 'email' ? 'email' : key === 'telefone' ? 'tel' : 'text'}
                                            value={contact[key]}
                                            onChange={(event) => updateContact(index, key, event.target.value)}/>)}
                                    </Col>)}</Row>
                            </Card>)}
                            <Button icon={<PlusOutlined/>}
                                    onClick={() => form.setData('contacts', [...form.data.contacts, emptyContact()])}>Adicionar
                                contacto</Button>
                        </Flex>
                    </Card>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined/>} loading={form.processing}
                            block={!screens.sm} style={{alignSelf: screens.sm ? 'flex-end' : undefined}}>Guardar
                        configuração</Button>
                </Flex>
            </Form>
            {convite && <Flex wrap gap="small"><Button
                onClick={() => router.get(`/backoffice/konvitte/tables/${convite.id}`)}>Mesas</Button><Button
                onClick={() => router.get(`/backoffice/konvitte/guests/${convite.id}`)}>Convidados</Button></Flex>}
        </Flex>
    </>;
}
