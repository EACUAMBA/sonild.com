import {Head, router} from '@inertiajs/react';
import {DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined} from '@ant-design/icons';
import {App, Button, Card, Flex, Grid, Table, Typography} from 'antd';
import {useState} from 'react';

type Invitation = { id: number; name: string; type: string | null; date: string | null; slug: string | null };
type Props = { invitations: { data: Invitation[]; current_page: number; last_page: number; total: number } };

export default function KonvitteInvitations({invitations}: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const {modal, message} = App.useApp();
    const screens = Grid.useBreakpoint();
    const remove = (invitation: Invitation) => modal.confirm({
        title: `Eliminar o convite de ${invitation.name}?`,
        content: 'Os convidados, mesas e ligações públicas também serão removidos. Esta ação não pode ser desfeita.',
        okText: 'Eliminar', cancelText: 'Cancelar', okButtonProps: {danger: true},
        onOk: () => new Promise<void>((resolve, reject) => {
            setDeletingId(invitation.id);
            router.delete(`/backoffice/konvitte/invitations/${invitation.id}`, {
                onSuccess: () => {
                    void message.success('Convite eliminado.');
                    resolve();
                },
                onError: () => {
                    void message.error('Não foi possível eliminar o convite. Tente novamente.');
                    reject(new Error('Falha ao eliminar'));
                },
                onCancel: () => resolve(),
                onFinish: () => setDeletingId(null),
            });
        }),
    });
    return <><Head title="Convites — Konvitte"/>
        <Flex vertical gap="large" style={{maxWidth: 1200, margin: '0 auto', minWidth: 0}}>
            <Flex wrap gap="middle" align="center" justify="space-between">
                <div><Typography.Text type="secondary">Konvitte</Typography.Text><Typography.Title
                    level={2}>Convites</Typography.Title>
                    <Typography.Paragraph>Faça a gestão dos seus convites, datas e convidados.</Typography.Paragraph>
                </div>
                <Button type="primary" icon={<PlusOutlined/>} block={!screens.sm}
                        onClick={() => router.get('/backoffice/konvitte/invitations/create')}>Novo convite</Button>
            </Flex>
            <Card styles={{body: {padding: screens.sm ? 24 : 12}}}>
                <Table<Invitation> rowKey="id" dataSource={invitations.data} scroll={{x: 720}}
                                   locale={{emptyText: 'Ainda não existem convites. Crie o seu primeiro convite para começar.'}}
                                   pagination={{
                                       current: invitations.current_page,
                                       total: invitations.total,
                                       pageSize: 10,
                                       showSizeChanger: false,
                                       simple: !screens.sm,
                                       showTotal: (total) => `${total} convite(s)`,
                                       onChange: (page) => router.get('/backoffice/konvitte/invitations', {page}, {preserveScroll: true})
                                   }}
                                   columns={[
                                       {title: 'Convite', dataIndex: 'name'},
                                       {
                                           title: 'Tipo',
                                           dataIndex: 'type',
                                           render: (value: string | null) => value ?? '—'
                                       },
                                       {
                                           title: 'Data',
                                           dataIndex: 'date',
                                           render: (value: string | null) => value ? <time
                                               dateTime={value}>{value.split('-').reverse().join('/')}</time> : '—'
                                       },
                                       {
                                           title: 'Ações',
                                           key: 'actions',
                                           render: (_, invitation) => <Flex wrap gap="small">
                                               <Button icon={<EyeOutlined/>}
                                                       onClick={() => router.get(`/backoffice/konvitte/guests/${invitation.id}`)}>Convidados</Button>
                                               <Button icon={<EditOutlined/>}
                                                       onClick={() => router.get(`/backoffice/konvitte/invitations/${invitation.id}`)}>Editar</Button>
                                               <Button danger icon={<DeleteOutlined/>}
                                                       loading={deletingId === invitation.id}
                                                       disabled={deletingId !== null}
                                                       onClick={() => remove(invitation)}>Eliminar</Button>
                                           </Flex>
                                       },
                                   ]}/>
            </Card>
        </Flex>
    </>;
}
