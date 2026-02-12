<?php

return [
    'location' => [
        'no_location_found' => '无法找到与提供的短代码匹配的记录。',
        'ask_short' => '位置短代码',
        'ask_long' => '位置描述',
        'created' => '已成功创建新位置 (:name)，ID为 :id。',
        'deleted' => '已成功删除请求的位置。',
    ],
    'user' => [
        'search_users' => '输入用户名、用户ID或邮箱地址',
        'select_search_user' => '要删除的用户ID (输入\'0\'重新搜索)',
        'deleted' => '已成功从面板中删除用户。',
        'confirm_delete' => '您确定要从面板中删除此用户吗？',
        'no_users_found' => '找不到与提供的搜索词匹配的用户。',
        'multiple_found' => '找到多个账户匹配提供的用户，由于--no-interaction标志无法删除用户。',
        'ask_admin' => '此用户是管理员吗？',
        'ask_email' => '邮箱地址',
        'ask_username' => '用户名',
        'ask_name_first' => '名字',
        'ask_name_last' => '姓氏',
        'ask_password' => '密码',
        'ask_password_tip' => '如果您想创建一个随机密码并通过邮件发送给用户的账户，请重新运行此命令(CTRL+C)并传递`--no-password`标志。',
        'ask_password_help' => '密码长度必须至少为8个字符，并且包含至少一个大写字母和数字。',
        '2fa_help_text' => [
            '如果启用了两因素身份验证，此命令将为用户的账户禁用它。这应该仅用作账户恢复命令，如果用户被锁定在账户之外。',
            '如果这不是您想要做的，请按CTRL+C退出此过程。',
        ],
        '2fa_disabled' => '已为 :email 禁用两因素身份验证。',
    ],
    'schedule' => [
        'output_line' => '为`:schedule` (:hash)中的第一个任务调度作业。',
    ],
    'maintenance' => [
        'deleting_service_backup' => '删除服务备份文件 :file。',
    ],
    'server' => [
        'rebuild_failed' => '节点":node"上服务器":name" (#:id)的重建请求失败，错误：:message',
        'reinstall' => [
            'failed' => '节点":node"上服务器":name" (#:id)的重新安装请求失败，错误：:message',
            'confirm' => '您即将对一组服务器进行重新安装。您要继续吗？',
        ],
        'power' => [
            'confirm' => '您即将对 :count 个服务器执行 :action。您要继续吗？',
            'action_failed' => '节点":node"上服务器":name" (#:id)的电源操作请求失败，错误：:message',
        ],
    ],
    'environment' => [
        'mail' => [
            'ask_smtp_host' => 'SMTP主机 (例如 smtp.gmail.com)',
            'ask_smtp_port' => 'SMTP端口',
            'ask_smtp_username' => 'SMTP用户名',
            'ask_smtp_password' => 'SMTP密码',
            'ask_mailgun_domain' => 'Mailgun域',
            'ask_mailgun_endpoint' => 'Mailgun端点',
            'ask_mailgun_secret' => 'Mailgun密钥',
            'ask_mandrill_secret' => 'Mandrill密钥',
            'ask_postmark_username' => 'Postmark API密钥',
            'ask_driver' => '应该使用哪个驱动程序发送邮件？',
            'ask_mail_from' => '邮件应该来自的邮箱地址',
            'ask_mail_name' => '邮件应该显示的名称',
            'ask_encryption' => '要使用的加密方法',
        ],
    ],
];