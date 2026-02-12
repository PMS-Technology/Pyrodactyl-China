<?php

namespace Pterodactyl\Models;

use Illuminate\Support\Collection;

class Permission extends Model
{
  /**
   * 将此模型转换为使用 fractal 的 API 表示时的资源名称。
   */
  public const RESOURCE_NAME = 'subuser_permission';

  /**
   * 定义可用的不同权限的常量。
   */
  public const ACTION_WEBSOCKET_CONNECT = 'websocket.connect';
  public const ACTION_CONTROL_CONSOLE = 'control.console';
  public const ACTION_CONTROL_START = 'control.start';
  public const ACTION_CONTROL_STOP = 'control.stop';
  public const ACTION_CONTROL_RESTART = 'control.restart';

  public const ACTION_DATABASE_READ = 'database.read';
  public const ACTION_DATABASE_CREATE = 'database.create';
  public const ACTION_DATABASE_UPDATE = 'database.update';
  public const ACTION_DATABASE_DELETE = 'database.delete';
  public const ACTION_DATABASE_VIEW_PASSWORD = 'database.view_password';

  public const ACTION_SCHEDULE_READ = 'schedule.read';
  public const ACTION_SCHEDULE_CREATE = 'schedule.create';
  public const ACTION_SCHEDULE_UPDATE = 'schedule.update';
  public const ACTION_SCHEDULE_DELETE = 'schedule.delete';

  public const ACTION_USER_READ = 'user.read';
  public const ACTION_USER_CREATE = 'user.create';
  public const ACTION_USER_UPDATE = 'user.update';
  public const ACTION_USER_DELETE = 'user.delete';

  public const ACTION_BACKUP_READ = 'backup.read';
  public const ACTION_BACKUP_CREATE = 'backup.create';
  public const ACTION_BACKUP_DELETE = 'backup.delete';
  public const ACTION_BACKUP_DOWNLOAD = 'backup.download';
  public const ACTION_BACKUP_RESTORE = 'backup.restore';

  public const ACTION_ALLOCATION_READ = 'allocation.read';
  public const ACTION_ALLOCATION_CREATE = 'allocation.create';
  public const ACTION_ALLOCATION_UPDATE = 'allocation.update';
  public const ACTION_ALLOCATION_DELETE = 'allocation.delete';

  public const ACTION_FILE_READ = 'file.read';
  public const ACTION_FILE_READ_CONTENT = 'file.read-content';
  public const ACTION_FILE_CREATE = 'file.create';
  public const ACTION_FILE_UPDATE = 'file.update';
  public const ACTION_FILE_DELETE = 'file.delete';
  public const ACTION_FILE_ARCHIVE = 'file.archive';
  public const ACTION_FILE_SFTP = 'file.sftp';

  public const ACTION_STARTUP_READ = 'startup.read';
  public const ACTION_STARTUP_UPDATE = 'startup.update';
  public const ACTION_STARTUP_COMMAND = 'startup.command';
  public const ACTION_STARTUP_DOCKER_IMAGE = 'startup.docker-image';

  public const ACTION_STARTUP_SOFTWARE = 'startup.software';

  public const ACTION_SETTINGS_RENAME = 'settings.rename';
  public const ACTION_SETTINGS_MODRINTH = 'settings.modrinth';
  public const ACTION_SETTINGS_REINSTALL = 'settings.reinstall';

  public const ACTION_ACTIVITY_READ = 'activity.read';

  public const ACTION_MODRINTH_DOWNLOAD = 'modrinth.download';

  /**
   * 此模型是否使用时间戳。
   */
  public $timestamps = false;

  /**
   * 与此模型关联的表。
   */
  protected $table = 'permissions';

  /**
   * 不可批量赋值的字段。
   */
  protected $guarded = ['id', 'created_at', 'updated_at'];

  /**
   * 将值转换为正确的类型。
   */
  protected $casts = [
    'subuser_id' => 'integer',
  ];

  public static array $validationRules = [
    'subuser_id' => 'required|numeric|min:1',
    'permission' => 'required|string',
  ];

