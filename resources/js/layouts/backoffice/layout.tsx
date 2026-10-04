import {Link, router, usePage} from '@inertiajs/react';
import {
    CalendarOutlined,
    DashboardOutlined,
    HeartOutlined,
    LogoutOutlined,
    MenuOutlined,
    MoonOutlined,
    SettingOutlined,
    SunOutlined,
    TeamOutlined
} from '@ant-design/icons';
import {Avatar, Button, Drawer, Dropdown, Flex, Grid, Layout, Menu, theme, Typography} from 'antd';
import {type PropsWithChildren, useState} from 'react';
import {useAppearance} from '@/hooks/use-appearance';
import {useInitials} from '@/hooks/use-initials';
import {logout} from '@/routes';
import type {Auth} from '@/types/auth';

export default function BackofficeLayout({children}: PropsWithChildren) {
    const page = usePage<{ auth: Auth }>();
    const user = page.props.auth.user;
    const {resolvedAppearance, updateAppearance} = useAppearance();
    const initials = useInitials();
    const screens = Grid.useBreakpoint();
    const {token} = theme.useToken();
    const [mobileOpen, setMobileOpen] = useState(false);
    const currentPath = page.url.split('?')[0];
    const toggleTheme = () => updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    const signOut = () => router.post(logout().url);
    const navLink = (label: string, path: string) => ({
        key: path,
        label: <Link href={path} onClick={() => setMobileOpen(false)}>{label}</Link>
    });
    const items = [
        {...navLink('Painel', '/backoffice'), icon: <DashboardOutlined/>},
        {
            key: 'eventtu',
            label: 'Eventtu',
            icon: <CalendarOutlined/>,
            children: [navLink('Eventos', '/backoffice/eventtu/eventos'), navLink('Tipos de eventos', '/backoffice/eventtu/event-types')]
        },
        {
            key: 'konvitte',
            label: 'Konvitte',
            icon: <HeartOutlined/>,
            children: [navLink('Convites', '/backoffice/konvitte/invitations'), navLink('Mesas', '/backoffice/konvitte/tables'), navLink('Convidados', '/backoffice/konvitte/guests')]
        },
        {
            key: 'settings',
            label: 'Configurações',
            icon: <SettingOutlined/>,
            children: [{
                key: 'access',
                label: 'Controlo de acesso',
                icon: <TeamOutlined/>,
                children: [navLink('Utilizadores', '/backoffice/users'), navLink('Grupos de utilizadores', '/backoffice/groups'), navLink('Permissões', '/backoffice/permissions')]
            }]
        },
    ];
    const routes = ['/backoffice/konvitte/invitations', '/backoffice/konvitte/tables', '/backoffice/konvitte/guests', '/backoffice/eventtu/eventos', '/backoffice/eventtu/event-types', '/backoffice/users', '/backoffice/groups', '/backoffice/permissions'];
    const selected = routes.find((path) => currentPath === path || currentPath.startsWith(`${path}/`)) ?? '/backoffice';
    const openKeys = currentPath.includes('/konvitte/') ? ['konvitte'] : currentPath.includes('/eventtu/') ? ['eventtu'] : selected !== '/backoffice' ? ['settings', 'access'] : [];
    const navigation = <Flex vertical gap="large" style={{height: '100%'}}>
        <div style={{padding: 24}}><Typography.Title level={3} style={{margin: 0}}><Link
            href="/backoffice">Sonild</Link></Typography.Title><Typography.Text
            type="secondary">Administração</Typography.Text></div>
        <Menu key={selected} mode="inline" selectedKeys={[selected]} defaultOpenKeys={openKeys} items={items}
              style={{borderInlineEnd: 0, flex: 1}}/>
        <Flex align="center" gap="small" style={{padding: 16}}>
            <Avatar src={user.avatar}>{initials(user.name)}</Avatar>
            <Flex vertical style={{minWidth: 0, flex: 1}}><Typography.Text
                ellipsis>{user.name}</Typography.Text><Typography.Text type="secondary"
                                                                       ellipsis>{user.email}</Typography.Text></Flex>
            <Button type="text" icon={<LogoutOutlined/>} aria-label="Sair" onClick={signOut}/>
        </Flex>
    </Flex>;
    return <Layout style={{minHeight: '100vh'}}>
        {screens.lg && <Layout.Sider width={272} theme={resolvedAppearance === 'dark' ? 'dark' : 'light'} style={{
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflow: 'auto',
            background: token.colorBgContainer
        }}>{navigation}</Layout.Sider>}
        <Drawer title="Menu" placement="left" open={mobileOpen && !screens.lg} onClose={() => setMobileOpen(false)}
                styles={{body: {padding: 0}}}>{navigation}</Drawer>
        <Layout style={{minWidth: 0}}>
            <Layout.Header style={{
                padding: screens.sm ? '0 24px' : '0 12px',
                background: token.colorBgContainer,
                position: 'sticky',
                top: 0,
                zIndex: 10,
                borderBottom: `1px solid ${token.colorBorderSecondary}`
            }}>
                <Flex justify="space-between" align="center" style={{height: '100%'}}>
                    <Flex align="center" gap="small">{!screens.lg &&
                        <Button type="text" icon={<MenuOutlined/>} aria-label="Abrir menu"
                                onClick={() => setMobileOpen(true)}/>}<Typography.Text
                        strong>Sonild</Typography.Text></Flex>
                    <Flex align="center" gap="small">
                        <Button type="text" icon={resolvedAppearance === 'dark' ? <SunOutlined/> : <MoonOutlined/>}
                                aria-label="Mudar tema" onClick={toggleTheme}/>
                        <Dropdown trigger={['click']} menu={{
                            items: [{
                                key: 'theme',
                                label: resolvedAppearance === 'dark' ? 'Tema claro' : 'Tema escuro',
                                onClick: toggleTheme
                            }, {key: 'logout', label: 'Sair', icon: <LogoutOutlined/>, danger: true, onClick: signOut}]
                        }}>
                            <Button type="text" aria-label="Abrir menu do utilizador" icon={<Avatar size="small"
                                                                                                    src={user.avatar}>{initials(user.name)}</Avatar>}>{screens.sm ? user.name : null}</Button>
                        </Dropdown>
                    </Flex>
                </Flex>
            </Layout.Header>
            <Layout.Content
                style={{padding: screens.lg ? 32 : screens.sm ? 24 : 12, minWidth: 0}}>{children}</Layout.Content>
        </Layout>
    </Layout>;
}
