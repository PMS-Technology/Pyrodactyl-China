import { useStoreState } from 'easy-peasy';
import isEqual from 'react-fast-compare';

import FlashMessageRender from '@/components/FlashMessageRender';
import ActionButton from '@/components/elements/ActionButton';
import Can from '@/components/elements/Can';
import CopyOnClick from '@/components/elements/CopyOnClick';
import Label from '@/components/elements/Label';
import { MainPageHeader } from '@/components/elements/MainPageHeader';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import ReinstallServerBox from '@/components/server/settings/ReinstallServerBox';

import { ip } from '@/lib/formatters';

import { ServerContext } from '@/state/server';

import RenameServerBox from './RenameServerBox';

const SettingsContainer = () => {
    const username = useStoreState((state) => state.user.data!.username);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const node = ServerContext.useStoreState((state) => state.server.data!.node);
    const sftp = ServerContext.useStoreState((state) => state.server.data!.sftpDetails, isEqual);

    return (
        <ServerContentBlock title={'设置'}>
            <FlashMessageRender byKey={'settings'} />
            <MainPageHeader direction='column' title={'设置'}>
                <p className='text-sm text-neutral-400 leading-relaxed'>
                    配置您的服务器设置，管理 SFTP 访问权限，并访问调试信息。根据需要更改服务器名称和重新安装。
                </p>
            </MainPageHeader>
            <Can action={'settings.rename'}>
                <div className={`mb-6 md:mb-10`}>
                    <RenameServerBox />
                </div>
            </Can>

            <div className='w-full h-full flex flex-col gap-8'>
                <Can action={'settings.reinstall'}>
                    <ReinstallServerBox />
                </Can>
                <TitledGreyBox title={'调试信息'}>
                    <div className={`flex items-center justify-between text-sm`}>
                        <p>节点</p>
                        <code className={`font-mono bg-zinc-900 rounded-sm py-1 px-2`}>{node}</code>
                    </div>
                    <CopyOnClick text={uuid}>
                        <div className={`flex items-center justify-between mt-2 text-sm`}>
                            <p>服务器 ID</p>
                            <code className={`font-mono bg-zinc-900 rounded-sm py-1 px-2`}>{uuid}</code>
                        </div>
                    </CopyOnClick>
                </TitledGreyBox>
                <Can action={'file.sftp'}>
                    <TitledGreyBox title={'SFTP 详情'} className={`mb-6 md:mb-10`}>
                        <div className={`flex items-center justify-between text-sm`}>
                            <Label>服务器地址</Label>
                            <CopyOnClick text={`sftp://${ip(sftp.ip)}:${sftp.port}`}>
                                <code
                                    className={`font-mono bg-zinc-900 rounded-sm py-1 px-2`}
                                >{`sftp://${ip(sftp.ip)}:${sftp.port}`}</code>
                            </CopyOnClick>
                        </div>
                        <div className={`mt-2 flex items-center justify-between text-sm`}>
                            <Label>用户名</Label>
                            <CopyOnClick text={`${username}.${id}`}>
                                <code
                                    className={`font-mono bg-zinc-900 rounded-sm py-1 px-2`}
                                >{`${username}.${id}`}</code>
                            </CopyOnClick>
                        </div>
                        <div className={`mt-6 flex items-center`}>
                            <div className={`flex-1`}>
                                <div className={`border-l-4 border-brand p-3`}>
                                    <p className={`text-xs text-zinc-200`}>
                                        您的 SFTP 密码与您用来访问此面板的密码相同。
                                    </p>
                                </div>
                            </div>
                            <div className={`ml-4`}>
                                <a href={`sftp://${username}.${id}@${ip(sftp.ip)}:${sftp.port}`}>
                                    <ActionButton variant='secondary'>启动 SFTP</ActionButton>
                                </a>
                            </div>
                        </div>
                    </TitledGreyBox>
                </Can>
            </div>
        </ServerContentBlock>
    );
};

export default SettingsContainer;