  /**
   * 系统中可用的所有权限。请使用 self::permissions() 来检索它们，
   * 不要直接访问此数组，因为它可能会变化。
   *
   * @see \Pterodactyl\Models\Permission::permissions()
   */
  protected static array $permissions = [
    'websocket' => [
      'description' => '允许用户连接到服务器的 websocket，从而查看控制台输出和实时服务器统计信息。',
      'keys' => [
        'connect' => '允许用户连接到服务器的 websocket 以流式传输控制台。',
      ],
    ],

    'control' => [
      'description' => '控制用户对服务器电源状态或发送命令的权限。',
      'keys' => [
        'console' => '允许用户通过控制台向服务器实例发送命令。',
        'start' => '允许用户在服务器停止时启动它。',
        'stop' => '允许用户在服务器运行时停止它。',
        'restart' => '允许用户执行服务器重启。该权限允许在服务器离线时启动它，但不会将服务器置于完全停止状态。',
      ],
    ],

    'user' => [
      'description' => '允许用户管理服务器上的其他子用户的权限。用户永远不能编辑自己的账户或分配其自身没有的权限。',
      'keys' => [
        'create' => '允许用户为服务器创建新的子用户。',
        'read' => '允许用户查看服务器的子用户及其权限。',
        'update' => '允许用户修改其他子用户。',
        'delete' => '允许用户从服务器中删除子用户。',
      ],
    ],

    'file' => [
      'description' => '控制用户修改此服务器文件系统能力的权限。',
      'keys' => [
        'create' => '允许用户通过面板或直接上传创建附加文件和文件夹。',
        'read' => '允许用户查看目录内容，但不能查看文件内容或下载文件。',
        'read-content' => '允许用户查看给定文件的内容。这也将允许用户下载文件。',
        'update' => '允许用户更新现有文件或目录的内容。',
        'delete' => '允许用户删除文件或目录。',
        'archive' => '允许用户将目录内容归档以及解压系统上的现有归档。',
        'sftp' => '允许用户连接到 SFTP 并使用其它分配的文件权限管理服务器文件。',
      ],
    ],

    'backup' => [
      'description' => '控制用户生成和管理服务器备份能力的权限。',
      'keys' => [
        'create' => '允许用户为此服务器创建新备份。',
        'read' => '允许用户查看此服务器存在的所有备份。',
        'delete' => '允许用户从系统中删除备份。',
        'download' => '允许用户下载服务器的备份。注意：这允许用户访问备份中的所有服务器文件。',
        'restore' => '允许用户为服务器恢复备份。注意：此操作可能会在恢复过程中删除服务器的所有文件。',
      ],
    ],

    // 控制编辑或查看服务器分配（allocation）的权限。
    'allocation' => [
      'description' => '控制用户修改此服务器端口分配能力的权限。',
      'keys' => [
        'read' => '允许用户查看当前分配给此服务器的所有分配。对任何级别访问此服务器的用户总是可以查看主分配。',
        'create' => '允许用户为服务器分配额外的分配。',
        'update' => '允许用户更改主服务器分配并为每个分配添加备注。',
        'delete' => '允许用户从服务器删除分配。',
      ],
    ],

    // 控制编辑或查看服务器启动参数的权限。
    'startup' => [
      'description' => '控制用户查看此服务器启动参数的权限。',
      'keys' => [
        'read' => '允许用户查看服务器的启动变量。',
        'update' => '允许用户修改服务器的启动变量。',
        'command' => '允许用户修改服务器的启动命令。',
        'docker-image' => '允许用户修改运行服务器时使用的 Docker 镜像。',
        'software' => '允许用户修改服务器使用的游戏/软件。',
      ],
    ],

    'database' => [
      'description' => '控制用户访问此服务器数据库管理的权限。',
      'keys' => [
        'create' => '允许用户为此服务器创建新数据库。',
        'read' => '允许用户查看与此服务器关联的数据库。',
        'update' => '允许用户轮换数据库实例的密码。如果用户没有 view_password 权限，他们将看不到更新后的密码。',
        'delete' => '允许用户从此服务器移除数据库实例。',
        'view_password' => '允许用户查看此服务器数据库实例关联的密码。',
      ],
    ],

    'schedule' => [
      'description' => '控制用户访问此服务器计划（schedule）管理的权限。',
      'keys' => [
        'create' => '允许用户为此服务器创建新的计划。', // task.create-schedule
        'read' => '允许用户查看此服务器的计划及其相关任务。', // task.view-schedule, task.list-schedules
        'update' => '允许用户更新计划和计划任务。', // task.edit-schedule, task.queue-schedule, task.toggle-schedule
        'delete' => '允许用户删除服务器的计划。', // task.delete-schedule
      ],
    ],

    'settings' => [
      'description' => '控制用户访问此服务器设置的权限。',
      'keys' => [
        'rename' => '允许用户重命名此服务器并更改其描述。',
        'reinstall' => '允许用户触发此服务器的重新安装。',
      ],
    ],

    'activity' => [
      'description' => '控制用户访问服务器活动日志的权限。',
      'keys' => [
        'read' => '允许用户查看服务器的活动日志。',
      ],
    ],

    'modrinth' => [
      'description' => '控制用户下载和更新 mod 的权限。',
      'keys' => [
        'version' => '允许用户更改要下载的版本',
        'loader' => '允许用户更改要下载的加载器（loader）',
        'download' => '允许用户使用 modrinth 将 mod 下载到服务器',
        'resolver' => '允许用户访问依赖关系解析器',
        'update' => '允许用户更新当前已安装的 mods',
      ],
    ],
  ];

  /**
   * 返回系统中可用于控制服务器的所有权限。
   */
  public static function permissions(): Collection
  {
    return Collection::make(self::$permissions);
  }
}