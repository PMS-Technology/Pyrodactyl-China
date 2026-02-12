<?php

return [
    'exceptions' => [
        'no_new_default_allocation' => '您正在尝试删除此服务器的默认分配，但没有备用分配可使用。',
        'marked_as_failed' => '此服务器被标记为之前的安装失败。在此状态下无法切换当前状态。',
        'bad_variable' => '变量 :name 存在验证错误。',
        'daemon_exception' => '尝试与守护进程通信时发生异常，导致HTTP/:code响应代码。此异常已被记录。(请求ID: :request_id)',
        'default_allocation_not_found' => '在此服务器的分配中找不到请求的默认分配。',
    ],
    'alerts' => [
        'startup_changed' => '此服务器的启动配置已更新。如果此服务器的预设或egg已更改，将立即重新安装。',
        'server_deleted' => '服务器已成功从系统中删除。',
        'server_created' => '服务器已成功在面板上创建。请允许守护进程几分钟时间完全安装此服务器。',
        'build_updated' => '此服务器的构建详细信息已更新。某些更改可能需要重启才能生效。',
        'suspension_toggled' => '服务器暂停状态已更改为 :status。',
        'rebuild_on_boot' => '此服务器已标记为需要重建Docker容器。这将在下次启动服务器时发生。',
        'install_toggled' => '此服务器的安装状态已切换。',
        'server_reinstalled' => '此服务器已排队进行重新安装，即刻开始。',
        'details_updated' => '服务器详细信息已成功更新。',
        'docker_image_updated' => '已成功更改用于此服务器的默认Docker镜像。需要重新启动以应用此更改。',
        'node_required' => '在向此面板添加服务器之前，您必须至少配置一个节点。',
        'transfer_nodes_required' => '在转移服务器之前，您必须至少配置两个节点。',
        'transfer_started' => '服务器转移已开始。',
        'transfer_not_viable' => '您选择的节点没有足够的磁盘空间或内存来容纳此服务器。',
    ],
];