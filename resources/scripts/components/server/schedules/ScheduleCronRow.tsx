import clsx from 'clsx';

import { Schedule } from '@/api/server/schedules/getServerSchedules';

interface Props {
    cron: Schedule['cron'];
    className?: string;
}

const ScheduleCronRow = ({ cron, className }: Props) => (
    <div className={clsx('flex flex-wrap gap-4 justify-center m-auto', className)}>
        <div className={'text-center'}>
            <p className={'font-medium'}>{cron.minute}</p>
            <p className={'text-xs text-zinc-500 uppercase'}>分钟</p>
        </div>
        <div className={'text-center'}>
            <p className={'font-medium'}>{cron.hour}</p>
            <p className={'text-xs text-zinc-500 uppercase'}>小时</p>
        </div>
        <div className={'text-center'}>
            <p className={'font-medium'}>{cron.dayOfMonth}</p>
            <p className={'text-xs text-zinc-500 uppercase'}>每月几号</p>
        </div>
        <div className={'text-center'}>
            <p className={'font-medium'}>{cron.month}</p>
            <p className={'text-xs text-zinc-500 uppercase'}>月份</p>
        </div>
        <div className={'text-center'}>
            <p className={'font-medium'}>{cron.dayOfWeek}</p>
            <p className={'text-xs text-zinc-500 uppercase'}>星期几</p>
        </div>
    </div>
);

export default ScheduleCronRow;