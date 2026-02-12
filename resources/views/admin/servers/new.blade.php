@extends('layouts.admin')

@section('title')
    新建服务器
@endsection

@section('content-header')
    <h1>创建服务器<small>向面板添加新服务器。</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理员</a></li>
        <li><a href="{{ route('admin.servers') }}">服务器</a></li>
        <li class="active">创建服务器</li>
    </ol>
@endsection

@section('content')
<form action="{{ route('admin.servers.new') }}" method="POST">
    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">核心详情</h3>
                </div>

                <div class="box-body row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="pName">服务器名称</label>
                            <input type="text" class="form-control" id="pName" name="name" value="{{ old('name') }}" placeholder="服务器名称">
                            <p class="small text-muted no-margin">字符限制: <code>a-z A-Z 0-9 _ - .</code> 和 <code>[空格]</code>。</p>
                        </div>

                        <div class="form-group">
                            <label for="pUserId">服务器所有者</label>
                            <select id="pUserId" name="owner_id" class="form-control" style="padding-left:0;"></select>
                            <p class="small text-muted no-margin">服务器所有者的电子邮件地址。</p>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="pDescription" class="control-label">服务器描述</label>
                            <textarea id="pDescription" name="description" rows="3" class="form-control">{{ old('description') }}</textarea>
                            <p class="text-muted small">此服务器的简要描述。</p>
                        </div>

                        <div class="form-group">
                            <div class="checkbox checkbox-primary no-margin-bottom">
                                <input id="pStartOnCreation" name="start_on_completion" type="checkbox" {{ \Pterodactyl\Helpers\Utilities::checked('start_on_completion', 1) }} />
                                <label for="pStartOnCreation" class="strong">安装完成后启动服务器</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="overlay" id="allocationLoader" style="display:none;"><i class="fa fa-refresh fa-spin"></i></div>
                <div class="box-header with-border">
                    <h3 class="box-title">分配管理</h3>
                </div>

                <div class="box-body row">
                    <div class="form-group col-sm-4">
                        <label for="pNodeId">节点</label>
                        <select name="node_id" id="pNodeId" class="form-control">
                            @foreach($locations as $location)
                                <optgroup label="{{ $location->long }} ({{ $location->short }})">
                                @foreach($location->nodes as $node)

                                <option value="{{ $node->id }}"
                                    @if($location->id === old('location_id')) selected @endif
                                >{{ $node->name }}</option>

                                @endforeach
                                </optgroup>
                            @endforeach
                        </select>

                        <p class="small text-muted no-margin">此服务器将部署到的节点。</p>
                    </div>

                    <div class="form-group col-sm-4">
                        <label for="pAllocation">默认分配</label>
                        <select id="pAllocation" name="allocation_id" class="form-control"></select>
                        <p class="small text-muted no-margin">将分配给此服务器的主要分配。</p>
                    </div>

                    <div class="form-group col-sm-4">
                        <label for="pAllocationAdditional">附加分配</label>
                        <select id="pAllocationAdditional" name="allocation_additional[]" class="form-control" multiple></select>
                        <p class="small text-muted no-margin">创建时分配给此服务器的附加分配。</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="overlay" id="allocationLoader" style="display:none;"><i class="fa fa-refresh fa-spin"></i></div>
                <div class="box-header with-border">
                    <h3 class="box-title">应用程序功能限制</h3>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-6">
                        <label for="pDatabaseLimit" class="control-label">数据库限制</label>
                        <div>
                            <input type="text" id="pDatabaseLimit" name="database_limit" class="form-control" value="{{ old('database_limit') }}" placeholder="Leave blank for unlimited"/>
                        </div>
                        <p class="text-muted small">允许用户为此服务器创建的数据库总数。留空表示无限制，设置为0表示禁用。</p>
                    </div>
                    <div class="form-group col-xs-6">
                        <label for="pAllocationLimit" class="control-label">分配限制</label>
                        <div>
                            <input type="text" id="pAllocationLimit" name="allocation_limit" class="form-control" value="{{ old('allocation_limit') }}" placeholder="Leave blank for unlimited"/>
                        </div>
                        <p class="text-muted small">允许用户为此服务器创建的分配总数。留空表示无限制，设置为0表示禁用。</p>
                    </div>
                    <div class="form-group col-xs-6">
                        <label for="pBackupLimit" class="control-label">备份限制</label>
                        <div>
                            <input type="text" id="pBackupLimit" name="backup_limit" class="form-control" value="{{ old('backup_limit') }}" placeholder="Leave blank for unlimited"/>
                        </div>
                        <p class="text-muted small">可以为此服务器创建的备份总数。留空表示无限制，设置为0表示禁用。</p>
                    </div>
                    <div class="form-group col-xs-6">
                        <label for="pBackupStorageLimit" class="control-label">备份存储限制</label>
                        <div class="input-group">
                            <input type="text" id="pBackupStorageLimit" name="backup_storage_limit" data-multiplicator="true" class="form-control" value="{{ old('backup_storage_limit') }}" placeholder="Leave blank for unlimited"/>
                            <span class="input-group-addon">MiB</span>
                        </div>
                        <p class="text-muted small">可用于备份的总存储空间。留空表示无限制存储。</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">资源管理</h3>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-6">
                        <label for="pCPU">CPU限制</label>

                        <div class="input-group">
                            <input type="text" id="pCPU" name="cpu" class="form-control" value="{{ old('cpu', 0) }}" />
                            <span class="input-group-addon">%</span>
                        </div>

                        <p class="text-muted small">如果您不想限制CPU使用率，请将值设置为<code>0</code>。要确定一个值，请取线程数并乘以100。例如，在没有超线程的四核系统上<code>(4 * 100 = 400)</code>有<code>400%</code>可用。要将服务器限制为使用半个线程，您需要将值设置为<code>50</code>。要允许服务器使用最多两个线程，请将值设置为<code>200</code>。<p>
                    </div>

                    <div class="form-group col-xs-6">
                        <label for="pThreads">CPU绑定</label>

                        <div>
                            <input type="text" id="pThreads" name="threads" class="form-control" value="{{ old('threads') }}" />
                        </div>

                        <p class="text-muted small"><strong>高级：</strong>输入此进程可以运行的特定CPU线程，或留空以允许所有线程。这可以是一个单独的数字，或逗号分隔的列表。示例：<code>0</code>、<code>0-1,3</code>或<code>0,1,3,4</code>。</p>
                    </div>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-6">
                        <label for="pMemory">内存</label>

                        <div class="input-group">
                            <input type="text" id="pMemory" name="memory" class="form-control" value="{{ old('memory') }}" />
                            <span class="input-group-addon">MiB</span>
                        </div>

                        <p class="text-muted small">此容器允许的最大内存量。将其设置为<code>0</code>将允许容器中无限内存。</p>
                    </div>

                    <div class="form-group col-xs-6">
                        <label for="pOverheadMemory">开销内存</label>

                        <div class="input-group">
                            <input type="text" id="pOverheadMemory" name="overhead_memory" class="form-control" value="{{ old('overhead_memory', 0) }}" />
                            <span class="input-group-addon">MiB</span>
                        </div>

                        <p class="text-muted small">分配给容器但不计入SERVER_MEMORY变量的额外内存。设置为<code>0</code>将禁用开销内存。</p>
                    </div>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-6">
                        <label for="pSwap">交换空间</label>

                        <div class="input-group">
                            <input type="text" id="pSwap" name="swap" class="form-control" value="{{ old('swap', 0) }}" />
                            <span class="input-group-addon">MiB</span>
                        </div>

                        <p class="text-muted small">将其设置为<code>0</code>将在此服务器上禁用交换空间。设置为<code>-1</code>将允许无限交换。</p>
                    </div>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-6">
                        <label for="pDisk">磁盘空间</label>

                        <div class="input-group">
                            <input type="text" id="pDisk" name="disk" class="form-control" value="{{ old('disk') }}" />
                            <span class="input-group-addon">MiB</span>
                        </div>

                        <p class="text-muted small">如果此服务器使用的空间超过此数量，则不允许启动。如果服务器在运行时超出此限制，它将被安全停止并锁定，直到有足够的空间为止。设置为<code>0</code>以允许无限磁盘使用。</p>
                    </div>

                    <div class="form-group col-xs-6">
                        <label for="pIO">块IO权重</label>

                        <div>
                            <input type="text" id="pIO" name="io" class="form-control" value="{{ old('io', 500) }}" />
                        </div>

                        <p class="text-muted small"><strong>高级</strong>：此服务器相对于系统上其他<em>正在运行</em>的容器的IO性能。值应在<code>10</code>和<code>1000</code>之间。请参阅<a href="https://docs.docker.com/engine/reference/run/#block-io-bandwidth-blkio-constraint" target="_blank">此文档</a>了解更多相关信息。</p>
                    </div>
                    <div class="form-group col-xs-12">
                        <div class="checkbox checkbox-primary no-margin-bottom">
                            <input type="checkbox" id="pOomDisabled" name="oom_disabled" value="0" {{ \Pterodactyl\Helpers\Utilities::checked('oom_disabled', 0) }} />
                            <label for="pOomDisabled" class="strong">启用OOM杀手</label>
                        </div>

                        <p class="small text-muted no-margin">如果服务器超出内存限制则终止服务器。启用OOM杀手可能会导致服务器进程意外退出。</p>
                    </div>
                    <div class="form-group col-xs-12">
                        <div class="checkbox checkbox-primary no-margin-bottom">
                            <input type="checkbox" id="pExcludeFromResourceCalculation" name="exclude_from_resource_calculation" value="1" {{ \Pterodactyl\Helpers\Utilities::checked('exclude_from_resource_calculation', 0) }} />
                            <label for="pExcludeFromResourceCalculation" class="strong">排除在资源计算之外</label>
                        </div>

                        <p class="small text-muted no-margin">启用后，在向此节点配置新服务器时，此服务器将不包含在资源计算中。对测试或开发服务器很有用。</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-6">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">预设配置</h3>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-12">
                        <label for="pNestId">预设</label>

                        <select id="pNestId" name="nest_id" class="form-control">
                            @foreach($nests as $nest)
                                <option value="{{ $nest->id }}"
                                    @if($nest->id === old('nest_id'))
                                        selected="selected"
                                    @endif
                                >{{ $nest->name }}</option>
                            @endforeach
                        </select>

                        <p class="small text-muted no-margin">选择此服务器将归入的预设。</p>
                    </div>

                    <div class="form-group col-xs-12">
                        <label for="pEggId">预设</label>
                        <select id="pEggId" name="egg_id" class="form-control"></select>
                        <p class="small text-muted no-margin">选择将定义此服务器如何运行的预设。</p>
                    </div>
                    <div class="form-group col-xs-12">
                        <div class="checkbox checkbox-primary no-margin-bottom">
                            <input type="checkbox" id="pSkipScripting" name="skip_scripts" value="1" {{ \Pterodactyl\Helpers\Utilities::checked('skip_scripts', 0) }} />
                            <label for="pSkipScripting" class="strong">跳过预设安装脚本</label>
                        </div>

                        <p class="small text-muted no-margin">如果所选的预设附带安装脚本，则该脚本将在安装期间运行。如果您想跳过此步骤，请选中此框。</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Docker配置</h3>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-12">
                        <label for="pDefaultContainer">Docker镜像</label>
                        <select id="pDefaultContainer" name="image" class="form-control"></select>
                        <input id="pDefaultContainerCustom" name="custom_image" value="{{ old('custom_image') }}" class="form-control" placeholder="或输入自定义镜像..." style="margin-top:1rem"/>
                        <p class="small text-muted no-margin">这是用于运行此服务器的默认Docker镜像。从上面的下拉菜单中选择一个镜像，或在上面的文本字段中输入自定义镜像。</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">启动配置</h3>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-12">
                        <label for="pStartup">启动命令</label>
                        <input type="text" id="pStartup" name="startup" value="{{ old('startup') }}" class="form-control" />
                        <p class="small text-muted no-margin">启动命令可使用以下数据替换：<code>@{{SERVER_MEMORY}}</code>、<code>@{{SERVER_IP}}</code>和<code>@{{SERVER_PORT}}</code>。它们将分别替换为分配的内存、服务器IP和服务器端口。</p>
                    </div>
                </div>

                <div class="box-header with-border" style="margin-top:-10px;">
                    <h3 class="box-title">服务变量</h3>
                </div>

                <div class="box-body row" id="appendVariablesTo"></div>

                <div class="box-footer">
                    {!! csrf_field() !!}
                    <input type="submit" class="btn btn-success pull-right" value="创建服务器" />
                </div>
            </div>
        </div>
    </div>
