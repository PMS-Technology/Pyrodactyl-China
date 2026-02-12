import ModalContext from '@/context/ModalContext';
import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
import { useStoreState } from 'easy-peasy';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useEffect, useMemo } from 'react';

import FlashMessageRender from '@/components/FlashMessageRender';
import ActionButton from '@/components/elements/ActionButton';
import Field from '@/components/elements/Field';
import FormikSwitchV2 from '@/components/elements/FormikSwitchV2';
import ItemContainer from '@/components/elements/ItemContainer';
import HugeIconsAlert from '@/components/elements/hugeicons/Alert';
import HugeIconsLink from '@/components/elements/hugeicons/Link';

import asModal from '@/hoc/asModal';

import { httpErrorToHuman } from '@/api/http';
import createOrUpdateSchedule from '@/api/server/schedules/createOrUpdateSchedule';
import { Schedule } from '@/api/server/schedules/getServerSchedules';

import { ServerContext } from '@/state/server';

import useFlash from '@/plugins/useFlash';

interface Props {
    schedule?: Schedule;
}

interface Values {
    name: string;
    dayOfWeek: string;
    month: string;
    dayOfMonth: string;
    hour: string;
    minute: string;
    enabled: boolean;
    onlyWhenOnline: boolean;
}

const getTimezoneInfo = (serverTimezone: string) => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();

    const userOffsetString = format(now, 'xxx');
    let serverOffsetString: string;
    let offsetDifferenceMinutes = 0;

    let isServerTimezoneValid = true;
    try {
        const serverDate = new TZDate(now, serverTimezone);
        const userDate = new TZDate(now, userTimezone);
        serverOffsetString = format(serverDate, 'xxx');

        // offset difference in minutes
        const serverOffsetValue = serverDate.getTimezoneOffset();
        const userOffsetValue = userDate.getTimezoneOffset();

        // + values mean behind UTC
        // - values mean ahead of UTC
        offsetDifferenceMinutes = userOffsetValue - serverOffsetValue;
    } catch {
        serverOffsetString = 'Unknown';
        isServerTimezoneValid = false;
    }

    let differenceDescription = '';
    if (!isServerTimezoneValid) {
        differenceDescription = 'at an unknown difference to';
    } else if (offsetDifferenceMinutes === 0) {
        differenceDescription = 'same time';
    } else {
        const offsetDifferenceHours = offsetDifferenceMinutes / 60;
        const absDifferenceHours = Math.abs(offsetDifferenceHours);
        const isAhead = offsetDifferenceMinutes > 0;

        if (absDifferenceHours === Math.floor(absDifferenceHours)) {
            // whole hours
            differenceDescription = `${absDifferenceHours} hour${absDifferenceHours !== 1 ? 's' : ''} ${isAhead ? 'ahead of' : 'behind'}`;
        } else {
            // hours & minutes
            const hours = Math.floor(absDifferenceHours);
            const minutes = Math.abs(offsetDifferenceMinutes % 60);

            if (hours > 0) {
                differenceDescription = `${hours}h ${minutes}m ${isAhead ? 'ahead of' : 'behind'}`;
            } else {
                differenceDescription = `${minutes} minute${minutes !== 1 ? 's' : ''} ${isAhead ? 'ahead of' : 'behind'}`;
            }
        }
    }

    return {
        user: { timezone: userTimezone, offset: userOffsetString },
        server: { timezone: serverTimezone, offset: serverOffsetString },
        difference: differenceDescription,
        isDifferent: userTimezone !== serverTimezone,
    };
};

const formatTimezoneDisplay = (timezone: string, offset: string) => {
    return `${timezone} (${offset})`;
};

