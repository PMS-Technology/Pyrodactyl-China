@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'domains'])

@section('title')
  域名管理
@endsection

@section('content-header')
  <h1>域名管理<small>配置用于子域名管理的DNS域名。</small></h1>
  <ol class="breadcrumb">
    <li><a href="{{ route('admin.index') }}">管理</a></li>
    <li><a href="{{ route('admin.settings') }}">设置</a></li>
    <li class="active">域名</li>
  </ol>
@endsection

@section('content')
  @yield('settings::nav')
  <div class="row">
    <div class="col-xs-12">
      <div class="box">
        <div class="box-header with-border">
          <h3 class="box-title">已配置的域名</h3>
          <div class="box-tools">
            <a href="{{ route('admin.settings.domains.create') }}" class="btn btn-sm btn-primary">创建新域名</a>
          </div>
        </div>
        <div class="box-body table-responsive no-padding">
          @if(count($domains) > 0)
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>域名</th>
                  <th>DNS提供商</th>
                  <th>状态</th>
                  <th>默认</th>
                  <th>子域名</th>
                  <th>创建时间</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @foreach($domains as $domain)
                  <tr>
                    <td><code>{{ $domain->name }}</code></td>
                    <td>
                      <span class="label label-primary">{{ ucfirst($domain->dns_provider) }}</span>
                    </td>
                    <td>
                      @if($domain->is_active)
                        <span class="label label-success">活跃</span>
                      @else
                        <span class="label label-danger">不活跃</span>
                      @endif
                    </td>
                    <td>
                      @if($domain->is_default)
                        <span class="label label-info">默认</span>
                      @endif
                    </td>
                    <td>
                      <span class="label label-default">{{ $domain->server_subdomains_count ?? 0 }}</span>
                    </td>
                    <td>{{ $domain->created_at->diffForHumans() }}</td>
                    <td class="text-center">
                      <a href="{{ route('admin.settings.domains.edit', $domain) }}" class="btn btn-xs btn-primary">编辑</a>
                      @if($domain->server_subdomains_count == 0)
                        <form action="{{ route('admin.settings.domains.destroy', $domain) }}" method="POST" style="display: inline;" onsubmit="return confirm('Are you sure you want to delete this domain?')">
                          @csrf
                          @method('DELETE')
                          <button type="submit" class="btn btn-xs btn-danger">删除</button>
                        </form>
                      @endif
                    </td>
                  </tr>
                @endforeach
              </tbody>
            </table>
          @else
            <div class="text-center" style="padding: 50px;">
              <h4 class="text-muted">未配置域名</h4>
              <p class="text-muted">
                配置DNS域名以启用服务器的子域名管理。<br>
                <a href="{{ route('admin.settings.domains.create') }}" class="btn btn-primary btn-sm" style="margin-top: 10px;">创建您的第一个域名</a>
              </p>
            </div>
          @endif
        </div>
      </div>
    </div>
  </div>
@endsection

@section('footer-scripts')
  @parent
  <script>
    $(document).ready(function() {
      $('.btn-danger').click(function(e) {
        if (!confirm('您确定要删除此域名吗？此操作无法撤销。')) {
          e.preventDefault();
          return false;
        }
      });
    });
  </script>
@endsection