</form>
@endsection

@section('footer-scripts')
    @parent
    {!! Theme::js('vendor/lodash/lodash.js') !!}

    <script type="application/javascript">
        // Persist 'Service Variables'
        function serviceVariablesUpdated(eggId, ids) {
            /*
            @if (old('egg_id'))
                // Check if the egg id matches.
                if (eggId != '{{ old('egg_id') }}') {
                    return;
                }

                @if (old('environment'))
                    @foreach (old('environment') as $key => $value)
                        $('#' + ids['{{ $key }}']).val('{{ $value }}');
                    @endforeach
                @endif
            @endif
            @if(old('image'))
                $('#pDefaultContainer').val('{{ old('image') }}');
            @endif
            */
        }
        // END Persist 'Service Variables'
    </script>

    {!! Theme::js('js/admin/new-server.js?v=20220530') !!}

    <script type="application/javascript">
        $(document).ready(function() {
            // Persist 'Server Owner' select2
            /*
            @if (old('owner_id'))
                $.ajax({
                    url: '/admin/users/accounts.json?user_id={{ old('owner_id') }}',
                    dataType: 'json',
                }).then(function (data) {
                    initUserIdSelect([ data ]);
                });
            @else
                initUserIdSelect();
            @endif
            */
            // END Persist 'Server Owner' select2

            // Persist 'Node' select2
            /*
            @if (old('node_id'))
                $('#pNodeId').val('{{ old('node_id') }}').change();

                // Persist 'Default Allocation' select2
                @if (old('allocation_id'))
                    $('#pAllocation').val('{{ old('allocation_id') }}').change();
                @endif
                // END Persist 'Default Allocation' select2

                // Persist 'Additional Allocations' select2
                @if (old('allocation_additional'))
                    const additional_allocations = [];

                    @for ($i = 0; $i < count(old('allocation_additional')); $i++)
                        additional_allocations.push('{{ old('allocation_additional.'.$i)}}');
                    @endfor

                    $('#pAllocationAdditional').val(additional_allocations).change();
                @endif
                // END Persist 'Additional Allocations' select2
            @endif
            // END Persist 'Node' select2
            */

            // Persist 'Nest' select2
            /*
            @if (old('nest_id'))
                $('#pNestId').val('{{ old('nest_id') }}').change();

                // Persist 'Egg' select2
                @if (old('egg_id'))
                    $('#pEggId').val('{{ old('egg_id') }}').change();
                @endif
                // END Persist 'Egg' select2
            @endif
            // END Persist 'Nest' select2
            */
        });
    </script>
@endsection
