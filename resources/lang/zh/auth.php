<?php

return [
    'sign_in' => '登录',
    'go_to_login' => '前往登录',
    'failed' => '找不到匹配这些凭据的账户。',
    
    'forgot_password' => [
        'label' => '忘记密码？',
        'label_help' => '输入您的账户邮箱地址以接收重置密码的说明。',
        'button' => '恢复账户',
    ],
    
    'reset_password' => [
        'button' => '重置并登录',
    ],
    
    'two_factor' => [
        'label' => '两因素令牌',
        'label_help' => '此账户需要第二层身份验证才能继续。请输入您的设备生成的代码以完成此登录。',
        'checkpoint_failed' => '两因素身份验证令牌无效。',
    ],
    
    'throttle' => '登录尝试次数过多。请在 :seconds 秒后重试。',
    'password_requirements' => '密码长度必须至少为8个字符，并且应该是此站点唯一的。',
    '2fa_must_be_enabled' => '管理员要求您的账户必须启用两因素身份验证才能使用面板。',
];