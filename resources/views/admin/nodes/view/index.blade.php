@extends('layouts.admin')

@section('title')
  {{ $node->name }}
@endsection

@section('content-header')
  <h1>{{ $node->name }}<small>您的节点快速概览。</small></h1>
  <ol class="breadcrumb">
    <li><a href="{{ route('admin.index') }}">管理</a></li>
    <li><a href="{{ route('admin.nodes') }}">节点</a></li>
    <li class="active">{{ $node->name }}</li>
  </ol>
@endsection

@section('content')
  <div class="row">
    <div class="col-xs-12">
    <div class="nav-tabs-custom nav-tabs-floating">
      <ul class="nav nav-tabs">
      <li class="active"><a href="{{ route('admin.nodes.view', $node->id) }}">关于</a></li>
      <li><a href="{{ route('admin.nodes.view.settings', $node->id) }}">设置</a></li>
      <li><a href="{{ route('admin.nodes.view.configuration', $node->id) }}">配置</a></li>
      <li><a href="{{ route('admin.nodes.view.allocation', $node->id) }}">分配</a></li>
      <li><a href="{{ route('admin.nodes.view.servers', $node->id) }}">服务器</a></li>
      </ul>
    </div>
    </div>
  </div>
  <div class="row">
    <div class="col-sm-8">
    <div class="row">
      <div class="col-xs-12">
      <div class="box box-primary">
        <div class="box-header with-border">
        <h3 class="box-title">信息</h3>
        </div>
        <div class="box-body table-responsive no-padding">
        <table class="table table-hover">
          <tr>
          <td>守护进程版本</td>
          <td><code data-attr="info-version"><i class="fa fa-refresh fa-fw fa-spin"></i></code> (Latest:
            <code>{{ $version->getDaemon() }}</code>)
          </td>
          </tr>
          <tr>
          <td>系统信息</td>
          <td data-attr="info-system"><i class="fa fa-refresh fa-fw fa-spin"></i></td>
          </tr>
          <tr>
          <td>总 CPU 线程数</td>
          <td data-attr="info-cpus"><i class="fa fa-refresh fa-fw fa-spin"></i></td>
          </tr>
        </table>
        </div>
      </div>
      </div>
      @if ($node->description)
      <div class="col-xs-12">
      <div class="box box-default">
      <div class="box-header with-border">
      描述
      </div>
      <div class="box-body table-responsive">
      <pre>{{ $node->description }}</pre>
      </div>
      </div>
      </div>
    @endif
      <div class="col-xs-12">
      <div class="box box-danger">
        <div class="box-header with-border">
        <h3 class="box-title">删除节点</h3>
        </div>
        <div class="box-body">
        <p class="no-margin">删除节点是不可逆的操作，将立即从面板中删除此节点。要继续操作，此节点必须没有关联的服务器。</p>
        </div>
        <div class="box-footer">
        <form action="{{ route('admin.nodes.view.delete', $node->id) }}" method="POST">
          {!! csrf_field() !!}
          {!! method_field('DELETE') !!}
          <button type="submit" class="btn btn-danger btn-sm pull-right" {{ ($node->servers_count < 1) ?: 'disabled' }}>是的，删除此节点</button>
        </form>
        </div>
      </div>
      </div>
    </div>
    </div>
    <div class="col-sm-4">
    <div class="box box-primary">
      <div class="box-header with-border">
      <h3 class="box-title">一目了然</h3>
      </div>
      <div class="box-body">
      <div class="row">
        @if($node->maintenance_mode)
      <div class="col-sm-12">
      <div class="info-box bg-orange">
        <span class="info-box-icon"><i class="ion ion-wrench"></i></span>
        <div class="info-box-content" style="padding: 23px 10px 0;">
        <span class="info-box-text">此节点正在</span>
        <span class="info-box-number">维护中</span>
        </div>
      </div>
      </div>
      @endif
        @php
      $stats = app('Pterodactyl\Repositories\Eloquent\NodeRepository')->getUsageStatsRaw($node);
      $memoryPercent = ($stats['memory']['value'] / $stats['memory']['base_limit']) * 100;
      $diskPercent = ($stats['disk']['value'] / $stats['disk']['base_limit']) * 100;

      $memoryColor = $memoryPercent < 50 ? '#50af51' : ($memoryPercent < 70 ? '#e0a800' : '#d9534f');
      $diskColor = $diskPercent < 50 ? '#50af51' : ($diskPercent < 70 ? '#e0a800' : '#d9534f');

      $allocatedMemory = humanizeSize($stats['memory']['value'] * 1024 * 1024);
      $totalMemory = humanizeSize($stats['memory']['max'] * 1024 * 1024);
      $allocatedDisk = humanizeSize($stats['disk']['value'] * 1024 * 1024);
      $totalDisk = humanizeSize($stats['disk']['max'] * 1024 * 1024);
    @endphp
        <div class="col-sm-12">
        <div class="info-box bg-{{ $diskColor}}" style="background: {{ $diskColor }}">
          <span class="info-box-icon"><i class="ion ion-ios-folder-outline"></i></span>
          <div class="info-box-content" style="padding: 15px 10px 0;">
          <span class="info-box-text">已分配磁盘空间</span>
          <span class="info-box-number">
            {{ $allocatedDisk }} /
            {{ $totalDisk }}
          </span>
          <div class="progress">
            <div class="progress-bar" style="width: {{ $diskPercent}}%"></div>
          </div>
          </div>
        </div>
        </div>
        <div class="col-sm-12">
        <div class="info-box bg-{{ $memoryColor}}" style="background: {{ $memoryColor }}">
          <span class=" info-box-icon"><i class="ion ion-ios-barcode-outline"></i></span>
          <div class="info-box-content" style="padding: 15px 10px 0;">
          <span class="info-box-text">已分配内存</span>
          <span class="info-box-number">
            {{ humanizeSize($stats['memory']['value'] * 1024 * 1024) }} /
            {{ $totalMemory}}
          </span>
          <div class="progress">
            <div class="progress-bar" style="width: {{ $memoryPercent }}%"></div>
          </div>
          </div>
        </div>
        </div>
      </div>
      </div>
      <div class="col-sm-12">
      <div class="info-box bg-blue">
        <span class="info-box-icon"><i class="ion ion-social-buffer-outline"></i></span>
        <div class="info-box-content" style="padding: 23px 10px 0;">
        <span class="info-box-text">总服务器数</span>
        <span class="info-box-number">{{ $node->servers_count }}</span>
        </div>
      </div>
      </div>
    </div>
    </div>
  </div>
  </div>
  </div>
@endsection

@section('footer-scripts')
  @parent
  <script>
    function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
    }

    (function getInformation() {
    $.ajax({
      method: 'GET',
      url: '/admin/nodes/view/{{ $node->id }}/system-information',
      timeout: 5000,
    }).done(function (data) {
      $('[data-attr="info-version"]').html(escapeHtml(data.version));
      $('[data-attr="info-system"]').html(escapeHtml(data.system.type) + ' (' + escapeHtml(data.system.arch) + ') <code>' + escapeHtml(data.system.release) + '</code>');
      $('[data-attr="info-cpus"]').html(data.system.cpus);
    }).fail(function (jqXHR) {

    }).always(function () {
      setTimeout(getInformation, 10000);
    });
    })();
  </script>
@endsection