<?php

return [
    'notices' => [
        'created' => '已成功创建新预设 :name。',
        'deleted' => '已成功从面板中删除请求的预设。',
        'updated' => '已成功更新预设配置选项。',
    ],
    'eggs' => [
        'notices' => [
            'imported' => '已成功导入此Egg及其相关变量。',
            'updated_via_import' => '此Egg已使用提供的文件更新。',
            'deleted' => '已成功从面板中删除请求的egg。',
            'updated' => 'Egg配置已成功更新。',
            'script_updated' => 'Egg安装脚本已更新，将在安装服务器时运行。',
            'egg_created' => '已成功创建新egg。您需要重启任何正在运行的守护进程以应用此新egg。',
        ],
    ],
    'variables' => [
        'notices' => [
            'variable_deleted' => '变量 ":variable" 已被删除，服务器重建后将不再可用。',
            'variable_updated' => '变量 ":variable" 已更新。您需要重建任何使用此变量的服务器以应用更改。',
            'variable_created' => '已成功创建新变量并分配给此egg。',
        ],
    ],
];