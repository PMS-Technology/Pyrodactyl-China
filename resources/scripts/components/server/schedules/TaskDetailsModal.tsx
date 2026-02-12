import ModalContext from '@/context/ModalContext';
import { Form, Formik, Field as FormikField, FormikHelpers, useField } from 'formik';
import { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { boolean, number, object, string } from 'yup';

import FlashMessageRender from '@/components/FlashMessageRender';
import ActionButton from '@/components/elements/ActionButton';
import Field from '@/components/elements/Field';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import FormikSwitchV2 from '@/components/elements/FormikSwitchV2';
import { Textarea } from '@/components/elements/Input';
import Select from '@/components/elements/Select';

import asModal from '@/hoc/asModal';

import { httpErrorToHuman } from '@/api/http';
import createOrUpdateScheduleTask from '@/api/server/schedules/createOrUpdateScheduleTask';
import { Schedule, Task } from '@/api/server/schedules/getServerSchedules';

import { ServerContext } from '@/state/server';

import useFlash from '@/plugins/useFlash';

// TODO: Port modern dropdowns to Formik and integrate them
// import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/elements/DropdownMenu';
// import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
// import HugeIconsArrowUp from '@/components/elements/hugeicons/ArrowUp';

const Label = styled.label`
    display: inline-block;
    color: #ffffff77;
    font-size: 0.875rem;
    padding-bottom: 0.5rem;
`;

interface Props {
    schedule: Schedule;
    // If a task is provided we can assume we're editing it. If not provided,
    // we are creating a new one.
    task?: Task;
}

interface Values {
    action: string;
    payload: string;
    timeOffset: string;
    continueOnFailure: boolean;
}

const schema = object().shape({
    action: string().required().oneOf(['command', 'power', 'backup']),
    payload: string().when('action', {
        is: (v) => v !== 'backup',
        then: () => string().required('必须提供任务载荷。'),
        otherwise: () => string(),
    }),
    continueOnFailure: boolean(),
    timeOffset: number()
        .typeError('时间偏移量必须是0到900之间的有效数字。')
        .required('必须提供时间偏移量。')
        .min(0, '时间偏移量必须至少为0秒。')
        .max(900, '时间偏移量必须小于900秒。'),
});

const ActionListener = () => {
    const [{ value }, { initialValue: initialAction }] = useField<string>('action');
    const [, { initialValue: initialPayload }, { setValue, setTouched }] = useField<string>('payload');

    useEffect(() => {
        if (value !== initialAction) {
            setValue(value === 'power' ? 'start' : '');
            setTouched(false);
        } else {
            setValue(initialPayload || '');
            setTouched(false);
        }
    }, [value]);

    return null;
};

const TaskDetailsModal = ({ schedule, task }: Props) => {
    const { dismiss, setPropOverrides } = useContext(ModalContext);
    const { clearFlashes, addError } = useFlash();

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const appendSchedule = ServerContext.useStoreActions((actions) => actions.schedules.appendSchedule);
    const backupLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.backups);

    useEffect(() => {
        return () => {
            clearFlashes('schedule:task');
        };
    }, []);

    useEffect(() => {
        setPropOverrides({ title: task ? '编辑任务' : '创建任务' });
    }, []);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('schedule:task');
        if (backupLimit === 0 && values.action === 'backup') {
            setSubmitting(false);
            addError({
                message: "当服务器的备份限制设置为0时，无法创建备份任务。",
                key: 'schedule:task',
            });
        } else {
            createOrUpdateScheduleTask(uuid, schedule.id, task?.id, values)
                .then((task) => {
                    let tasks = schedule.tasks.map((t) => (t.id === task.id ? task : t));
                    if (!schedule.tasks.find((t) => t.id === task.id)) {
                        tasks = [...tasks, task];
                    }

                    appendSchedule({ ...schedule, tasks });
                    dismiss();
                })
                .catch((error) => {
                    console.error(error);
                    setSubmitting(false);
                    addError({ message: httpErrorToHuman(error), key: 'schedule:task' });
                });
        }
    };

    return (
        <div className='min-w-full'>
            <Formik
                onSubmit={submit}
                validationSchema={schema}
                initialValues={{
                    action: task?.action || 'command',
                    payload: task?.payload || '',
                    timeOffset: task?.timeOffset.toString() || '0',
                    continueOnFailure: task?.continueOnFailure || false,
                }}
            >
                {({ isSubmitting, values }) => (
                    <Form>
                        <FlashMessageRender byKey={'schedule:task'} />
                        <div className={`flex flex-col gap-3`}>
                            <div>
                                <Label>操作</Label>
                                <ActionListener />
                                <FormikFieldWrapper name={'action'}>
                                    <FormikField
                                        className='px-4 py-2 bg-[#ffffff11] rounded-lg min-w-full'
                                        as={Select}
                                        name={'action'}
                                    >
                                        <option className='bg-black' value={'command'}>
                                            发送命令
                                        </option>
                                        <option className='bg-black' value={'power'}>
                                            电源
                                        </option>
                                        <option className='bg-black' value={'backup'}>
                                            创建备份
                                        </option>
                                    </FormikField>
                                </FormikFieldWrapper>
                            </div>
                            <div>
                                <Field
                                    name={'timeOffset'}
                                    label={'时间偏移量（秒）'}
                                    description={
                                        '在前一个任务执行后等待的时间，然后运行此任务。如果这是计划中的第一个任务，则不会应用此设置。'
                                    }
                                />
                            </div>
                        </div>
                        <div className={`my-6`}>
                            {values.action === 'command' ? (
                                <div>
                                    <Label>载荷</Label>
                                    <FormikFieldWrapper name={'payload'}>
                                        <FormikField
                                            className='w-full rounded-xl p-2 bg-[#ffffff11]'
                                            as={Textarea}
                                            name={'payload'}
                                            rows={6}
                                        />
                                    </FormikFieldWrapper>
                                </div>
                            ) : values.action === 'power' ? (
                                <div>
                                    <Label>载荷</Label>
                                    <FormikFieldWrapper name={'payload'}>
                                        <FormikField
                                            className='px-4 py-2 bg-[#ffffff11] rounded-lg min-w-full'
                                            as={Select}
                                            name={'payload'}
                                        >
                                            <option className='bg-black' value={'start'}>
                                                启动服务器
                                            </option>
                                            <option className='bg-black' value={'restart'}>
                                                重启服务器
                                            </option>
                                            <option className='bg-black' value={'stop'}>
                                                停止服务器
                                            </option>
                                            <option className='bg-black' value={'kill'}>
                                                终止服务器
                                            </option>
                                        </FormikField>
                                    </FormikFieldWrapper>
                                </div>
                            ) : (
                                <div>
                                    <Label>忽略的文件（可选）</Label>
                                    <FormikFieldWrapper
                                        name={'payload'}
                                        description={
                                            '包含在此备份中要排除的文件和文件夹。默认情况下，将使用您的.pteroignore文件的内容。如果您已达到备份限制，最旧的备份将被轮换。'
                                        }
                                    >
                                        <FormikField
                                            className='w-full rounded-2xl bg-[#ffffff11]'
                                            as={Textarea}
                                            name={'payload'}
                                            rows={6}
                                        />
                                    </FormikFieldWrapper>
                                </div>
                            )}
                        </div>
                        <FormikSwitchV2
                            name={'continueOnFailure'}
                            description={'如果此任务失败，未来的任务将继续运行。'}
                            label={'失败时继续'}
                        />
                        <div className={`flex justify-end my-6`}>
                            <ActionButton variant='primary' type={'submit'} disabled={isSubmitting}>
                                {task ? '保存更改' : '创建任务'}
                            </ActionButton>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default asModal<Props>()(TaskDetailsModal);