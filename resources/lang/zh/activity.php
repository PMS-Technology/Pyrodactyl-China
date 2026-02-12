<?php

/**
 * 包含不同活动日志事件的所有翻译字符串
 * 这些应该以事件名称中冒号（:）前面的值作为键
 * 如果没有冒号，则应位于顶层
 */
return [
    'auth' => [
        'fail' => '登录失败',
        'success' => '已登录',
        'password-reset' => '密码重置',
        'reset-password' => '请求密码重置',
        'checkpoint' => '请求两因素身份验证',
        'recovery-token' => '使用两因素恢复令牌',
        'token' => '解决两因素挑战',
        'ip-blocked' => '阻止来自未列出IP地址 :identifier 的请求',
        'sftp' => [
            'fail' => 'SFTP登录失败',
        ],
    ],
    'user' => [
        'account' => [
            'email-changed' => '将邮箱从 :old 更改为 :new',
            'password-changed' => '密码已更改',
        ],
        'api-key' => [
            'create' => '创建新API密钥 :identifier',
            'delete' => '删除API密钥 :identifier',
        ],
        'ssh-key' => [
            'create' => '将SSH密钥 :fingerprint 添加到账户',
            'delete' => '从账户中移除SSH密钥 :fingerprint',
        ],
        'two-factor' => [
            'create' => '启用两因素认证',
            'delete' => '禁用两因素认证',
        ],
    ],
    'server' => [
        'reinstall' => '重新安装服务器',
        'console' => [
            'command' => '在服务器上执行 ":command"',
        ],
        'power' => [
            'start' => '启动服务器',
            'stop' => '停止服务器',
            'restart' => '重启服务器',
            'kill' => '终止服务器进程',
        ],
        'backup' => [
            'download' => '下载备份 :name',
            'delete' => '删除备份 :name',
            'restore' => '恢复备份 :name (删除文件: :truncate)',
            'restore-complete' => '完成恢复备份 :name',
            'restore-failed' => '无法完成恢复备份 :name',
            'start' => '开始新备份 :name',
            'complete' => '将备份 :name 标记为完成',
            'fail' => '将备份 :name 标记为失败',
            'lock' => '锁定备份 :name',
            'unlock' => '解锁备份 :name',
        ],
        'database' => [
            'create' => '创建新数据库 :name',
            'rotate-password' => '为数据库 :name 轮换密码',
            'delete' => '删除数据库 :name',
        ],
        'file' => [
            'compress_one' => '压缩 :directory:file',
            'compress_other' => '压缩 :directory 中的 :count 个文件',
            'read' => '查看 :file 的内容',
            'copy' => '创建 :file 的副本',
            'create-directory' => '创建目录 :directory:name',
            'decompress' => '解压缩 :directory 中的 :files',
            'delete_one' => '删除 :directory:files.0',
            'delete_other' => '删除 :directory 中的 :count 个文件',
            'download' => '下载 :file',
            'pull' => '从 :url 下载远程文件到 :directory',
            'rename_one' => '将 :directory:files.0.from 重命名为 :directory:files.0.to',
            'rename_other' => '重命名 :directory 中的 :count 个文件',
            'write' => '将新内容写入 :file',
            'upload' => '开始文件上传',
            'uploaded' => '上传 :directory:file',
        ],
        'sftp' => [
            'denied' => '由于权限问题阻止SFTP访问',
            'create_one' => '创建 :files.0',
            'create_other' => '创建 :count 个新文件',
            'write_one' => '修改 :files.0 的内容',
            'write_other' => '修改 :count 个文件的内容',
            'delete_one' => '删除 :files.0',
            'delete_other' => '删除 :count 个文件',
            'create-directory_one' => '创建 :files.0 目录',
            'create-directory_other' => '创建 :count 个目录',
            'rename_one' => '将 :files.0.from 重命名为 :files.0.to',
            'rename_other' => '重命名或移动 :count 个文件',
        ],
        'allocation' => [
            'create' => '将分配 :allocation 添加到服务器',
            'notes' => '将分配 :allocation 的备注从 ":old" 更新为 ":new"',
            'primary' => '将 :allocation 设置为主要服务器分配',
            'delete' => '删除分配 :allocation',
        ],
        'schedule' => [
            'create' => '创建计划 :name',
            'update' => '更新计划 :name',
            'execute' => '手动执行计划 :name',
            'delete' => '删除计划 :name',
        ],
        'task' => [
            'create' => '为计划 :name 创建新 ":action" 任务',
            'update' => '更新计划 :name 的 ":action" 任务',
            'delete' => '删除计划 :name 的任务',
        ],
        'settings' => [
            'rename' => '将服务器从 :old 重命名为 :new',
            'description' => '将服务器描述从 :old 更改为 :new',
        ],
        'startup' => [
            'edit' => '将变量 :variable 从 ":old" 更改为 ":new"',
            'image' => '将服务器的Docker镜像从 :old 更新为 :new',
        ],
        'subuser' => [
            'create' => '添加 :email 为子用户',
            'update' => '更新 :email 的子用户权限',
            'delete' => '移除 :email 作为子用户',
        ],
    ],
];