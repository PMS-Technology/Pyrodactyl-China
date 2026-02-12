@extends('layouts.admin')

@section('title')
    节点 &rarr; 新建
@endsection

@section('content-header')
    <h1>新建节点<small>创建一个新的本地或远程节点，用于安装服务器。</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li><a href="{{ route('admin.nodes') }}">节点</a></li>
        <li class="active">新建</li>
    </ol>
@endsection

@section('content')
<form action="{{ route('admin.nodes.new') }}" method="POST">
    <div class="row">
        <div class="col-sm-6">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">基本详情</h3>
                </div>
                <div class="box-body">
                    <div class="form-group">
                        <label for="pName" class="form-label">名称</label>
                        <input type="text" name="name" id="pName" class="form-control" value="{{ old('name') }}"/>
                        <p class="text-muted small">字符限制: <code>a-zA-Z0-9_.-</code> 和 <code>[空格]</code> (最少 1 个，最多 100 个字符)。</p>
                    </div>
                    <div class="form-group">
                        <label for="pDescription" class="form-label">描述</label>
                        <textarea name="description" id="pDescription" rows="4" class="form-control">{{ old('description') }}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="pLocationId" class="form-label">位置</label>
                        <select name="location_id" id="pLocationId">
                            @foreach($locations as $location)
                                <option value="{{ $location->id }}" {{ $location->id != old('location_id') ?: 'selected' }}>{{ $location->short }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">节点可见性</label>
                        <div>
                            <div class="radio radio-success radio-inline">

                                <input type="radio" id="pPublicTrue" value="1" name="public" checked>
                                <label for="pPublicTrue"> 公共 </label>
                            </div>
                            <div class="radio radio-danger radio-inline">
                                <input type="radio" id="pPublicFalse" value="0" name="public">
                                <label for="pPublicFalse"> 私有 </label>
                            </div>
                        </div>
                        <p class="text-muted small">将节点设置为 <code>私有</code> 将会拒绝自动部署到此节点的能力。
                    </div>
                    <div class="form-group">
                        <label for="pFQDN" class="form-label">公共 FQDN</label>
                        <input type="text" name="fqdn" id="pFQDN" class="form-control" value="{{ old('fqdn') }}" />
                        <p class="text-muted small">
                            浏览器将用于连接到 Wings 的域名 (例如 <code>wings.example.com</code>)。
                            只有在不为此节点使用 SSL 的情况下才可以使用 IP 地址。
                        </p>
                    </div>
                    <div class="form-group">
                        <label for="pInternalFQDN" class="form-label">
                            内部 FQDN
                            <strong>(可选)</strong>
                        </label>
                        <input type="text" name="internal_fqdn" id="pInternalFQDN" class="form-control"
                            value="{{ old('internal_fqdn') }}" />
                        <p class="text-muted small">
                            <strong>可选:</strong>
                            留空以使用公共 FQDN 进行面板到 Wings 的通信。
                            如果指定，将使用此内部域名进行面板到 Wings 的通信
                            (例如 <code>wings-internal.example.com</code> 或 <code>10.0.0.5</code>)。
                            适用于面板需要使用与浏览器不同的地址与 Wings 通信的内部网络。
                        </p>
                    </div>
                    <div class="form-group">
                        <label class="form-label">通过 SSL 通信</label>
                        <div>
                            <div class="radio radio-success radio-inline">
                                <input type="radio" id="pSSLTrue" value="https" name="scheme" checked>
                                <label for="pSSLTrue"> 使用 SSL 连接</label>
                            </div>
                            <div class="radio radio-danger radio-inline">
                                <input type="radio" id="pSSLFalse" value="http" name="scheme" @if(request()->isSecure()) disabled @endif>
                                <label for="pSSLFalse"> 使用 HTTP 连接</label>
                            </div>
                        </div>
                        @if(request()->isSecure())
                            <p class="text-danger small">您的面板当前配置为使用安全连接。为了让浏览器连接到您的节点，它<strong>必须</strong>使用 SSL 连接。</p>
                        @else
                            <p class="text-muted small">在大多数情况下，您应该选择使用 SSL 连接。如果使用 IP 地址或您根本不希望使用 SSL，请选择 HTTP 连接。</p>
                        @endif
                    </div>
                    <div class="form-group">
                        <label class="form-label">位于代理后</label>
                        <div>
                            <div class="radio radio-success radio-inline">
                                <input type="radio" id="pProxyFalse" value="0" name="behind_proxy" checked>
                                <label for="pProxyFalse"> 不位于代理后 </label>
                            </div>
                            <div class="radio radio-info radio-inline">
                                <input type="radio" id="pProxyTrue" value="1" name="behind_proxy">
                                <label for="pProxyTrue"> 位于代理后 </label>
                            </div>
                        </div>
                        <p class="text-muted small">如果您在 Cloudflare 等代理后运行守护进程，请选择此项以使守护进程在启动时跳过查找证书。</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-sm-6">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">配置</h3>
                </div>
                <div class="box-body">
                    <div class="row">
                        <div class="form-group col-md-6">
                            <label for="pDaemonBase" class="form-label">守护进程服务器文件目录</label>
                            <input type="text" name="daemonBase" id="pDaemonBase" class="form-control" value="/var/lib/pterodactyl/volumes" />
                            <p class="text-muted small">输入应存储服务器文件的目录。<strong>如果您使用 OVH，您应该检查您的分区方案。您可能需要使用 <code>/home/daemon-data</code> 才能有足够的空间。</strong></p>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="pMemory" class="form-label">总内存</label>
                            <div class="input-group">
                                <input type="text" name="memory" data-multiplicator="true" class="form-control" id="pMemory" value="{{ old('memory') }}"/>
                                <span class="input-group-addon">MiB</span>
                            </div>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="pMemoryOverallocate" class="form-label">内存超额分配</label>
                            <div class="input-group">
                                <input type="text" name="memory_overallocate" class="form-control" id="pMemoryOverallocate" value="{{ old('memory_overallocate') }}"/>
                                <span class="input-group-addon">%</span>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <p class="text-muted small">输入可用于新服务器的总内存量。如果您希望允许内存超额分配，请输入您希望允许的百分比。要禁用超额分配检查，请在字段中输入 <code>-1</code>。输入 <code>0</code> 将防止创建新服务器，如果这会使节点超出限制。</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col-md-6">
                            <label for="pDisk" class="form-label">总磁盘空间</label>
                            <div class="input-group">
                                <input type="text" name="disk" data-multiplicator="true" class="form-control" id="pDisk" value="{{ old('disk') }}"/>
                                <span class="input-group-addon">MiB</span>
                            </div>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="pDiskOverallocate" class="form-label">磁盘超额分配</label>
                            <div class="input-group">
                                <input type="text" name="disk_overallocate" class="form-control" id="pDiskOverallocate" value="{{ old('disk_overallocate') }}"/>
                                <span class="input-group-addon">%</span>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <p class="text-muted small">输入可用于新服务器的总磁盘空间量。如果您希望允许磁盘空间超额分配，请输入您希望允许的百分比。要禁用超额分配检查，请在字段中输入 <code>-1</code>。输入 <code>0</code> 将防止创建新服务器，如果这会使节点超出限制。</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col-md-6">
                            <label for="pDaemonListen" class="form-label">守护进程端口</label>
                            <input type="text" name="daemonListen" class="form-control" id="pDaemonListen" value="8080" />
                        </div>
                        <div class="form-group col-md-6">
                            <label for="pDaemonSFTP" class="form-label">守护进程 SFTP 端口</label>
                            <input type="text" name="daemonSFTP" class="form-control" id="pDaemonSFTP" value="2022" />
                        </div>
                        <div class="col-md-12">
                            <p class="text-muted small">守护进程运行自己的 SFTP 管理容器，不使用主物理服务器上的 SSHd 进程。<Strong>不要使用您为物理服务器的 SSH 进程分配的相同端口。</strong> 如果您将在 CloudFlare&reg; 后运行守护进程，您应该将守护进程端口设置为 <code>8443</code> 以允许通过 SSL 进行 websocket 代理。</p>
                        </div>
                    </div>
                </div>
                <div class="box-footer">
                    {!! csrf_field() !!}
                    <button type="submit" class="btn btn-success pull-right">创建节点</button>
                </div>
            </div>
        </div>
    </div>
</form>
@endsection

@section('footer-scripts')
    @parent
    <script>
        $('#pLocationId').select2();
    </script>
@endsection
