import { useStoreState } from 'easy-peasy';
import { useEffect, useState } from 'react';

import FlashMessageRender from '@/components/FlashMessageRender';
import Modal from '@/components/elements/Modal';
import { SocketEvent } from '@/components/server/events';

import { ServerContext } from '@/state/server';

import useFlash from '@/plugins/useFlash';

const SteamDiskSpaceFeature = () => {
    const [visible, setVisible] = useState(false);
    const [loading] = useState(false);

    const status = ServerContext.useStoreState((state) => state.status.value);
    const { clearFlashes } = useFlash();
    const { connected, instance } = ServerContext.useStoreState((state) => state.socket);
    const isAdmin = useStoreState((state) => state.user.data!.rootAdmin);

    useEffect(() => {
        if (!connected || !instance || status === 'running') return;

        const errors = ['steamcmd needs 250mb of free disk space to update', '0x202 after update job'];

        const listener = (line: string) => {
            if (errors.some((p) => line.toLowerCase().includes(p))) {
                setVisible(true);
            }
        };

        instance.addListener(SocketEvent.CONSOLE_OUTPUT, listener);

        return () => {
            instance.removeListener(SocketEvent.CONSOLE_OUTPUT, listener);
        };
    }, [connected, instance, status]);

    useEffect(() => {
        clearFlashes('feature:steamDiskSpace');
    }, []);

    return (
        <Modal
            visible={visible}
            onDismissed={() => setVisible(false)}
            showSpinnerOverlay={loading}
            dismissable={false}
            closeOnBackground={false}
            closeButton={true}
            title='可用磁盘空间不足'
        >
            <FlashMessageRender key={'feature:steamDiskSpace'} />
            <div className={`flex-col`}>
                {isAdmin ? (
                    <>
                        <p>
                            此服务器已用完可用磁盘空间，无法完成安装或更新过程。
                        </p>
                        <p className='mt-3'>
                            通过在托管此服务器的机器上输入 <code className={`font-mono bg-zinc-900 rounded-sm py-1 px-2`}>df -h</code> 来确保机器有足够的磁盘空间。删除文件或增加可用磁盘空间以解决此问题。
                        </p>
                    </>
                ) : (
                    <>
                        <p className={`mt-4`}>
                            此服务器已用完可用磁盘空间，无法完成安装或更新过程。请联系管理员并告知他们磁盘空间问题。
                        </p>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default SteamDiskSpaceFeature;
