import Can from '@/components/elements/Can';
import { ServerError } from '@/components/elements/ScreenBlock';

export interface RequireServerPermissionProps {
    permissions: string | string[];
    children?: React.ReactNode;
}

const RequireServerPermission: React.FC<RequireServerPermissionProps> = ({ children, permissions }) => {
    return (
        <Can
            action={permissions}
            renderOnError={
                <ServerError title={'访问被拒绝'} message={'您没有权限访问此页面。'} />
            }
        >
            {children}
        </Can>
    );
};

export default RequireServerPermission;
