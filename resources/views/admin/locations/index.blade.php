@extends('layouts.admin')

@section('title')
    位置
@endsection

@section('content-header')
    <h1>位置<small>节点可以分配到的所有位置，以便于分类。</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li class="active">位置</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">位置列表</h3>
                <div class="box-tools">
                    <button class="btn btn-sm btn-primary" data-toggle="modal" data-target="#newLocationModal">创建新的</button>
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>短代码</th>
                            <th>描述</th>
                            <th class="text-center">内存分配%</th>
                            <th class="text-center">磁盘分配%</th>
                            <th class="text-center">节点</th>
                            <th class="text-center">服务器</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($locations as $location)
                            @php
                                $memoryColor = $location->memory_percent < 50 ? '#50af51' : ($location->memory_percent < 70 ? '#e0a800' : '#d9534f');
                                $diskColor = $location->disk_percent < 50 ? '#50af51' : ($location->disk_percent < 70 ? '#e0a800' : '#d9534f');
                            @endphp
                            <tr>
                                <td><code>{{ $location->id }}</code></td>
                                <td><a href="{{ route('admin.locations.view', $location->id) }}">{{ $location->short }}</a></td>
                                <td>{{ $location->long }}</td>
                                <td class="text-center" style="color: {{ $memoryColor }}" title="Allocated: {{ humanizeSize($location->allocated_memory * 1024 * 1024) }} / Total: {{ humanizeSize($location->total_memory * 1024 * 1024) }}">
                                    {{ round($location->memory_percent) }}%
                                </td>
                                <td class="text-center" style="color: {{ $diskColor }}" title="Allocated: {{ humanizeSize($location->allocated_disk * 1024 * 1024) }} / Total: {{ humanizeSize($location->total_disk * 1024 * 1024) }}">
                                    {{ round($location->disk_percent) }}%
                                </td>
                                <td class="text-center">{{ $location->nodes_count }}</td>
                                <td class="text-center">{{ $location->servers_count }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="newLocationModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <form action="{{ route('admin.locations') }}" method="POST">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">创建位置</h4>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-12">
                            <label for="pShortModal" class="form-label">短代码</label>
                            <input type="text" name="short" id="pShortModal" class="form-control" />
                            <p class="text-muted small">用于区分此位置与其他位置的短标识符。必须在 1 到 60 个字符之间，例如，<code>us.nyc.lvl3</code>。</p>
                        </div>
                        <div class="col-md-12">
                            <label for="pLongModal" class="form-label">描述</label>
                            <textarea name="long" id="pLongModal" class="form-control" rows="4"></textarea>
                            <p class="text-muted small">此位置的较长描述。必须少于 191 个字符。</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    {!! csrf_field() !!}
                    <button type="button" class="btn btn-default btn-sm pull-left" data-dismiss="modal">取消</button>
                    <button type="submit" class="btn btn-success btn-sm">创建</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
