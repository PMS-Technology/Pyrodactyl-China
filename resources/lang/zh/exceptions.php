<?php

return [
    'daemon_connection_failed' => '尝试与守护进程通信时发生异常，导致HTTP/:code响应代码。此异常已被记录。',
    'node' => [
        'servers_attached' => '要删除节点，必须没有服务器链接到它。',
        'daemon_off_config_updated' => '守护进程配置<strong>已更新</strong>，但在尝试自动更新守护进程上的配置文件时遇到错误。您需要手动更新守护进程的配置文件(config.yml)以应用这些更改。',
    ],
    'allocations' => [
        'server_using' => '当前有服务器分配给此分配。只有在当前没有服务器分配时才能删除分配。',
        'too_many_ports' => '不支持一次添加超过1000个端口。',
        'invalid_mapping' => '为 :port 提供的映射无效且无法处理。',
        'cidr_out_of_range' => 'CIDR表示法只允许/25到/32之间的掩码。',
        'port_out_of_range' => '分配中的端口必须大于1024且小于等于65535。',
    ],
    'nest' => [
        'delete_has_servers' => '无法从面板中删除附加了活动服务器的Nest。',
        'egg' => [
            'delete_has_servers' => '无法从面板中删除附加了活动服务器的Egg。',
            'invalid_copy_id' => '选择用于复制脚本的Egg不存在，或者正在复制自身脚本。',
            'must_be_child' => '此Egg的"从...复制设置"指令必须是所选Nest的子选项。',
            'has_children' => '此Egg是一个或多个其他Egg的父级。请在删除此Egg之前先删除那些Egg。',
        ],
        'variables' => [
            'env_not_unique' => '环境变量 :name 必须对此Egg唯一。',
            'reserved_name' => '环境变量 :name 受保护，不能分配给变量。',
            'bad_validation_rule' => '验证规则 ":rule" 不是此应用程序的有效规则。',
        ],
        'importer' => [
            'json_error' => '尝试解析JSON文件时出错：:error。',
            'file_error' => '提供的JSON文件无效。',
            'invalid_json_provided' => '提供的JSON文件格式无法识别。',
        ],
    ],
    'subusers' => [
        'editing_self' => '不允许编辑自己的子用户账户。',
        'user_is_owner' => '您不能将服务器所有者添加为此服务器的子用户。',
        'subuser_exists' => '具有该邮箱地址的用户已分配为此服务器的子用户。',
    ],
    'databases' => [
        'delete_has_databases' => '无法删除链接了活动数据库的数据库主机服务器。',
    ],
    'tasks' => [
        'chain_interval_too_long' => '链式任务的最大间隔时间为15分钟。',
    ],
    'locations' => [
        'has_nodes' => '无法删除附加了活动节点的位置。',
    ],
    'users' => [
        'node_revocation_failed' => '无法在<a href=":link">节点#:node</a>上撤销密钥。:error',
    ],
    'deployment' => [
        'no_viable_nodes' => '找不到满足自动部署指定要求的节点。',
        'no_viable_allocations' => '找不到满足自动部署要求的分配。',
    ],
    'api' => [
        'resource_not_found' => '请求的资源在此服务器上不存在。',
    ],
];