const EditScheduleModal = ({ schedule }: Props) => {
    const { addError, clearFlashes } = useFlash();
    const { dismiss, setPropOverrides } = useContext(ModalContext);

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const appendSchedule = ServerContext.useStoreActions((actions) => actions.schedules.appendSchedule);
    const serverTimezone = useStoreState((state) => state.settings.data?.timezone || 'Unknown');

    const timezoneInfo = useMemo(() => {
        return getTimezoneInfo(serverTimezone);
    }, [serverTimezone]);

    useEffect(() => {
        setPropOverrides({ title: schedule ? '编辑计划' : '创建新计划' });
    }, []);

    useEffect(() => {
        return () => {
            clearFlashes('schedule:edit');
        };
    }, []);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('schedule:edit');
        createOrUpdateSchedule(uuid, {
            id: schedule?.id,
            name: values.name,
            cron: {
                minute: values.minute,
                hour: values.hour,
                dayOfWeek: values.dayOfWeek,
                month: values.month,
                dayOfMonth: values.dayOfMonth,
            },
            onlyWhenOnline: values.onlyWhenOnline,
            isActive: values.enabled,
        })
            .then((schedule) => {
                setSubmitting(false);
                appendSchedule(schedule);
                dismiss();
            })
            .catch((error) => {
                console.error(error);

                setSubmitting(false);
                addError({ key: 'schedule:edit', message: httpErrorToHuman(error) });
            });
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={
                {
                    name: schedule?.name || '',
                    minute: schedule?.cron.minute || '*/5',
                    hour: schedule?.cron.hour || '*',
                    dayOfMonth: schedule?.cron.dayOfMonth || '*',
                    month: schedule?.cron.month || '*',
                    dayOfWeek: schedule?.cron.dayOfWeek || '*',
                    enabled: schedule?.isActive ?? true,
                    onlyWhenOnline: schedule?.onlyWhenOnline ?? true,
                } as Values
            }
        >
            {({ isSubmitting }) => (
                <Form>
                    <FlashMessageRender byKey={'schedule:edit'} />
                    <Field
                        name={'name'}
                        label={'计划名称'}
                        description={'此计划的人类可读标识符。'}
                    />
                    <div className={`grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6`}>
                        <Field name={'minute'} label={'分钟'} />
                        <Field name={'hour'} label={'小时'} />
                        <Field name={'dayOfWeek'} label={'星期几'} />
                        <Field name={'dayOfMonth'} label={'每月几号'} />
                        <Field name={'month'} label={'月份'} />
                    </div>

                    <p className={`text-zinc-400 text-xs mt-2`}>
                        计划系统在定义任务何时开始运行时使用 Cronjob 语法。使用上述字段指定这些任务何时开始运行。
                    </p>

                    {timezoneInfo.isDifferent && (
                        <div className={'bg-blue-900/20 border border-blue-400/30 rounded-lg p-4 my-2'}>
                            <div className={'flex items-start gap-3'}>
                                <HugeIconsAlert
                                    fill='currentColor'
                                    className={'text-blue-400 mt-0.5 flex-shrink-0 h-5 w-5'}
                                />
                                <div className={'text-sm'}>
                                    <p className={'text-blue-100 font-medium mb-1'}>时区信息</p>
                                    <p className={'text-blue-200/80 text-xs mb-2'}>
                                        此处显示的时间是为服务器时区配置的。
                                        {timezoneInfo.difference !== 'same time' && (
                                            <span className={'text-blue-100 font-medium'}>
                                                {' '}
                                                服务器时区与您的时区{timezoneInfo.difference}。
                                            </span>
                                        )}
                                    </p>
                                    <div className={'mt-2 text-xs space-y-1'}>
                                        <div className={'text-blue-200/60'}>
                                            您的时区:
                                            <span className={'font-mono'}>
                                                {' '}
                                                {formatTimezoneDisplay(
                                                    timezoneInfo.user.timezone,
                                                    timezoneInfo.user.offset,
                                                )}
                                            </span>
                                        </div>
                                        <div className={'text-blue-200/60'}>
                                            服务器时区:
                                            <span className={'font-mono'}>
                                                {' '}
                                                {formatTimezoneDisplay(
                                                    timezoneInfo.server.timezone,
                                                    timezoneInfo.server.offset,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className='gap-3 my-6 flex flex-col'>
                        <a href='https://crontab.guru/' target='_blank' rel='noreferrer'>
                            <ItemContainer
                                description={'在线编辑器，用于 cron 计划表达式。'}
                                title={'Crontab Guru'}
                                // defaultChecked={showCheatsheet}
                                // onChange={() => setShowCheetsheet((s) => !s)}
                                labelClasses='cursor-pointer'
                            >
                                <HugeIconsLink fill='currentColor' className={`px-5 h-5 w-5`} />
                            </ItemContainer>
                        </a>
                        {/* This table would be pretty awkward to make look nice
                            Maybe there could be an element for a dropdown later? */}
                        {/* {showCheatsheet && (
                            <div className={`block md:flex w-full`}>
                                <ScheduleCheatsheetCards />
                            </div>
                        )} */}
                        <FormikSwitchV2
                            name={'onlyWhenOnline'}
                            description={'仅在服务器运行时执行此计划。'}
                            label={'仅在服务器在线时'}
                        />
                        <FormikSwitchV2
                            name={'enabled'}
                            description={'如果启用，此计划将自动执行。'}
                            label={'计划已启用'}
                        />
                    </div>
                    <div className={`mb-6 text-right`}>
                        <ActionButton
                            variant='primary'
                            className={'w-full sm:w-auto'}
                            type={'submit'}
                            disabled={isSubmitting}
                        >
                            {schedule ? '保存更改' : '创建计划'}
                        </ActionButton>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default asModal<Props>()(EditScheduleModal);