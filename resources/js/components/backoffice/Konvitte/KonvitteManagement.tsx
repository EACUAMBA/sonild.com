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
    notExtendedToChildren: boolean;
    slug: string | null
};
type Invitation = { id: number; name: string; slug: string | null };
type Table = { id: number; name: string; guestCount: number; capacity: number | null; allocatedSeats: number };
export type KonvitteManagementProps = {
    invitation: Invitation | null;
    invitations: { id: number; name: string }[];
    tables: Table[];
    filters: { table: string | null };
    guests: {
        data: Guest[];
        current_page: number;
        last_page: number;
        total: number;
    };
};

const capacityLabel = (table: Table) => table.capacity === null ? 'Capacidade não definida' : `${table.capacity} lugares`;

export default function KonvitteManagement(props: KonvitteManagementProps & { section: 'tables' | 'guests' }) {
    // Reset forms when switching invitations, including navigation that preserves state.
    return <ManagementForm key={`${props.section}:${props.invitation?.id ?? 'none'}`} {...props}/>;
}

function ManagementForm({invitation, invitations, tables, guests, filters, section}: KonvitteManagementProps & {
    section: 'tables' | 'guests'
}) {
    const isGuest = section === 'guests';
    const title = isGuest ? 'Convidados' : 'Mesas';
    const [showTableForm, setShowTableForm] = useState(false);
    const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const tableFormRef = useRef<HTMLDivElement>(null);
    const guestFormRef = useRef<HTMLDivElement>(null);
    const form = useForm({
        name: '',
        tableId: '',
        tableName: '',
        tableCapacity: '',
        maxGuests: '1',
        notExtendedToChildren: '1'
    });
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
            maxGuests: String(guest.maxGuests),
            notExtendedToChildren: guest.notExtendedToChildren ? '1' : '0'
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
    const resetTableForm = () => {
        setEditingTable(null);
        tableForm.reset();
        tableForm.clearErrors();
        setShowTableForm(false);
    };
    const editTable = (table: Table) => {
        tableForm.clearErrors();
        tableForm.setData({name: table.name, capacity: table.capacity == null ? '' : String(table.capacity)});
        setEditingTable(table);
        tableFormRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
    };
    const submitTable = () => {
        if (!invitation) return;
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                if (isGuest) form.setData('tableName', tableForm.data.name.trim());
                resetTableForm();
            },
        };
        if (editingTable) {
            tableForm.put(`/backoffice/konvitte/tables/${invitation.id}/${editingTable.id}`, options);
        } else {
            tableForm.post(`/backoffice/konvitte/tables/${invitation.id}`, options);
        }
    };
    const filterGuests = (table: string | null, page = 1) => router.get(`/backoffice/konvitte/guests/${invitation!.id}`, {page, ...(table ? {table} : {})}, {
        preserveState: true,
        preserveScroll: true
    });
    const paginate = (page: number) => filterGuests(filters.table, page);
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
                {(!isGuest || showTableForm) && <div ref={tableFormRef} style={{scrollMarginTop: 88}}><Card
                    title={editingTable ? 'Editar mesa' : 'Adicionar mesa'}>
                    <Typography.Paragraph>Convite: <Typography.Text
                        strong>{invitation.name}</Typography.Text></Typography.Paragraph>
                    <Form key={editingTable?.id ?? 'new-table'} layout="vertical" fields={tableFields}
                          onValuesChange={(values) => tableForm.setData({...tableForm.data, ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value == null ? '' : String(value)]))})}
                          onFinish={submitTable} disabled={busy}>
                        <Row gutter={16}>
                            <Col xs={24} md={12}><Form.Item name="name" label="Nome da mesa" rules={[{
                                required: true,
                                whitespace: true
                            }]} {...fieldError(tableForm.errors.name)}><Input maxLength={120}/></Form.Item></Col>
                            <Col xs={24} md={12}><Form.Item name="capacity" label="Capacidade da mesa"
                                                            rules={[{required: !editingTable}]}
                                                            extra="Número de pessoas que a mesa suporta." {...fieldError(tableForm.errors.capacity)}><InputNumber
                                min={1} max={999} precision={0} style={{width: '100%'}}/></Form.Item></Col>
                        </Row>
                        <Flex vertical={!screens.sm} gap="small">
                            <Button type="primary" htmlType="submit" loading={tableForm.processing}
                                    block={!screens.sm}>{editingTable ? 'Guardar alterações' : 'Adicionar mesa'}</Button>
                            {editingTable && <Button disabled={busy} onClick={resetTableForm}>Cancelar edição</Button>}
                        </Flex>
                    </Form>
                </Card></div>}
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
                            <Col xs={24} md={12} lg={8}><Form.Item name="notExtendedToChildren"
                                                                   label="Convite extensivo a crianças"
                                                                   {...fieldError(form.errors.notExtendedToChildren)}>
                                <Select options={[
                                    {value: '1', label: 'Não extensivo a crianças'},
                                    {value: '0', label: 'Extensivo a crianças'},
                                ]}/>
                            </Form.Item></Col>
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
                    {isGuest && filters.table &&
                        <Flex wrap justify="space-between" align="center" gap="small" style={{marginBottom: 16}}>
                            <Typography.Text>Mesa: <Typography.Text
                                strong>{filters.table === 'none' ? 'Sem mesa' : tables.find((table) => String(table.id) === filters.table)?.name}</Typography.Text> · {guests.total} convidado(s)</Typography.Text>
                            <Button onClick={() => filterGuests(null)}>Limpar filtro</Button>
                        </Flex>}
                    {isGuest ? <AntTable rowKey="id" dataSource={guests.data} pagination={false} scroll={{x: 720}}
                                         locale={{
                                             emptyText: filters.table ? 'Não existem convidados nesta mesa.' : 'Ainda não existem convidados.',
                                             filterConfirm: 'Aplicar',
                                             filterReset: 'Limpar'
                                         }}
                                         onChange={(_, selectedFilters) => filterGuests(selectedFilters.table?.[0] != null ? String(selectedFilters.table[0]) : null)}
                                         columns={[
                                             {title: 'Nome', dataIndex: 'name'},
                                             {
                                                 title: 'Mesa',
                                                 dataIndex: 'table',
                                                 key: 'table',
                                                 filters: [{
                                                     text: 'Sem mesa',
                                                     value: 'none'
                                                 }, ...tables.map((table) => ({
                                                     text: table.name,
                                                     value: String(table.id)
                                                 }))],
                                                 filterMultiple: false,
                                                 filterSearch: true,
                                                 filteredValue: filters.table ? [filters.table] : null,
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
                                      title: 'Ocupação',
                                      dataIndex: 'allocatedSeats'
                                  }, {
                                      ...tableActionsColumn,
                                      width: 120,
                                      render: (_, table) => <Flex vertical={!screens.lg} wrap gap="small" justify="end"
                                                                  align="end"><Button icon={<EditOutlined/>}
                                                                                      disabled={busy}
                                                                                      onClick={() => editTable(table)}
                                                                                      aria-label={`Editar mesa ${table.name}`}>Editar</Button></Flex>
                                  }]}/>}
                    {isGuest && guests.last_page > 1 &&
                        <Flex justify="end" style={{marginTop: 16}}><Pagination current={guests.current_page}
                                                                                total={guests.total}
                                                                                pageSize={10} showSizeChanger={false}
                                                                                simple={!screens.sm} disabled={busy}
                                                                                onChange={paginate}/></Flex>}
                </Card>
            </> : <Card><Empty description="Crie e guarde um convite antes de adicionar mesas ou convidados."/></Card>}
        </Flex>
    </>;
}
