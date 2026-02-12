import ScreenBlock from '@/components/elements/ScreenBlock';

import { ServerContext } from '@/state/server';

import Spinner from '../elements/Spinner';

const ConflictStateRenderer = () => {
    const status = ServerContext.useStoreState((state) => state.server.data?.status || null);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data?.isTransferring || false);
    const isNodeUnderMaintenance = ServerContext.useStoreState(
        (state) => state.server.data?.isNodeUnderMaintenance || false,
    );

    return status === 'installing' || status === 'install_failed' || status === 'reinstall_failed' ? (
        <div className={'flex flex-col items-center justify-center h-full'}>
            <Spinner size={'large'} />
            <div className='flex flex-col mt-4 text-center'>
                <label className='text-neutral-100 text-lg font-bold'>服务器正在安装</label>
                <label className='text-neutral-500 text-md font-semibold mt-1'>
                    您的服务器即将准备就绪，更多详情请访问主页。
                </label>
            </div>
        </div>
    ) : status === 'suspended' ? (
        <ScreenBlock title={'服务器已暂停'} message={'此服务器已暂停，无法访问。'} />
    ) : isNodeUnderMaintenance ? (
        <ScreenBlock
            title={'节点维护中'}
            message={'此服务器的节点当前正在维护中。'}
        />
    ) : (
        <ScreenBlock
            title={isTransferring ? '转移中' : '从备份恢复中'}
            message={
                isTransferring
                    ? '您的服务器正在转移到新节点，请稍后查看。'
                    : '您的服务器当前正在从备份恢复，请几分钟后查看。'
            }
        />
    );
};

export default ConflictStateRenderer;
