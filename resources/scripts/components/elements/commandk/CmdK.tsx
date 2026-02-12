import { Command } from 'cmdk';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import Can from '@/components/elements/Can';

import { ServerContext } from '@/state/server';

import ModrinthLogo from '../ModrinthLogo';
import HugeIconsClock from '../hugeicons/Clock';
import HugeIconsCloudUp from '../hugeicons/CloudUp';
import HugeIconsConnections from '../hugeicons/Connections';
import HugeIconsConsole from '../hugeicons/Console';
import HugeIconsController from '../hugeicons/Controller';
import HugeIconsDashboardSettings from '../hugeicons/DashboardSettings';
import HugeIconsDatabase from '../hugeicons/Database';
import HugeIconsFolder from '../hugeicons/Folder';
import HugeIconsHome from '../hugeicons/Home';
import HugeIconsPencil from '../hugeicons/Pencil';
import HugeIconsPeople from '../hugeicons/People';
import HugeIconsZap from '../hugeicons/Zap';

const CommandMenu = () => {
    const [open, setOpen] = useState(false);
    const id = ServerContext.useStoreState((state) => state.server.data?.id);
    const navigate = useNavigate();
    // controls server power status
    const status = ServerContext.useStoreState((state) => state.status.value);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);

    const cmdkPowerAction = (action: string) => {
        if (instance) {
            if (action === 'start') {
                toast.success('Your server is starting!');
            } else if (action === 'restart') {
                toast.success('Your server is restarting.');
            } else {
                toast.success('Your server is being stopped.');
            }
            setOpen(false);
            instance.send('set state', action === 'kill-confirmed' ? 'kill' : action);
        }
    };

    const cmdkNavigate = (url: string) => {
        navigate('/server/' + id + url);
        setOpen(false);
    };

    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    return (
        <Command.Dialog open={open} onOpenChange={setOpen} label='全局命令菜单'>
            <Command.Input />
            <Command.List>
                <Command.Empty>未找到结果。</Command.Empty>

                <Command.Group heading='页面'>
                    <Command.Item onSelect={() => cmdkNavigate('')}>
                        <HugeIconsHome fill='currentColor' />
                        首页
                    </Command.Item>
                    <Can action={'file.*'} matchAny>
                        <Command.Item onSelect={() => cmdkNavigate('/files')}>
                            <HugeIconsFolder fill='currentColor' />
                            文件
                        </Command.Item>
                    </Can>
                    <Can action={'database.*'} matchAny>
                        <Command.Item onSelect={() => cmdkNavigate('/databases')}>
                            <HugeIconsDatabase fill='currentColor' />
                            数据库
                        </Command.Item>
                    </Can>
                    <Can action={'backup.*'} matchAny>
                        <Command.Item onSelect={() => cmdkNavigate('/backups')}>
                            <HugeIconsCloudUp fill='currentColor' />
                            备份
                        </Command.Item>
                    </Can>
                    <Can action={'allocation.*'} matchAny>
                        <Command.Item onSelect={() => cmdkNavigate('/network')}>
                            <HugeIconsConnections fill='currentColor' />
                            网络
                        </Command.Item>
                    </Can>
                    <Can action={'user.*'} matchAny>
                        <Command.Item onSelect={() => cmdkNavigate('/users')}>
                            <HugeIconsPeople fill='currentColor' />
                            用户
                        </Command.Item>
                    </Can>
                    <Can action={['startup.*']} matchAny>
                        <Command.Item onSelect={() => cmdkNavigate('/startup')}>
                            <HugeIconsConsole fill='currentColor' />
                            启动项
                        </Command.Item>
                    </Can>
                    <Can action={['schedule.*']} matchAny>
                        <Command.Item onSelect={() => cmdkNavigate('/schedules')}>
                            <HugeIconsClock fill='currentColor' />
                            计划任务
                        </Command.Item>
                    </Can>
                    <Can action={['settings.*', 'file.sftp']} matchAny>
                        <Command.Item onSelect={() => cmdkNavigate('/settings')}>
                            <HugeIconsDashboardSettings fill='currentColor' />
                            设置
                        </Command.Item>
                    </Can>
                    <Can action={['activity.*']} matchAny>
                        <Command.Item onSelect={() => cmdkNavigate('/activity')}>
                            <HugeIconsPencil fill='currentColor' />
                            活动
                        </Command.Item>
                    </Can>
                    <Can action={['modrinth.*']} matchAny>
                        <Command.Item onSelect={() => cmdkNavigate('/mods')}>
                            <ModrinthLogo />
                            模组/插件
                        </Command.Item>
                    </Can>
                    <Can action={['software.*']} matchAny>
                        <Command.Item onSelect={() => cmdkNavigate('/shell')}>
                            <HugeIconsController fill='currentColor' />
                            软件
                        </Command.Item>
                    </Can>
                </Command.Group>
                <Command.Group heading='服务器'>
                    <Can action={'control.start'}>
                        <Command.Item disabled={status !== 'offline'} onSelect={() => cmdkPowerAction('start')}>
                            <HugeIconsZap fill='currentColor' />
                            启动服务器
                        </Command.Item>
                    </Can>
                    <Can action={'control.restart'}>
                        <Command.Item disabled={!status} onSelect={() => cmdkPowerAction('restart')}>
                            <HugeIconsZap fill='currentColor' />
                            重启服务器
                        </Command.Item>
                    </Can>
                    <Can action={'control.restart'}>
                        <Command.Item disabled={status === 'offline'} onSelect={() => cmdkPowerAction('stop')}>
                            <HugeIconsZap fill='currentColor' />
                            停止服务器
                        </Command.Item>
                    </Can>
                </Command.Group>
            </Command.List>
        </Command.Dialog>
    );
};

export default CommandMenu;
