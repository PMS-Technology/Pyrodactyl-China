import { For } from 'million/react';
import { useEffect, useState } from 'react';
import isEqual from 'react-fast-compare';

import FlashMessageRender from '@/components/FlashMessageRender';
import ActionButton from '@/components/elements/ActionButton';
import Can from '@/components/elements/Can';
import { MainPageHeader } from '@/components/elements/MainPageHeader';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { PageListContainer } from '@/components/elements/pages/PageList';
import AllocationRow from '@/components/server/network/AllocationRow';
import SubdomainManagement from '@/components/server/network/SubdomainManagement';

import createServerAllocation from '@/api/server/network/createServerAllocation';
import getServerAllocations from '@/api/swr/getServerAllocations';

import { ServerContext } from '@/state/server';

import { useDeepCompareEffect } from '@/plugins/useDeepCompareEffect';
import { useFlashKey } from '@/plugins/useFlash';

const NetworkContainer = () => {
    const [_, setLoading] = useState(false);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const allocationLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.allocations);
    const allocations = ServerContext.useStoreState((state) => state.server.data!.allocations, isEqual);
    const setServerFromState = ServerContext.useStoreActions((actions) => actions.server.setServerFromState);

    const { clearFlashes, clearAndAddHttpError } = useFlashKey('server:network');
    const { data, error, mutate } = getServerAllocations();

    useEffect(() => {
        mutate(allocations);
    }, []);

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [error]);

    useDeepCompareEffect(() => {
        if (!data) return;

        setServerFromState((state) => ({ ...state, allocations: data }));
    }, [data]);

    const onCreateAllocation = () => {
        clearFlashes();

        setLoading(true);
        createServerAllocation(uuid)
            .then((allocation) => {
                setServerFromState((s) => ({ ...s, allocations: s.allocations.concat(allocation) }));
                return mutate(data?.concat(allocation), false);
            })
            .catch((error) => clearAndAddHttpError(error))
            .then(() => setLoading(false));
    };

    return (
        <ServerContentBlock title={'网络'}>
            <FlashMessageRender byKey={'server:network'} />

            <MainPageHeader direction='column' title={'网络'}>
                <p className='text-sm text-neutral-400 leading-relaxed'>
                    配置服务器的网络设置。管理子域名、IP 地址和端口，这些是您的服务器用于接收传入连接的绑定设置。
                </p>
            </MainPageHeader>

            <div className='space-y-12'>
                <SubdomainManagement />

                <div className='bg-gradient-to-b from-[#ffffff08] to-[#ffffff05] border-[1px] border-[#ffffff12] rounded-xl p-6 shadow-sm mt-8'>
                    <div className='flex items-center justify-between mb-6'>
                        <h3 className='text-xl font-extrabold tracking-tight'>端口分配</h3>
                        {data && (
                            <Can action={'allocation.create'}>
                                <div className='flex items-center gap-4'>
                                    {allocationLimit === null && (
                                        <span className='text-sm text-zinc-400 bg-[#ffffff08] px-3 py-1 rounded-lg border border-[#ffffff15]'>
                                            {data.filter((allocation) => !allocation.isDefault).length} 个分配 (无限制)
                                        </span>
                                    )}
                                    {allocationLimit > 0 && (
                                        <span className='text-sm text-zinc-400 bg-[#ffffff08] px-3 py-1 rounded-lg border border-[#ffffff15]'>
                                            {data.filter((allocation) => !allocation.isDefault).length} / {allocationLimit}
                                        </span>
                                    )}
                                    {allocationLimit === 0 && (
                                        <span className='text-sm text-red-400 bg-[#ffffff08] px-3 py-1 rounded-lg border border-[#ffffff15]'>
                                            分配已禁用
                                        </span>
                                    )}
                                    {(allocationLimit === null || (allocationLimit > 0 && allocationLimit > data.filter((allocation) => !allocation.isDefault).length)) && (
                                        <ActionButton variant='primary' onClick={onCreateAllocation} size='sm'>
                                            新建分配
                                        </ActionButton>
                                    )}
                                </div>
                            </Can>
                        )}
                    </div>

                    {!data ? (
                        <div className='flex items-center justify-center py-12'>
                            <div className='flex flex-col items-center gap-3'>
                                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-brand'></div>
                                <p className='text-sm text-neutral-400'>加载分配中...</p>
                            </div>
                        </div>
                    ) : data.length > 0 ? (
                        <PageListContainer data-pyro-network-container-allocations>
                            <For each={data} memo>
                                {(allocation) => (
                                    <AllocationRow
                                        key={`${allocation.ip}:${allocation.port}`}
                                        allocation={allocation}
                                    />
                                )}
                            </For>
                        </PageListContainer>
                    ) : (
                        <div className='flex flex-col items-center justify-center py-12'>
                            <div className='text-center'>
                                <div className='w-12 h-12 mx-auto mb-4 rounded-full bg-[#ffffff11] flex items-center justify-center'>
                                    <svg className='w-6 h-6 text-zinc-400' fill='currentColor' viewBox='0 0 20 20'>
                                        <path
                                            fillRule='evenodd'
                                            d='M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                                            clipRule='evenodd'
                                        />
                                    </svg>
                                </div>
                                <h4 className='text-lg font-medium text-zinc-200 mb-2'>
                                    {allocationLimit === 0 ? '分配不可用' : '未找到分配'}
                                </h4>
                                <p className='text-sm text-zinc-400 max-w-sm text-center'>
                                    {allocationLimit === 0
                                        ? '此服务器无法创建网络分配。'
                                        : '创建您的第一个分配以开始使用。'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ServerContentBlock>
    );
};

export default NetworkContainer;