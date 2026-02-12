import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';

interface DownloadProps {
    url: string;
    serverUuid: string;
    directory?: string;
}

const DownloadModrinth: React.FC<DownloadProps> = ({ url, serverUuid, directory = 'mods' }) => {
    const [progress, setProgress] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const downloadAndUploadFile = async () => {
        setLoading(true);
        try {
            toast.info('正在从 Modrinth 下载文件...');

            // 1️⃣ Download the file from Modrinth
            const downloadResponse = await axios.get(url, {
                responseType: 'blob',
            });

            const fileName = url.split('/').pop() || 'modrinth-file.jar';
            const file = new Blob([downloadResponse.data], {
                type: downloadResponse.headers['content-type'] || 'application/java-archive',
            });

            // 2️⃣ Prepare FormData for Upload
            const formData = new FormData();
            formData.append('files', file, fileName);

            // 3️⃣ Upload to Pyrodactyl Server
            toast.info(`正在上传 ${fileName} 到服务器...`);
            await axios.post(`/api/client/servers/${serverUuid}/files/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                params: { directory: `/container/${directory}` },
                onUploadProgress: (event) => {
                    if (event.total) {
                        setProgress(Math.round((event.loaded * 100) / event.total));
                    }
                },
            });

            toast.success(`${fileName} 上传成功！`);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleError = (error: any) => {
        if (axios.isCancel(error)) {
            toast.warning('请求已取消。');
        } else if (error.response) {
            toast.error(`服务器错误！状态: ${error.response.status}`);
        } else if (error.request) {
            toast.error('服务器无响应。');
        } else {
            toast.error(`错误: ${error.message}`);
        }
    };

    return (
        <div className='p-4'>
            <button
                onClick={downloadAndUploadFile}
                disabled={loading}
                className='px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer'
            >
                {loading ? '处理中...' : '下载并上传'}
            </button>
            {progress > 0 && <p className='mt-2 text-sm'>上传进度: {progress}%</p>}
        </div>
    );
};

export default DownloadModrinth;