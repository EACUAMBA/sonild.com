import {Head, router} from '@inertiajs/react';
import {useState} from 'react';
import {Button, Card, Empty, Flex, Form, Input, Select, Table, Tag, Typography} from 'antd';

type Props = {
    invitation: { id: number; name: string } | null;
    invitations: { id: number; name: string }[];
    messages: {
        data: {
            id: number;
            guest: string;
            text: string | null;
            sentAt: string;
            hiddenByGuest: boolean;
            hiddenByAdmin: boolean
        }[];
        current_page: number;
        total: number
    };
    search: string;
};

export default function KonvitteMessages({invitation, invitations, messages, search}: Props) {
    const [busy, setBusy] = useState(false);
    const [visibilityError, setVisibilityError] = useState(false);
    const toggleVisibility = (message: Props['messages']['data'][number]) => {
        if (!invitation || busy) return;
        setBusy(true);
        setVisibilityError(false);
        router.patch(`/backoffice/konvitte/messages/${invitation.id}/${message.id}/visibility`, {hidden: !message.hiddenByAdmin}, {
            preserveScroll: true, onError: () => setVisibilityError(true), onFinish: () => setBusy(false),
        });
    };
    const visit = (page: number, query = search) => {
        if (invitation) router.get(`/backoffice/konvitte/messages/${invitation.id}`, {
            page,
            search: query
        }, {preserveScroll: true});
    };
    return <><Head title="Mensagens — Konvitte"/>
        <Flex vertical gap="large" style={{maxWidth: 1280, margin: '0 auto', minWidth: 0}}>
            <div><Typography.Text type="secondary">Konvitte · Palavras de carinho</Typography.Text>
                <Typography.Title level={2}>Mensagens</Typography.Title>
                <Typography.Paragraph>Leia as mensagens enviadas pelos convidados.</Typography.Paragraph></div>
            <Card><Form layout="vertical"><Form.Item label="Convite">
                <Select aria-label="Convite" placeholder="Selecione um convite" value={invitation?.id}
                        disabled={!invitations.length} showSearch={{optionFilterProp: 'label'}}
                        options={invitations.map((item) => ({value: item.id, label: item.name}))}
                        onChange={(id) => router.get(`/backoffice/konvitte/messages/${id}`)}/>
            </Form.Item>
                {invitation && <Form.Item label="Pesquisar convidado"><Input.Search key={`${invitation.id}:${search}`}
                                                                                    aria-label="Pesquisar convidado"
                                                                                    defaultValue={search}
                                                                                    maxLength={120} allowClear
                                                                                    enterButton="Pesquisar"
                                                                                    onSearch={(value) => visit(1, value.trim())}/></Form.Item>}
            </Form></Card>
            <Card title={invitation ? `Mensagens · ${invitation.name}` : 'Mensagens dos convidados'}>
                {visibilityError && <p role="alert">Não foi possível alterar a visibilidade. Tente novamente.</p>}
                <Table rowKey="id" dataSource={messages.data} scroll={{x: 650}}
                       locale={{
                           emptyText: <Empty
                               description={!invitation ? 'Crie um convite para receber mensagens.' : search ? 'Nenhuma mensagem corresponde à pesquisa.' : 'Ainda não recebeu mensagens.'}/>
                       }}
                       pagination={{
                           current: messages.current_page, total: messages.total, pageSize: 10, showSizeChanger: false,
                           showTotal: (total) => `${total} mensagem(ns)`, onChange: (page) => visit(page)
                       }}
                       columns={[
                           {
                               title: 'Visibilidade',
                               width: 170,
                               render: (_, message) =>
                                   <Tag>{message.hiddenByGuest ? 'Oculta pelo convidado' : message.hiddenByAdmin ? 'Oculta pelo gestor' : 'Visível'}</Tag>
                           },
                           {
                               title: 'Ações',
                               width: 170,
                               render: (_, message) => <Button
                                   disabled={busy || (message.hiddenByGuest && !message.hiddenByAdmin)}
                                   onClick={() => toggleVisibility(message)}>{message.hiddenByAdmin ? 'Desfazer ocultação' : 'Ocultar'}</Button>
                           },
                           {title: 'Convidado', dataIndex: 'guest', width: 180},
                           {
                               title: 'Mensagem',
                               dataIndex: 'text',
                               render: (text: string | null) => <p
                                   style={{
                                       whiteSpace: 'pre-wrap',
                                       overflowWrap: 'anywhere',
                                       margin: 0
                                   }}>{text ?? 'Mensagem oculta'}</p>
                           },
                           {
                               title: 'Enviada em',
                               dataIndex: 'sentAt',
                               width: 180,
                               render: (date: string) => new Intl.DateTimeFormat('pt-PT', {
                                   dateStyle: 'medium',
                                   timeStyle: 'short',
                                   timeZone: 'Africa/Maputo'
                               }).format(new Date(date))
                           },
                       ]}/>
            </Card>
        </Flex>
    </>;
}
