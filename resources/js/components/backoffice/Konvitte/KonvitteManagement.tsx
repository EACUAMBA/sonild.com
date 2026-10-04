import {tableActionsColumn} from '@/components/backoffice/tableActionsColumn';
import {Head, router, useForm} from '@inertiajs/react';
import {useRef, useState} from 'react';
import {
    Alert,
    AutoComplete,
    Button,
    Card,
    Col,
    Empty,
    Flex,
    Form,
    Grid,
    Input,
    InputNumber,
    Pagination,
    Row,
    Select,
    Table as AntTable,
    Typography
} from 'antd';
import {EditOutlined, PlusOutlined} from '@ant-design/icons';
import KonvitteGuestLink from './KonvitteGuestLink';
import {guest as guestRoute} from '@/routes/konvitte';

type Guest = {
    id: number;
    name: string;
    table: string | null;
    tableId: number | null;
    maxGuests: number;
    slug: string | null
};
type Invitation = { id: number; name: string; slug: string | null };
type Table = { id: number; name: string; guestCount: number; capacity: number | null; allocatedSeats: number };
export type KonvitteManagementProps = {
    invitation: Invitation | null;
    invitations: { id: number; name: string }[];
    tables: Table[];
    guests: {
        data: Guest[];
        current_page: number;
        last_page: number;
    };
};

const capacityLabel = (table: Table) => table.capacity === null ? 'Capacidade não definida' : `${table.capacity} lugares`;

export default function KonvitteManagement(props: KonvitteManagementProps & { section: 'tables' | 'guests' }) {
    // Reset forms when switching invitations, including navigation that preserves state.
    return <ManagementForm key={`${props.section}:${props.invitation?.id ?? 'none'}`} {...props}/>;
}

