import { Actions, useStoreActions } from 'easy-peasy';
import { useEffect, useState } from 'react';

import ActionButton from '@/components/elements/ActionButton';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { Dialog } from '@/components/elements/dialog';

import { httpErrorToHuman } from '@/api/http';
import reinstallServer from '@/api/server/reinstallServer';

import { ApplicationStore } from '@/state';
import { ServerContext } from '@/state/server';

const ReinstallServerBox = () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const reinstall = () => {
        setLoading(true);
        clearFlashes('settings');
        reinstallServer(uuid)
            .then(() => {
                addFlash({
                    key: 'settings',
                    type: 'success',
                    message: '您的服务器已开始重新安装过程。',
                });
            })
            .catch((error) => {
                console.error(error);

                addFlash({ key: 'settings', type: 'error', message: httpErrorToHuman(error) });
            })
            .then(() => {
                setLoading(false);
                setModalVisible(false);
            });
    };

    useEffect(() => {
        clearFlashes();
    }, []);

    return (
        <TitledGreyBox title={'重新安装服务器'}>
            <Dialog.Confirm
                open={modalVisible}
                title={'确认重新安装服务器'}
                confirm={'是的，重新安装服务器'}
                onClose={() => setModalVisible(false)}
                onConfirmed={reinstall}
                loading={loading}
            >
                您的服务器将停止，在此过程中某些文件可能会被删除或修改，您确定要继续吗？
            </Dialog.Confirm>
            <p className={`text-sm`}>
                重新安装您的服务器将停止它，然后重新运行最初设置它的安装脚本。&nbsp;
                <strong className={`font-medium`}>
                    在此过程中某些文件可能会被删除或修改，请在继续之前备份您的数据。
                </strong>
            </p>
            <div className={`mt-6 text-right`}>
                <ActionButton variant='danger' onClick={() => setModalVisible(true)}>
                    重新安装服务器
                </ActionButton>
            </div>
        </TitledGreyBox>
    );
};

export default ReinstallServerBox;