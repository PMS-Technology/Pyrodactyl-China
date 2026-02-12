@extends('layouts.admin')

@section('title')
  {{ $node->name }}: 设置
@endsection

@section('content-header')
  <h1>{{ $node->name }}<small>配置您的节点设置。</small></h1>
  <ol class="breadcrumb">
    <li><a href="{{ route('admin.index') }}">管理</a></li>
    <li><a href="{{ route('admin.nodes') }}">节点</a></li>
    <li><a href="{{ route('admin.nodes.view', $node->id) }}">{{ $node->name }}</a></li>
    <li class="active">设置</li>
  </ol>
@endsection

@section('content')
  <div class="row">
    <div class="col-xs-12">
    <div class="nav-tabs-custom nav-tabs-floating">
      <ul class="nav nav-tabs">
      <li><a href="{{ route('admin.nodes.view', $node->id) }}">关于</a></li>
      <li class="active"><a href="{{ route('admin.nodes.view.settings', $node->id) }}">设置</a></li>
      <li><a href="{{ route('admin.nodes.view.configuration', $node->id) }}">配置</a></li>
      <li><a href="{{ route('admin.nodes.view.allocation', $node->id) }}">分配</a></li>
      <li><a href="{{ route('admin.nodes.view.servers', $node->id) }}">服务器</a></li>
      </ul>
    </div>
    </div>
  </div>
  <form action="{{ route('admin.nodes.view.settings', $node->id) }}" method="POST">
    <div class="row">
    <div class="col-sm-6">
      <div class="box">
      <div class="box-header with-border">
        <h3 class="box-title">设置</h3>
      </div>
      <div class="box-body row">
        <div class="form-group col-xs-12">
        <label for="name" class="control-label">节点名称</label>
        <div>
          <input type="text" autocomplete="off" name="name" class="form-control"
          value="{{ old('name', $node->name) }}" />
          <p class="text-muted"><small>字符限制: <code>a-zA-Z0-9_.-</code> 和 <code>[空格]</code> (最少 1 个，
            最多 100 个字符)。</small></p>
        </div>
        </div>
        <div class="form-group col-xs-12">
        <label for="description" class="control-label">描述</label>
        <div>
          <textarea name="description" id="description" rows="4"
          class="form-control">{{ $node->description }}</textarea>
        </div>
        </div>
        <div class="form-group col-xs-12">
        <label for="name" class="control-label">位置</label>
        <div>
          <select name="location_id" class="form-control">
          @foreach($locations as $location)
        <option value="{{ $location->id }}" {{ (old('location_id', $node->location_id) === $location->id) ? 'selected' : '' }}>{{ $location->long }} ({{ $location->short }})</option>
      @endforeach
          </select>
        </div>
        </div>
        <div class="form-group col-xs-12">
        <label for="public" class="control-label">允许自动分配 <sup><a data-toggle="tooltip"
            data-placement="top" title="允许自动分配到此节点吗？">?</a></sup></label>
        <div>
          <input type="radio" name="public" value="1" {{ (old('public', $node->public)) ? 'checked' : '' }}
          id="public_1" checked> <label for="public_1" style="padding-left:5px;">是</label><br />
          <input type="radio" name="public" value="0" {{ (old('public', $node->public)) ? '' : 'checked' }}
          id="public_0"> <label for="public_0" style="padding-left:5px;">否</label>
        </div>
        </div>
        <div class="form-group col-xs-12">
        <label for="fqdn" class="control-label">公共完全限定域名</label>
        <div>
          <input type="text" autocomplete="off" name="fqdn" class="form-control"
          value="{{ old('fqdn', $node->fqdn) }}" />
        </div>
        <p class="text-muted">
          <small>
          浏览器将用于连接到 Wings 的域名 (例如 <code>wings.example.com</code>)。
          只有在不为此节点使用 SSL 的情况下才可以使用 IP 地址。
          <a tabindex="0" data-toggle="popover" data-trigger="focus" title="为什么我需要一个 FQDN?"
            data-content="为了保护您的服务器与此节点之间的通信，我们使用 SSL。我们无法为 IP 地址生成 SSL 证书，因此您需要提供一个 FQDN。">为什么？</a>
          </small>
        </p>
        </div>
        <div class="form-group col-xs-12">
        <label for="internal_fqdn" class="control-label">
          内部 FQDN
          <strong>(可选)</strong>
        </label>
        <div>
          <input type="text" autocomplete="off" name="internal_fqdn" class="form-control"
          value="{{ old('internal_fqdn', $node->internal_fqdn) }}" />
        </div>
        <p class="text-muted">
          <small>
          <strong>可选:</strong>
          留空以使用公共 FQDN 进行面板到 Wings 的通信。
          如果指定，将使用此内部域名进行面板到 Wings 的通信
          (例如 <code>wings-internal.example.com</code> 或 <code>10.0.0.5</code>)。
          适用于面板需要使用与浏览器不同的地址与 Wings 通信的内部网络。
          </small>
        </p>
        </div>
        <div class="form-group col-xs-12">
        <label class="form-label"><span class="label label-warning"><i class="fa fa-power-off"></i></span>
          通过 SSL 通信</label>
        <div>
          <div class="radio radio-success radio-inline">
          <input type="radio" id="pSSLTrue" value="https" name="scheme" {{ (old('scheme', $node->scheme) === 'https') ? 'checked' : '' }}>
          <label for="pSSLTrue"> 使用 SSL 连接</label>
          </div>
          <div class="radio radio-danger radio-inline">
          <input type="radio" id="pSSLFalse" value="http" name="scheme" {{ (old('scheme', $node->scheme) !== 'https') ? 'checked' : '' }}>
          <label for="pSSLFalse"> 使用 HTTP 连接</label>
          </div>
        </div>
        <p class="text-muted small">在大多数情况下，您应该选择使用 SSL 连接。如果使用 IP 地址
          或您根本不希望使用 SSL，请选择 HTTP 连接。</p>
        </div>
        <div class="form-group col-xs-12">
        <label class="form-label"><span class="label label-warning"><i class="fa fa-power-off"></i></span> 位于
          代理后</label>
        <div>
          <div class="radio radio-success radio-inline">
          <input type="radio" id="pProxyFalse" value="0" name="behind_proxy" {{ (old('behind_proxy', $node->behind_proxy) == false) ? 'checked' : '' }}>
          <label for="pProxyFalse"> 不位于代理后 </label>
          </div>
          <div class="radio radio-info radio-inline">
          <input type="radio" id="pProxyTrue" value="1" name="behind_proxy" {{ (old('behind_proxy', $node->behind_proxy) == true) ? 'checked' : '' }}>
          <label for="pProxyTrue"> 位于代理后 </label>
          </div>
        </div>
        <p class="text-muted small">如果您在 Cloudflare 等代理后运行守护进程，请选择此项以
          使守护进程在启动时跳过查找证书。</p>
        </div>
        <div class="form-group col-xs-12">
        <label class="form-label"><span class="label label-warning"><i class="fa fa-wrench"></i></span> 维护
          模式</label>
        <div>
          <div class="radio radio-success radio-inline">
          <input type="radio" id="pMaintenanceFalse" value="0" name="maintenance_mode" {{ (old('maintenance_mode', $node->maintenance_mode) == false) ? 'checked' : '' }}>
          <label for="pMaintenanceFalse"> 禁用</label>
          </div>
          <div class="radio radio-warning radio-inline">
          <input type="radio" id="pMaintenanceTrue" value="1" name="maintenance_mode" {{ (old('maintenance_mode', $node->maintenance_mode) == true) ? 'checked' : '' }}>
          <label for="pMaintenanceTrue"> 启用</label>
          </div>
        </div>
        <p class="text-muted small">如果节点标记为'维护中'，用户将无法访问
          此节点上的服务器。</p>
        </div>
      </div>
      </div>
    </div>
    <div class="col-sm-6">
      <div class="box">
      <div class="box-header with-border">
        <h3 class="box-title">分配限制</h3>
      </div>
      <div class="box-body row">
        <div class="col-xs-12">
        <div class="row">
          <div class="form-group col-xs-6">
          <label for="memory" class="control-label">总内存</label>
          <div class="input-group">
            <input type="text" name="memory" class="form-control" data-multiplicator="true"
            value="{{ old('memory', $node->memory) }}" />
            <span class="input-group-addon">MiB</span>
          </div>
          </div>
          <div class="form-group col-xs-6">
          <label for="memory_overallocate" class="control-label">超额分配</label>
          <div class="input-group">
            <input type="text" name="memory_overallocate" class="form-control"
            value="{{ old('memory_overallocate', $node->memory_overallocate) }}" />
            <span class="input-group-addon">%</span>
          </div>
          </div>
        </div>
        <p class="text-muted small">输入此节点上可用于分配给服务器的总内存量。
          您也可以提供一个百分比，允许分配超过定义内存的量。</p>
        </div>
        <div class="col-xs-12">
        <div class="row">
          <div class="form-group col-xs-6">
          <label for="disk" class="control-label">磁盘空间</label>
          <div class="input-group">
            <input type="text" name="disk" class="form-control" data-multiplicator="true"
            value="{{ old('disk', $node->disk) }}" />
            <span class="input-group-addon">MiB</span>
          </div>
          </div>
          <div class="form-group col-xs-6">
          <label for="disk_overallocate" class="control-label">超额分配</label>
          <div class="input-group">
            <input type="text" name="disk_overallocate" class="form-control"
            value="{{ old('disk_overallocate', $node->disk_overallocate) }}" />
            <span class="input-group-addon">%</span>
          </div>
          </div>
        </div>
        <p class="text-muted small">输入此节点上可用于服务器分配的总磁盘空间量。
          您也可以提供一个百分比，确定允许超过设定限制的磁盘空间量。</p>
        </div>
      </div>
      </div>
    </div>
    <div class="col-sm-6">
      <div class="box">
      <div class="box-header with-border">
        <h3 class="box-title">常规配置</h3>
      </div>
      <div class="box-body row">
        <div class="form-group col-xs-12">
        <label for="disk_overallocate" class="control-label">最大 Web 上传文件大小</label>
        <div class="input-group">
          <input type="text" name="upload_size" class="form-control"
          value="{{ old('upload_size', $node->upload_size) }}" />
          <span class="input-group-addon">MiB</span>
        </div>
        <p class="text-muted"><small>输入可以通过基于 Web 的文件管理器上传的文件的最大大小。
          </small></p>
        </div>
        <div class="col-xs-12">
        <div class="row">
          <div class="form-group col-md-6">
          <label for="daemonListen" class="control-label"><span class="label label-warning"><i
              class="fa fa-power-off"></i></span> 守护进程端口</label>
          <div>
            <input type="text" name="daemonListen" class="form-control"
            value="{{ old('daemonListen', $node->daemonListen) }}" />
          </div>
          </div>
          <div class="form-group col-md-6">
          <label for="daemonSFTP" class="control-label"><span class="label label-warning"><i
              class="fa fa-power-off"></i></span> 守护进程 SFTP 端口</label>
          <div>
            <input type="text" name="daemonSFTP" class="form-control"
            value="{{ old('daemonSFTP', $node->daemonSFTP) }}" />
          </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
          <p class="text-muted"><small>守护进程运行自己的 SFTP 管理容器，不使用主物理服务器上的 SSHd
            进程。<Strong>不要使用您为物理服务器的 SSH 进程分配的相同端口。</strong></small></p>
          </div>
        </div>
        </div>
      </div>
      </div>
    </div>
    <div class="col-xs-12">
      <div class="box box-primary">
      <div class="box-header with-border">
        <h3 class="box-title">保存设置</h3>
      </div>
      <div class="box-body row">
        <div class="form-group col-sm-6">
        <div>
          <input type="checkbox" name="reset_secret" id="reset_secret" /> <label for="reset_secret"
          class="control-label">重置守护进程主密钥</label>
        </div>
        <p class="text-muted"><small>重置守护进程主密钥将使来自旧密钥的任何请求无效。
          此密钥用于守护进程上的所有敏感操作，包括服务器创建和删除。我们
          建议定期更改此密钥以确保安全。</small></p>
        </div>
      </div>
      <div class="box-footer">
        {!! method_field('PATCH') !!}
        {!! csrf_field() !!}
        <button type="submit" class="btn btn-primary pull-right">保存更改</button>
      </div>
      </div>
    </div>
    </div>
  </form>
@endsection

@section('footer-scripts')
  @parent
  <script>
    $('[data-toggle="popover"]').popover({
    placement: 'auto'
    });
    $('select[name="location_id"]').select2();
  </script>
@endsection