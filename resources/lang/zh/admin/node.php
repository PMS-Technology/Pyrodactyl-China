<?php

return [
    'validation' => [
        'fqdn_not_resolvable' => '提供的FQDN或IP地址无法解析为有效IP地址。',
        'fqdn_required_for_ssl' => '要在此节点上使用SSL，需要解析到公共IP地址的完全限定域名。',
    ],
    'notices' => [
        'allocations_added' => '已成功向此节点添加分配。',
        'node_deleted' => '节点已成功从面板中移除。',
        'location_required' => '在向此面板添加节点之前，您必须至少配置一个位置。',
        'node_created' => '已成功创建新节点。您可以通过访问"配置"选项卡自动配置此计算机上的守护进程。<strong>在添加任何服务器之前，您必须首先分配至少一个IP地址和端口。</strong>',
        'node_updated' => '节点信息已更新。如果任何守护进程设置已更改，您需要重新启动它以使更改生效。',
        'unallocated_deleted' => '已删除 <code>:ip</code> 的所有未分配端口。',
    ],
];