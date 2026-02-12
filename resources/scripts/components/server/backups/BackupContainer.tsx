import { Form, Formik, Field as FormikField, FormikHelpers, useFormikContext } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { boolean, object, string } from 'yup';

import FlashMessageRender from '@/components/FlashMessageRender';
import ActionButton from '@/components/elements/ActionButton';
import Can from '@/components/elements/Can';
import Field from '@/components/elements/Field';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import FormikSwitchV2 from '@/components/elements/FormikSwitchV2';
import { Textarea } from '@/components/elements/Input';
import { MainPageHeader } from '@/components/elements/MainPageHeader';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import Pagination from '@/components/elements/Pagination';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Spinner from '@/components/elements/Spinner';
import { PageListContainer } from '@/components/elements/pages/PageList';

import { Context as ServerBackupContext } from '@/api/swr/getServerBackups';

import { ServerContext } from '@/state/server';

import useFlash from '@/plugins/useFlash';
import { useUnifiedBackups } from './useUnifiedBackups';
import BackupItem from './BackupItem';

// Helper function to format storage values
const formatStorage = (mb: number | undefined | null): string => {
    if (mb === null || mb === undefined) {
        return '0MB';
    }
    if (mb >= 1024) {
        return `${(mb / 1024).toFixed(1)}GB`;
    }
    return `${mb.toFixed(1)}MB`;
};

interface BackupValues {
    name: string;
    ignored: string;
    isLocked: boolean;
}

const ModalContent = ({ ...props }: RequiredModalProps) => {
    const { isSubmitting } = useFormikContext<BackupValues>();

    return (
        <Modal {...props} showSpinnerOverlay={isSubmitting} title='创建服务器备份'>
            <Form>
                <FlashMessageRender byKey={'backups:create'} />
                <Field
                    name={'name'}
                    label={'备份名称'}
                    description={'如果提供，将用作引用此备份的名称。'}
                />
                <div className={`mt-6 flex flex-col`}>
                    <FormikFieldWrapper
                        className='flex flex-col gap-2'
                        name={'ignored'}
                        label={'忽略的文件和目录'}
                        description={`
                            输入生成此备份时要忽略的文件或文件夹。留空则使用
                            服务器目录根目录中的.pteroignore文件内容（如果存在）。
                            支持文件和文件夹的通配符匹配，也可以通过在路径前
                            添加感叹号来否定规则。
                        `}
                    >
                        <FormikField
                            as={Textarea}
                            className='px-4 py-2 rounded-lg outline-hidden bg-[#ffffff17] text-sm'
                            name={'ignored'}
                            rows={6}
                        />
                    </FormikFieldWrapper>
                </div>
                <Can action={'backup.delete'}>
                    <div className={`my-6`}>
                        <FormikSwitchV2
                            name={'isLocked'}
                            label={'锁定'}
                            description={'防止此备份被删除，直到明确解锁为止。'}
                        />
                    </div>
                </Can>
                <div className={`flex justify-end mb-6`}>
                    <ActionButton variant='primary' type={'submit'} disabled={isSubmitting}>
                        {isSubmitting && <Spinner size='small' />}
                        {isSubmitting ? '正在创建备份...' : '开始备份'}
                    </ActionButton>
                </div>
            </Form>
        </Modal>
    );
};

