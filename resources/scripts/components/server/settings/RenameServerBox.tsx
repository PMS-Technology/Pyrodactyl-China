import { Actions, useStoreActions } from 'easy-peasy';
import { Form, Formik } from 'formik';
import { toast } from 'sonner';
import { object, string } from 'yup';

import ActionButton from '@/components/elements/ActionButton';
import Field from '@/components/elements/Field';
import TitledGreyBox from '@/components/elements/TitledGreyBox';

import { httpErrorToHuman } from '@/api/http';
import renameServer from '@/api/server/renameServer';

import { ApplicationStore } from '@/state';
import { ServerContext } from '@/state/server';

interface Values {
    name: string;
    description: string;
}

const RenameServerForm = () => {
    return (
        <TitledGreyBox title={'服务器详情'}>
            <Form className='flex flex-col gap-4'>
                <Field id={'name'} name={'name'} label={'服务器名称'} type={'text'} />
                <Field id={'description'} name={'description'} label={'服务器描述'} type={'text'} />
                <div className={`mt-6 text-right`}>
                    <ActionButton variant='primary' type={'submit'}>
                        保存
                    </ActionButton>
                </div>
            </Form>
        </TitledGreyBox>
    );
};

const RenameServerBox = () => {
    const server = ServerContext.useStoreState((state) => state.server.data!);
    const setServer = ServerContext.useStoreActions((actions) => actions.server.setServer);
    const { addError, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const submit = ({ name, description }: Values) => {
        clearFlashes('settings');
        toast('正在更新服务器详情...');
        renameServer(server.uuid, name, description)
            .then(() => setServer({ ...server, name, description }))
            .catch((error) => {
                console.error(error);
                addError({ key: 'settings', message: httpErrorToHuman(error) });
            })
            .then(() => toast.success('服务器详情已更新！'));
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                name: server.name,
                description: server.description,
            }}
            validationSchema={object().shape({
                name: string().required().min(1),
                description: string().nullable(),
            })}
        >
            <RenameServerForm />
        </Formik>
    );
};

export default RenameServerBox;