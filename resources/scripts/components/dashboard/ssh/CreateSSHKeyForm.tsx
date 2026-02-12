import { Actions, useStoreActions } from 'easy-peasy';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { useState } from 'react';
import { object, string } from 'yup';

import FlashMessageRender from '@/components/FlashMessageRender';
import ActionButton from '@/components/elements/ActionButton';
import ContentBox from '@/components/elements/ContentBox';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import Input from '@/components/elements/Input';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';

import { createSSHKey } from '@/api/account/ssh-keys';
import { useSSHKeys } from '@/api/account/ssh-keys';
import { httpErrorToHuman } from '@/api/http';

import { ApplicationStore } from '@/state';

interface Values {
    name: string;
    publicKey: string;
}

const CreateSSHKeyForm = () => {
    const [sshKey, setSshKey] = useState('');
    const { addError, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    const { mutate } = useSSHKeys();

    const submit = (values: Values, { setSubmitting, resetForm }: FormikHelpers<Values>) => {
        clearFlashes('ssh-keys');
        createSSHKey(values.name, values.publicKey)
            .then((key) => {
                resetForm();
                setSubmitting(false);
                setSshKey(`${key.name}`);
                mutate((data) => (data || []).concat(key)); // 创建后更新SSH密钥列表
            })
            .catch((error) => {
                console.error(error);
                addError({ key: 'ssh-keys', message: httpErrorToHuman(error) });
                setSubmitting(false);
            });
    };

    return (
        <>
            {/* 消息提示 */}
            <FlashMessageRender byKey='account' />

            {/* SSH密钥模态框 */}
            {/* Add your modal logic here to display the SSH key details after creation */}

            {/* 创建SSH密钥表单 */}
            <ContentBox>
                <Formik
                    onSubmit={submit}
                    initialValues={{ name: '', publicKey: '' }}
                    validationSchema={object().shape({
                        name: string().required('SSH密钥名称是必需的'),
                        publicKey: string().required('公钥是必需的'),
                    })}
                >
                    {({ isSubmitting }) => (
                        <Form className='space-y-6'>
                            {/* 提交时显示加载覆盖 */}
                            <SpinnerOverlay visible={isSubmitting} />

                            {/* SSH密钥名称字段 */}
                            <FormikFieldWrapper
                                label='SSH密钥名称'
                                name='name'
                                description='用于标识此SSH密钥的名称。'
                            >
                                <Field name='name' as={Input} className='w-full' />
                            </FormikFieldWrapper>

                            {/* 公钥字段 */}
                            <FormikFieldWrapper
                                label='公钥'
                                name='publicKey'
                                description='输入您的公钥SSH密钥。'
                            >
                                <Field name='publicKey' as={Input} className='w-full' />
                            </FormikFieldWrapper>

                            {/* 表单字段下方的提交按钮 */}
                            <div className='flex justify-end mt-6'>
                                <ActionButton type='submit' disabled={isSubmitting}>
                                    {isSubmitting ? '创建中...' : '创建SSH密钥'}
                                </ActionButton>
                            </div>
                        </Form>
                    )}
                </Formik>
            </ContentBox>
        </>
    );
};

export default CreateSSHKeyForm;