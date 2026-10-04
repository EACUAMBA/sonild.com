import {Head, router} from '@inertiajs/react';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    MailOutlined,
    TeamOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Descriptions,
    Empty,
    Flex,
    Form,
    Grid,
    Input,
    Modal,
    Progress,
    Row,
    Select,
    Statistic,
    Table,
    Tag,
    theme,
    Typography
} from 'antd';
import {useState} from 'react';
import {tableActionsColumn} from '@/components/backoffice/tableActionsColumn';

type Status = 'CONFIRMED' | 'DECLINED' | 'PENDING' | 'UNANSWERED';
type ResponseRow = {
    id: number;
    name: string;
    table: string | null;
    status: Status;
    message: string | null;
    respondedAt: string | null
};
type Props = {
    invitation: { id: number; name: string } | null;
    invitations: { id: number; name: string }[];
    summary: { total: number; confirmed: number; declined: number; pending: number; unanswered: number };
    responses: { data: ResponseRow[]; current_page: number; last_page: number; total: number };
    filters: { status: Status | null; search: string };
};
const statuses = {
    CONFIRMED: {label: 'Confirmado', color: 'success', icon: <CheckCircleOutlined/>},
    DECLINED: {label: 'Recusado', color: 'error', icon: <CloseCircleOutlined/>},
    PENDING: {label: 'Indeciso', color: 'warning', icon: <ClockCircleOutlined/>},
    UNANSWERED: {label: 'Sem resposta', color: 'default', icon: <MailOutlined/>},
};
const statusTag = (status: Status) => <Tag color={statuses[status].color}
                                           icon={statuses[status].icon}>{statuses[status].label}</Tag>;
const dateLabel = (value: string | null) => value ? new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'medium',
    timeStyle: 'short'
}).format(new Date(value)) : '—';

export default function KonvitteRsvps(props: Props) {
    return <RsvpScreen key={`${props.invitation?.id ?? 'none'}:${props.filters.search}`} {...props}/>;
}

