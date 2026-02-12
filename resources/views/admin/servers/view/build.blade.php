@extends('layouts.admin')

@section('title')
    服务器 — {{ $server->name }}: 构建详情
@endsection

@section('content-header')
    <h1>{{ $server->name }}<small>控制此服务器的分配和系统资源。</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理员</a></li>
        <li><a href="{{ route('admin.servers') }}">服务器</a></li>
        <li><a href="{{ route('admin.servers.view', $server->id) }}">{{ $server->name }}</a></li>
        <li class="active">构建配置</li>
    </ol>
@endsection

@section('content')
@include('admin.servers.partials.navigation')
<div class="row">
    <form action="{{ route('admin.servers.view.build', $server->id) }}" method="POST">
        <div class="col-sm-5">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">资源管理</h3>
                </div>
                <div class="box-body">
                <div class="form-group">
                        <label for="cpu" class="control-label">CPU限制</label>
                        <div class="input-group">
                            <input type="text" name="cpu" class="form-control" value="{{ old('cpu', $server->cpu) }}"/>
                            <span class="input-group-addon">%</span>
                        </div>
                        <p class="text-muted small">系统上的每个<em>虚拟</em>核心（线程）被视为<code>100%</code>。将此值设置为<code>0</code>将允许服务器无限制地使用CPU时间。</p>
                    </div>
                    <div class="form-group">
                        <label for="threads" class="control-label">CPU绑定</label>
                        <div>
                            <input type="text" name="threads" class="form-control" value="{{ old('threads', $server->threads) }}"/>
                        </div>
                        <p class="text-muted small"><strong>高级：</strong>输入此进程可以运行的特定CPU核心，或留空以允许所有核心。这可以是一个单独的数字，或逗号分隔的列表。示例：<code>0</code>、<code>0-1,3</code>或<code>0,1,3,4</code>。</p>
                    </div>
                    <div class="form-group">
                        <label for="memory" class="control-label">分配内存</label>
                        <div class="input-group">
                            <input type="text" name="memory" data-multiplicator="true" class="form-control" value="{{ old('memory', $server->memory) }}"/>
                            <span class="input-group-addon">MiB</span>
                        </div>
                        <p class="text-muted small">此容器允许的最大内存量。将其设置为<code>0</code>将允许容器中无限内存。</p>
                    </div>
                    <div class="form-group">
                        <label for="overhead_memory" class="control-label">开销内存</label>
                        <div class="input-group">
                            <input type="text" name="overhead_memory" data-multiplicator="true" class="form-control" value="{{ old('overhead_memory', $server->overhead_memory) }}"/>
                            <span class="input-group-addon">MiB</span>
                        </div>
                        <p class="text-muted small">分配给容器但不计入SERVER_MEMORY变量的额外内存。设置为<code>0</code>将禁用开销内存。</p>
                    </div>
                    <div class="form-group">
                        <label for="swap" class="control-label">分配交换空间</label>
                        <div class="input-group">
                            <input type="text" name="swap" data-multiplicator="true" class="form-control" value="{{ old('swap', $server->swap) }}"/>
                            <span class="input-group-addon">MiB</span>
                        </div>
                        <p class="text-muted small">将其设置为<code>0</code>将在此服务器上禁用交换空间。设置为<code>-1</code>将允许无限交换。</p>
                    </div>
                    <div class="form-group">
                        <label for="cpu" class="control-label">磁盘空间限制</label>
                        <div class="input-group">
                            <input type="text" name="disk" class="form-control" value="{{ old('disk', $server->disk) }}"/>
                            <span class="input-group-addon">MiB</span>
                        </div>
                        <p class="text-muted small">如果此服务器使用的空间超过此数量，则不允许启动。如果服务器在运行时超出此限制，它将被安全停止并锁定，直到有足够的空间为止。设置为<code>0</code>以允许无限磁盘使用。</p>
                    </div>
                    <div class="form-group">
                        <label for="io" class="control-label">块IO比例</label>
                        <div>
                            <input type="text" name="io" class="form-control" value="{{ old('io', $server->io) }}"/>
                        </div>
                        <p class="text-muted small"><strong>高级</strong>：此服务器相对于系统上其他<em>正在运行</em>的容器的IO性能。值应在<code>10</code>和<code>1000</code>之间。</p>
                    </div>
                    <div class="form-group">
                        <label for="cpu" class="control-label">OOM杀手</label>
                        <div>
                            <div class="radio radio-danger radio-inline">
                                <input type="radio" id="pOomKillerEnabled" value="0" name="oom_disabled" @if(!$server->oom_disabled)checked @endif>
                                <label for="pOomKillerEnabled">Enabled</label>
                            </div>
                            <div class="radio radio-success radio-inline">
                                <input type="radio" id="pOomKillerDisabled" value="1" name="oom_disabled" @if($server->oom_disabled)checked @endif>
                                <label for="pOomKillerDisabled">Disabled</label>
                            </div>
                            <p class="text-muted small">
                                启用OOM杀手可能会导致服务器进程意外退出。
                            </p>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="exclude_from_resource_calculation" class="control-label">资源计算</label>
                        <div>
                            <div class="radio radio-success radio-inline">
                                <input type="radio" id="pResourceCalcIncluded" value="0" name="exclude_from_resource_calculation" @if(!$server->exclude_from_resource_calculation)checked @endif>
                                <label for="pResourceCalcIncluded">Included</label>
                            </div>
                            <div class="radio radio-warning radio-inline">
                                <input type="radio" id="pResourceCalcExcluded" value="1" name="exclude_from_resource_calculation" @if($server->exclude_from_resource_calculation)checked @endif>
                                <label for="pResourceCalcExcluded">Excluded</label>
                            </div>
                            <p class="text-muted small">
                                启用后，在向此节点配置新服务器时，此服务器将不包含在资源计算中。对测试或开发服务器很有用。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-sm-7">
            <div class="row">
                <div class="col-xs-12">
                    <div class="box">
                        <div class="box-header with-border">
                            <h3 class="box-title">应用程序功能限制</h3>
                        </div>
                        <div class="box-body">
                            <div class="row">
                                <div class="form-group col-xs-6">
                                    <label for="database_limit" class="control-label">数据库限制</label>
                                    <div>
                                        <input type="text" name="database_limit" class="form-control" value="{{ old('database_limit', $server->database_limit) }}"/>
                                    </div>
                                    <p class="text-muted small">允许用户为此服务器创建的数据库总数。留空表示无限制，设置为0表示禁用。</p>
                                </div>
                                <div class="form-group col-xs-6">
                                    <label for="allocation_limit" class="control-label">分配限制</label>
                                    <div>
                                        <input type="text" name="allocation_limit" class="form-control" value="{{ old('allocation_limit', $server->allocation_limit) }}"/>
                                    </div>
                                    <p class="text-muted small">允许用户为此服务器创建的分配总数。留空表示无限制，设置为0表示禁用。</p>
                                </div>
                                <div class="form-group col-xs-6">
                                    <label for="backup_limit" class="control-label">备份限制</label>
                                    <div>
                                        <input type="text" name="backup_limit" class="form-control" value="{{ old('backup_limit', $server->backup_limit) }}"/>
                                    </div>
                                    <p class="text-muted small">可以为此服务器创建的备份总数。留空表示无限制，设置为0表示禁用。</p>
                                </div>
                                <div class="form-group col-xs-6">
                                    <label for="backup_storage_limit" class="control-label">备份存储限制</label>
                                    <div class="input-group">
                                        <input type="text" name="backup_storage_limit" data-multiplicator="true" class="form-control" value="{{ old('backup_storage_limit', $server->backup_storage_limit) }}"/>
                                        <span class="input-group-addon">MiB</span>
                                    </div>
                                    <p class="text-muted small">可用于备份的总存储空间。留空表示无限制存储。</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xs-12">
                    <div class="box">
                        <div class="box-header with-border">
                            <h3 class="box-title">分配管理</h3>
                        </div>
                        <div class="box-body">
                            <div class="form-group">
                                <label for="pAllocation" class="control-label">游戏端口</label>
                                <select id="pAllocation" name="allocation_id" class="form-control">
                                    @foreach ($assigned as $assignment)
                                        <option value="{{ $assignment->id }}"
                                            @if($assignment->id === $server->allocation_id)
                                                selected="selected"
                                            @endif
                                        >{{ $assignment->alias }}:{{ $assignment->port }}</option>
                                    @endforeach
                                </select>
                                <p class="text-muted small">将用于此游戏服务器的默认连接地址。</p>
                            </div>
                            <div class="form-group">
                                <label for="pAddAllocations" class="control-label">分配附加端口</label>
                                <div>
                                    <select name="add_allocations[]" class="form-control" multiple id="pAddAllocations">
                                        @foreach ($unassigned as $assignment)
                                            <option value="{{ $assignment->id }}">{{ $assignment->alias }}:{{ $assignment->port }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <p class="text-muted small">请注意，由于软件限制，您无法将不同IP上的相同端口分配给同一服务器。</p>
                            </div>
                            <div class="form-group">
                                <label for="pRemoveAllocations" class="control-label">移除附加端口</label>
                                <div>
                                    <select name="remove_allocations[]" class="form-control" multiple id="pRemoveAllocations">
                                        @foreach ($assigned as $assignment)
                                            <option value="{{ $assignment->id }}">{{ $assignment->alias }}:{{ $assignment->port }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <p class="text-muted small">只需从上面的列表中选择要移除的端口。如果您想分配已在使用中的不同IP上的端口，可以从左侧选择并在此处删除。</p>
                            </div>
                        </div>
                        <div class="box-footer">
                            {!! csrf_field() !!}
                            <button type="submit" class="btn btn-primary pull-right">更新构建配置</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
    $('#pAddAllocations').select2();
    $('#pRemoveAllocations').select2();
    $('#pAllocation').select2();
    </script>
@endsection