const BackupContainer = () => {
    const { page, setPage } = useContext(ServerBackupContext);
    const { clearFlashes, clearAndAddHttpError, addFlash } = useFlash();
    const [createModalVisible, setCreateModalVisible] = useState(false);

    const {
        backups,
        backupCount,
        storage,
        error,
        isValidating,
        createBackup
    } = useUnifiedBackups();

    const backupLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.backups);
    const backupStorageLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.backupStorageMb);

    useEffect(() => {
        clearFlashes('backups:create');
    }, [createModalVisible]);

    const submitBackup = async (values: BackupValues, { setSubmitting }: FormikHelpers<BackupValues>) => {
        clearFlashes('backups:create');

        try {
            await createBackup(values.name, values.ignored, values.isLocked);

            // Clear any existing flash messages
            clearFlashes('backups');
            clearFlashes('backups:create');

            setSubmitting(false);
            setCreateModalVisible(false);
        } catch (error) {
            clearAndAddHttpError({ key: 'backups:create', error });
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (!error) {
            clearFlashes('backups');
            return;
        }

        clearAndAddHttpError({ error, key: 'backups' });
    }, [error]);

    if (!backups || (error && isValidating)) {
        return (
            <ServerContentBlock title={'Backups'}>
                <FlashMessageRender byKey={'backups'} />
                <MainPageHeader direction='column' title={'备份'}>
                    <p className='text-sm text-neutral-400 leading-relaxed'>
                        创建和管理服务器备份以保护您的数据。安排自动备份，下载
                        现有备份，并在需要时恢复。
                    </p>
                </MainPageHeader>
                <div className='flex items-center justify-center py-12'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-brand'></div>
                </div>
            </ServerContentBlock>
        );
    }

    return (
        <ServerContentBlock title={'Backups'}>
            <FlashMessageRender byKey={'backups'} />
            <MainPageHeader
                direction='column'
                title={'备份'}
                titleChildren={
                    <Can action={'backup.create'}>
                        <div className='flex flex-col sm:flex-row items-center justify-end gap-4'>
                            <div className='flex flex-col gap-1 text-center sm:text-right'>
                                {/* Backup Count Display */}
                                {backupLimit === null && (
                                    <p className='text-sm text-zinc-300'>
                                        {backupCount} 个备份
                                    </p>
                                )}
                                {backupLimit > 0 && (
                                    <p className='text-sm text-zinc-300'>
                                        {backupCount} / {backupLimit} 个备份
                                    </p>
                                )}
                                {backupLimit === 0 && (
                                    <p className='text-sm text-red-400'>
                                        备份已禁用
                                    </p>
                                )}

                                {/* Storage Usage Display */}
                                {storage && (
                                    <div className='flex flex-col gap-0.5'>
                                        {backupStorageLimit === null ? (
                                            <p
                                                className='text-sm text-zinc-300 cursor-help'
                                                title={`已使用 ${storage.used_mb?.toFixed(2) || 0}MB（无限制）`}
                                            >
                                                <span className='font-medium'>{formatStorage(storage.used_mb)}</span> 存储已使用
                                            </p>
                                        ) : (
                                            <>
                                                <p
                                                    className='text-sm text-zinc-300 cursor-help'
                                                    title={`已使用 ${storage.used_mb?.toFixed(2) || 0}MB，共 ${backupStorageLimit}MB（可用 ${storage.available_mb?.toFixed(2) || 0}MB）`}
                                                >
                                                    <span className='font-medium'>{formatStorage(storage.used_mb)}</span> {' '}
                                                    {backupStorageLimit === null ?
                                                        "used" :
                                                        (<span className='font-medium'>of {formatStorage(backupStorageLimit)} used</span>)}
                                                </p>

                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            {(backupLimit === null || backupLimit > backupCount) &&
                                (!backupStorageLimit || !storage?.is_over_limit) && (
                                    <ActionButton variant='primary' onClick={() => setCreateModalVisible(true)}>
                                        新建备份
                                    </ActionButton>
                                )}
                        </div>
                    </Can>
                }
            >
                <p className='text-sm text-neutral-400 leading-relaxed'>
                    创建和管理服务器备份以保护您的数据。安排自动备份，下载现有
                    备份，并在需要时恢复。
                </p>
            </MainPageHeader>

            {createModalVisible && (
                <Formik
                    onSubmit={submitBackup}
                    initialValues={{ name: '', ignored: '', isLocked: false }}
                    validationSchema={object().shape({
                        name: string().max(191),
                        ignored: string(),
                        isLocked: boolean(),
                    })}
                >
                    <ModalContent visible={createModalVisible} onDismissed={() => setCreateModalVisible(false)} />
                </Formik>
            )}

            {backups.length === 0 ? (
                <div className='flex flex-col items-center justify-center min-h-[60vh] py-12 px-4'>
                    <div className='text-center'>
                        <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-[#ffffff11] flex items-center justify-center'>
                            <svg className='w-8 h-8 text-zinc-400' fill='currentColor' viewBox='0 0 20 20'>
                                <path
                                    fillRule='evenodd'
                                    d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                                    clipRule='evenodd'
                                />
                            </svg>
                        </div>
                        <h3 className='text-lg font-medium text-zinc-200 mb-2'>
                            {backupLimit === 0 ? '备份不可用' : '未找到备份'}
                        </h3>
                        <p className='text-sm text-zinc-400 max-w-sm'>
                            {backupLimit === 0
                                ? '无法为此服务器创建备份。'
                                : '您的服务器没有任何备份。创建一个备份以开始使用。'}
                        </p>
                    </div>
                </div>
            ) : (
                <PageListContainer>
                    {backups.map((backup) => (
                        <BackupItem key={backup.uuid} backup={backup} />
                    ))}
                </PageListContainer>
            )}
        </ServerContentBlock>
    );
};

const BackupContainerWrapper = () => {
    const [page, setPage] = useState<number>(1);
    return (
        <ServerBackupContext.Provider value={{ page, setPage }}>
            <BackupContainer />
        </ServerBackupContext.Provider>
    );
};

export default BackupContainerWrapper;