function RsvpScreen({invitation, invitations, summary, responses, filters}: Props) {
    const screens = Grid.useBreakpoint();
    const {token} = theme.useToken();
    const [search, setSearch] = useState(filters.search);
    const [selected, setSelected] = useState<ResponseRow | null>(null);
    const [loading, setLoading] = useState(false);
    const visit = (status = filters.status, query = filters.search, page = 1) => {
        if (!invitation) return;
        router.get(`/backoffice/konvitte/rsvps/${invitation.id}`, {page, ...(status ? {status} : {}), ...(query.trim() ? {search: query.trim()} : {})}, {
            preserveState: true, preserveScroll: true,
            onStart: () => setLoading(true), onFinish: () => setLoading(false),
        });
    };
    const answered = summary.total - summary.unanswered;
    const percent = summary.total ? Math.round(answered / summary.total * 100) : 0;
    const cards = [
        {label: 'Confirmados', value: summary.confirmed, color: token.colorSuccess, icon: <CheckCircleOutlined/>},
        {label: 'Recusados', value: summary.declined, color: token.colorError, icon: <CloseCircleOutlined/>},
        {label: 'Indecisos', value: summary.pending, color: token.colorWarning, icon: <ClockCircleOutlined/>},
        {label: 'Sem resposta', value: summary.unanswered, color: token.colorTextSecondary, icon: <MailOutlined/>},
    ];
    return <><Head title="RSVPs — Konvitte"/>
        <Flex vertical gap="large" style={{maxWidth: 1280, margin: '0 auto', minWidth: 0}}>
            <Row gutter={[24, 16]} align="middle" justify="space-between">
                <Col xs={24} md={16}><Typography.Text type="secondary">Konvitte · Confirmações de
                    presença</Typography.Text>
                    <Typography.Title level={2} style={{marginTop: 8}}>RSVPs</Typography.Title>
                    <Typography.Paragraph type="secondary">Acompanhe as respostas e leia as mensagens dos seus
                        convidados.</Typography.Paragraph></Col>
                <Col xs={24} md={8}><Form layout="vertical"><Form.Item label="Convite" style={{marginBottom: 0}}>
                    <Select aria-label="Convite" placeholder="Selecione um convite" value={invitation?.id}
                            disabled={!invitations.length || loading}
                            showSearch={{optionFilterProp: 'label'}}
                            options={invitations.map((item) => ({value: item.id, label: item.name}))}
                            onChange={(id) => router.get(`/backoffice/konvitte/rsvps/${id}`)}/>
                </Form.Item></Form></Col>
            </Row>
            {invitation ? <>
                <Card>
                    <Row gutter={[24, 16]} align="middle">
                        <Col xs={24} md={16}><Flex vertical gap="small">
                            <Typography.Title level={4} style={{margin: 0}}>{invitation.name}</Typography.Title>
                            <Typography.Text type="secondary"><TeamOutlined/> {summary.total} convidados registados
                                · {answered} respostas recebidas</Typography.Text>
                            <Progress percent={percent} strokeColor={token.colorSuccess}/>
                            <Typography.Text type="secondary">Os totais contam convidados registados, sem somar
                                acompanhantes.</Typography.Text>
                        </Flex></Col>
                        <Col xs={24} md={8}><Flex justify={screens.md ? 'end' : 'start'}><Button icon={<TeamOutlined/>}
                                                                                                 onClick={() => router.get(`/backoffice/konvitte/guests/${invitation.id}`)}>Ver
                            convidados</Button></Flex></Col>
                    </Row>
                </Card>
                <Row gutter={[16, 16]}>{cards.map((card) => <Col xs={12} lg={6} key={card.label}>
                    <Card style={{height: '100%', borderTop: `3px solid ${card.color}`}}
                          styles={{body: {padding: screens.sm ? 24 : 16}}}>
                        <Statistic title={card.label} value={card.value} prefix={card.icon}
                                   styles={{content: {color: card.color}}}/>
                    </Card>
                </Col>)}</Row>
                <Card title="Respostas dos convidados" styles={{body: {padding: screens.sm ? 24 : 12}}}>
                    <Form layout="vertical" onFinish={() => visit(filters.status, search)}>
                        <Row gutter={16} align="bottom">
                            <Col xs={24} md={12}><Form.Item label="Pesquisar convidado"><Input.Search
                                aria-label="Pesquisar convidado" placeholder="Nome do convidado" allowClear
                                enterButton="Pesquisar" maxLength={120} value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onSearch={(value) => visit(filters.status, value)} loading={loading}/></Form.Item></Col>
                            <Col xs={24} sm={16} md={8}><Form.Item label="Estado da resposta"><Select
                                aria-label="Estado da resposta" placeholder="Todos os estados" allowClear
                                value={filters.status ?? undefined} disabled={loading}
                                options={Object.entries(statuses).map(([value, status]) => ({
                                    value,
                                    label: status.label
                                }))} onChange={(value) => visit(value ?? null)}/></Form.Item></Col>
                            <Col xs={24} sm={8} md={4}><Form.Item><Button block
                                                                          disabled={loading || (!filters.status && !filters.search)}
                                                                          onClick={() => {
                                                                              setSearch('');
                                                                              visit(null, '');
                                                                          }}>Limpar filtros</Button></Form.Item></Col>
                        </Row>
                    </Form>
                    <Table<ResponseRow> rowKey="id" dataSource={responses.data} loading={loading} scroll={{x: 900}}
                                        locale={{
                                            emptyText: <Empty
                                                description={filters.search || filters.status ? 'Nenhum convidado corresponde aos filtros.' : 'Ainda não existem convidados neste convite.'}/>
                                        }}
                                        pagination={{
                                            current: responses.current_page,
                                            total: responses.total,
                                            pageSize: 10,
                                            showSizeChanger: false,
                                            simple: !screens.sm,
                                            showTotal: (total) => `${total} convidado(s)`,
                                            onChange: (page) => visit(filters.status, filters.search, page)
                                        }}
                                        columns={[
                                            {
                                                title: 'Convidado',
                                                dataIndex: 'name',
                                                width: 180,
                                                render: (name: string) => <Typography.Text
                                                    strong>{name}</Typography.Text>
                                            },
                                            {
                                                title: 'Mesa',
                                                dataIndex: 'table',
                                                width: 140,
                                                render: (value: string | null) => value ?? 'Sem mesa'
                                            },
                                            {
                                                title: 'Estado',
                                                dataIndex: 'status',
                                                width: 150,
                                                render: (status: Status) => statusTag(status)
                                            },
                                            {
                                                title: 'Mensagem',
                                                dataIndex: 'message',
                                                width: 260,
                                                render: (message: string | null) => message ?
                                                    <Typography.Paragraph ellipsis={{rows: 2}} style={{
                                                        margin: 0,
                                                        whiteSpace: 'pre-wrap',
                                                        overflowWrap: 'anywhere'
                                                    }}>{message}</Typography.Paragraph> :
                                                    <Typography.Text type="secondary">Sem mensagem</Typography.Text>
                                            },
                                            {
                                                title: 'Última resposta',
                                                dataIndex: 'respondedAt',
                                                width: 180,
                                                render: dateLabel
                                            },
                                            {
                                                ...tableActionsColumn,
                                                width: 130,
                                                render: (_, response) => <Flex vertical={!screens.lg} wrap gap="small"
                                                                               align="end" justify="end"><Button
                                                    icon={<EyeOutlined/>}
                                                    aria-label={`Ver resposta de ${response.name}`}
                                                    onClick={() => setSelected(response)}>Ver</Button></Flex>
                                            },
                                        ]}/>
                </Card>
            </> : <Card><Empty description="Crie um convite para começar a acompanhar as confirmações."><Button
                type="primary" onClick={() => router.get('/backoffice/konvitte/invitations/create')}>Criar
                convite</Button></Empty></Card>}
        </Flex>
        <Modal title="Resposta do convidado" open={selected !== null} onCancel={() => setSelected(null)}
               footer={<Button onClick={() => setSelected(null)}>Fechar</Button>}>
            {selected && <Flex vertical gap="large">
                <Descriptions column={1} items={[{key: 'name', label: 'Convidado', children: selected.name}, {
                    key: 'table',
                    label: 'Mesa',
                    children: selected.table ?? 'Sem mesa'
                }, {key: 'status', label: 'Estado', children: statusTag(selected.status)}, {
                    key: 'date',
                    label: 'Última resposta',
                    children: dateLabel(selected.respondedAt)
                }]}/>
                <Card size="small" title="Mensagem"><Typography.Paragraph style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere'
                }}>{selected.message || (selected.status === 'UNANSWERED' ? 'Este convidado ainda não respondeu.' : 'O convidado não deixou uma mensagem.')}</Typography.Paragraph></Card>
            </Flex>}
        </Modal>
    </>;
}