function ManagementForm({invitation, invitations, tables, guests, section}: KonvitteManagementProps & {
    section: 'tables' | 'guests'
}) {
    const isGuest = section === 'guests';
    const title = isGuest ? 'Convidados' : 'Mesas';
    const [showTableForm, setShowTableForm] = useState(false);
    const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
    const guestFormRef = useRef<HTMLDivElement>(null);
    const form = useForm({name: '', tableId: '', tableName: '', tableCapacity: '', maxGuests: '1'});
    const tableForm = useForm({name: '', capacity: ''});
    const selectedTable = tables.find((table) => table.name.toLocaleLowerCase() === form.data.tableName.trim().toLocaleLowerCase());
    const isNewTable = Boolean(form.data.tableName.trim()) && !selectedTable;
    const busy = form.processing || tableForm.processing;
    const resetGuestForm = () => {
        setEditingGuest(null);
        form.reset();
        form.clearErrors();
    };
    const editGuest = (guest: Guest) => {
        form.clearErrors();
        form.setData({
            name: guest.name,
            tableId: guest.tableId ? String(guest.tableId) : '',
            tableName: guest.table ?? '',
            tableCapacity: '',
            maxGuests: String(guest.maxGuests)
        });
        setEditingGuest(guest);
        guestFormRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
    };
    const submitGuest = () => {
        if (!invitation) return;
        form.transform((data) => ({
            ...data,
            tableId: selectedTable ? String(selectedTable.id) : '',
            tableName: selectedTable ? '' : data.tableName.trim(),
            tableCapacity: isNewTable ? data.tableCapacity : '',
        }));
        const options = {preserveScroll: true, onSuccess: resetGuestForm};
        if (editingGuest) {
            form.put(`/backoffice/konvitte/guests/${invitation.id}/${editingGuest.id}`, options);
        } else {
            form.post(`/backoffice/konvitte/guests/${invitation.id}`, options);
        }
    };
    const submitTable = () => {
        if (!invitation) return;
        tableForm.post(`/backoffice/konvitte/tables/${invitation.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (isGuest) form.setData('tableName', tableForm.data.name.trim());
                tableForm.reset();
                setShowTableForm(false);
            },
        });
    };
    const paginate = (page: number) => router.get(`/backoffice/konvitte/guests/${invitation!.id}`, {page}, {
        preserveState: true,
        preserveScroll: true
    });
    const screens = Grid.useBreakpoint();
    const fieldError = (error?: string) => ({validateStatus: error ? 'error' as const : undefined, help: error});
    const guestFields = Object.entries(form.data).map(([name, value]) => ({name, value}));
    const tableFields = Object.entries(tableForm.data).map(([name, value]) => ({name, value}));
    return <><Head title={`${title} — Konvitte`}/>
        <Flex vertical gap="large" style={{maxWidth: 1200, margin: '0 auto', width: '100%', minWidth: 0}}>
            <Row gutter={[24, 16]} align="middle" justify="space-between">
                <Col xs={24} md={16}><Typography.Text type="secondary">Konvitte</Typography.Text>
                    <Typography.Title level={2}>{title}</Typography.Title>
                    <Typography.Paragraph>{isGuest ? 'Registe convidados, associe mesas e defina quantas pessoas cada convite pode levar.' : 'Crie e organize as mesas do seu convite.'}</Typography.Paragraph></Col>
                <Col xs={24} md={8}><Form layout="vertical"><Form.Item label="Convite">
                    <Select aria-label="Convite" value={invitation?.id} disabled={!invitations.length || busy}
                            showSearch={{optionFilterProp: 'label'}}
                            placeholder="Selecione um convite"
                            options={invitations.map((item) => ({value: item.id, label: item.name}))}
                            onChange={(id) => router.get(`/backoffice/konvitte/${section}/${id}`)}/>
                </Form.Item></Form></Col>
            </Row>
            <Flex wrap gap="small">
                <Button
                    onClick={() => router.get(`/backoffice/konvitte/invitations${invitation ? `/${invitation.id}` : '/create'}`)}>Convite</Button>
                {invitation && <Button
                    onClick={() => router.get(`/backoffice/konvitte/${isGuest ? 'tables' : 'guests'}/${invitation.id}`)}>{isGuest ? 'Mesas' : 'Convidados'}</Button>}
                {invitation && isGuest && <Button icon={<PlusOutlined/>} aria-expanded={showTableForm}
                                                  onClick={() => setShowTableForm(!showTableForm)}>Adicionar apenas uma
                    mesa</Button>}
            </Flex>
            {invitation ? <>
                {(!isGuest || showTableForm) && <Card title="Adicionar mesa">
                    <Typography.Paragraph>Convite: <Typography.Text
                        strong>{invitation.name}</Typography.Text></Typography.Paragraph>
                    <Form layout="vertical" fields={tableFields}
                          onValuesChange={(values) => tableForm.setData({...tableForm.data, ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value == null ? '' : String(value)]))})}
                          onFinish={submitTable} disabled={busy}>
                        <Row gutter={16}>
                            <Col xs={24} md={12}><Form.Item name="name" label="Nome da mesa" rules={[{
                                required: true,
                                whitespace: true
                            }]} {...fieldError(tableForm.errors.name)}><Input maxLength={120}/></Form.Item></Col>
                            <Col xs={24} md={12}><Form.Item name="capacity" label="Capacidade da mesa"
                                                            rules={[{required: true}]}
                                                            extra="Número de pessoas que a mesa suporta." {...fieldError(tableForm.errors.capacity)}><InputNumber
                                min={1} max={999} precision={0} style={{width: '100%'}}/></Form.Item></Col>
                        </Row>
                        <Button type="primary" htmlType="submit" loading={tableForm.processing} block={!screens.sm}>Adicionar
                            mesa</Button>
                    </Form>
                </Card>}
                {isGuest && <div ref={guestFormRef} style={{scrollMarginTop: 88}}><Card
                    title={editingGuest ? 'Editar convidado' : 'Registar convidado'}>
                    <Typography.Paragraph>Convite: <Typography.Text
                        strong>{invitation.name}</Typography.Text></Typography.Paragraph>
                    <Form key={editingGuest?.id ?? 'new'} layout="vertical" fields={guestFields}
                          onValuesChange={(values) => form.setData({...form.data, ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value == null ? '' : String(value)]))})}
                          onFinish={submitGuest} disabled={busy}>
                        <Row gutter={16}>
                            <Col xs={24} md={12} lg={8}><Form.Item name="name" label="Nome do convidado" rules={[{
                                required: true,
                                whitespace: true
                            }]} {...fieldError(form.errors.name)}><Input maxLength={255}/></Form.Item></Col>
                            <Col xs={24} md={12} lg={8}><Form.Item name="tableName"
                                                                   label="Mesa" {...fieldError(form.errors.tableId || form.errors.tableName)}
                                                                   extra={selectedTable ? `${capacityLabel(selectedTable)} · ${selectedTable.allocatedSeats} lugares previstos` : isNewTable ? 'A nova mesa será criada ao guardar o convidado.' : 'Deixe vazio para registar sem mesa.'}>
                                <AutoComplete allowClear options={tables.map((table) => ({
                                    value: table.name,
                                    label: <Flex
                                        vertical><Typography.Text>{table.name}</Typography.Text><Typography.Text
                                        type="secondary">{capacityLabel(table)} · {table.allocatedSeats} lugares
                                        previstos</Typography.Text></Flex>
                                }))}
                                              filterOption={(input, option) => String(option?.value ?? '').toLocaleLowerCase().includes(input.toLocaleLowerCase())}>
                                    <Input maxLength={120} placeholder="Escolha ou escreva uma nova mesa"/>
                                </AutoComplete>
                            </Form.Item></Col>
                            <Col xs={24} md={12} lg={8}><Form.Item name="maxGuests" label="Número máximo de convidados"
                                                                   rules={[{required: true}]}
                                                                   extra="Inclui o convidado e os acompanhantes." {...fieldError(form.errors.maxGuests)}><InputNumber
                                min={1} max={999} precision={0} style={{width: '100%'}}/></Form.Item></Col>
                            {isNewTable && <Col xs={24} md={12} lg={8}><Form.Item name="tableCapacity"
                                                                                  label="Capacidade da nova mesa"
                                                                                  rules={[{required: true}]} {...fieldError(form.errors.tableCapacity)}><InputNumber
                                min={1} max={999} precision={0} style={{width: '100%'}}/></Form.Item></Col>}
                        </Row>
                        <Flex vertical gap="middle">
                            {selectedTable?.capacity != null && selectedTable.allocatedSeats - (editingGuest?.tableId === selectedTable.id ? editingGuest.maxGuests : 0) + Number(form.data.maxGuests) > selectedTable.capacity &&
                                <Alert type="warning" showIcon
                                       title="Com este convite, o número de pessoas previsto ultrapassa a capacidade da mesa."/>}
                            <Button type="primary" htmlType="submit" loading={form.processing} block={!screens.sm}
                                    style={{alignSelf: screens.sm ? 'flex-start' : undefined}}>{editingGuest ? 'Guardar alterações' : 'Registar convidado'}</Button>
                            {editingGuest && <Button disabled={busy} onClick={resetGuestForm}>Cancelar edição</Button>}
                        </Flex>
                    </Form>
                </Card></div>}
                <Card styles={{body: {padding: screens.sm ? 24 : 12, minWidth: 0}}}>
                    {isGuest ? <AntTable rowKey="id" dataSource={guests.data} pagination={false} scroll={{x: 720}}
                                         locale={{emptyText: 'Ainda não existem convidados.'}}
                                         columns={[
                                             {title: 'Nome', dataIndex: 'name'},
                                             {
                                                 title: 'Mesa',
                                                 dataIndex: 'table',
                                                 render: (value: string | null) => value ?? 'Sem mesa'
                                             },
                                             {title: 'Máximo de pessoas', dataIndex: 'maxGuests'},
                                             {
                                                 title: 'Ligação',
                                                 key: 'link',
                                                 render: (_, guest) => invitation.slug && guest.slug ?
                                                     <KonvitteGuestLink invitationSlug={invitation.slug}
                                                                        guestSlug={guest.slug}/> :
                                                     <Typography.Text type="secondary">Ligação
                                                         indisponível</Typography.Text>
                                             },
                                             {
                                                 ...tableActionsColumn,
                                                 width: screens.lg ? 260 : 140,
                                                 render: (_, guest) => <Flex vertical={!screens.lg} wrap gap="small"
                                                                             justify="end" align="end">
                                                     <Button icon={<EditOutlined/>} disabled={busy}
                                                             onClick={() => editGuest(guest)}
                                                             aria-label={`Editar ${guest.name}`}>Editar</Button>
                                                     {invitation.slug && guest.slug && <Button href={guestRoute.url({
                                                         slug: invitation.slug,
                                                         guestSlug: guest.slug
                                                     })} target="_blank" rel="noreferrer">Abrir convite</Button>}
                                                 </Flex>
                                             },
                                         ]}/> :
                        <AntTable rowKey="id" dataSource={tables} pagination={false} scroll={{x: 580}}
                                  locale={{emptyText: 'Ainda não existem mesas.'}}
                                  columns={[{title: 'Nome', dataIndex: 'name'}, {
                                      title: 'Capacidade',
                                      key: 'capacity',
                                      render: (_, table) => capacityLabel(table)
                                  }, {
                                      title: 'Lugares previstos',
                                      dataIndex: 'allocatedSeats'
                                  }, {title: 'Convidados registados', dataIndex: 'guestCount'}]}/>}
                    {isGuest && guests.last_page > 1 &&
                        <Flex justify="end" style={{marginTop: 16}}><Pagination current={guests.current_page}
                                                                                total={guests.last_page * 10}
                                                                                pageSize={10} showSizeChanger={false}
                                                                                simple={!screens.sm} disabled={busy}
                                                                                onChange={paginate}/></Flex>}
                </Card>
            </> : <Card><Empty description="Crie e guarde um convite antes de adicionar mesas ou convidados."/></Card>}
        </Flex>
    </>;
}
