@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'domains'])

@section('title')
  创建域名
@endsection

@section('content-header')
  <h1>创建域名<small>添加用于子域名管理的新DNS域名。</small></h1>
  <ol class="breadcrumb">
    <li><a href="{{ route('admin.index') }}">管理</a></li>
    <li><a href="{{ route('admin.settings') }}">设置</a></li>
    <li><a href="{{ route('admin.settings.domains.index') }}">域名</a></li>
    <li class="active">创建</li>
  </ol>
@endsection

@section('content')
  @yield('settings::nav')
  <div class="row">
    <div class="col-xs-12">
      <form action="{{ route('admin.settings.domains.store') }}" method="POST" id="domain-form">
        <div class="box">
          <div class="box-header with-border">
            <h3 class="box-title">域名信息</h3>
          </div>
          <div class="box-body">
            <div class="row">
              <div class="form-group col-md-6">
                <label for="name" class="control-label">域名 <span class="field-required"></span></label>
                <div>
                  <input type="text" name="name" id="name" class="form-control" value="{{ old('name') }}"
                    placeholder="example.com" required />
                  <p class="text-muted small">将用于子域名的域名（例如：example.com）。</p>
                </div>
              </div>
              <div class="form-group col-md-6">
                <label for="dns_provider" class="control-label">DNS提供商 <span class="field-required"></span></label>
                <div>
                  <select name="dns_provider" id="dns_provider" class="form-control" required>
                    <option value="">选择DNS提供商...</option>
                    @foreach($providers as $key => $provider)
                      <option value="{{ $key }}" @if(old('dns_provider') === $key) selected @endif>
                        {{ $provider['name'] }}
                      </option>
                    @endforeach
                  </select>
                  <p class="text-muted small">管理此域名的DNS服务提供商。</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="box" id="dns-config-box" style="display: none;">
          <div class="box-header with-border">
            <h3 class="box-title">DNS提供商配置</h3>
          </div>
          <div class="box-body" id="dns-config-content">
            <!-- Dynamic content will be loaded here -->
          </div>
        </div>

        <div class="box">
          <div class="box-header with-border">
            <h3 class="box-title">附加设置</h3>
          </div>
          <div class="box-body">
            <div class="row">
              <div class="form-group col-md-6">
                <label class="control-label">状态</label>
                <div>
                  <div class="btn-group" data-toggle="buttons">
                    <label class="btn btn-outline-primary @if(old('is_active', true)) active @endif">
                      <input type="radio" name="is_active" value="1" @if(old('is_active', true)) checked @endif> 活跃
                    </label>
                    <label class="btn btn-outline-primary @if(!old('is_active', true)) active @endif">
                      <input type="radio" name="is_active" value="0" @if(!old('is_active', true)) checked @endif> 不活跃
                    </label>
                  </div>
                  <p class="text-muted small">此域名是否应可用于子域名创建。</p>
                </div>
              </div>
              <div class="form-group col-md-6">
                <label class="control-label">默认域名</label>
                <div>
                  <div class="btn-group" data-toggle="buttons">
                    <label class="btn btn-outline-primary @if(old('is_default', false)) active @endif">
                      <input type="radio" name="is_default" value="1" @if(old('is_default', false)) checked @endif> 是
                    </label>
                    <label class="btn btn-outline-primary @if(!old('is_default', false)) active @endif">
                      <input type="radio" name="is_default" value="0" @if(!old('is_default', false)) checked @endif> 否
                    </label>
                  </div>
                  <p class="text-muted small">此域名是否应用作自动子域名生成的默认域名。</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="box box-primary">
          <div class="box-footer">
            {{ csrf_field() }}
            <button type="button" id="test-connection" class="btn btn-sm btn-info" disabled>
              <i class="fa fa-refresh fa-spin" style="display: none;"></i> 测试连接
            </button>
            <a href="{{ route('admin.settings.domains.index') }}" class="btn btn-sm btn-default">取消</a>
            <button type="submit" class="btn btn-sm btn-success pull-right">创建域名</button>
          </div>
        </div>
      </form>
    </div>
  </div>
@endsection

@section('footer-scripts')
  @parent
  <script>
    $(document).ready(function () {
      const $providerSelect = $('#dns_provider');
      const $configBox = $('#dns-config-box');
      const $configContent = $('#dns-config-content');
      const $testButton = $('#test-connection');
      const $form = $('#domain-form');

      // Handle provider selection
      $providerSelect.change(function () {
        const provider = $(this).val();

        if (provider) {
          loadProviderConfig(provider);
          $testButton.prop('disabled', false);
        } else {
          $configBox.hide();
          $testButton.prop('disabled', true);
        }
      });

      // Test connection
      $testButton.click(function () {
        const $button = $(this);
        const $spinner = $button.find('.fa-spin');

        // Gather form data
        const formData = {
          dns_provider: $providerSelect.val(),
          dns_config: {}
        };

        // Collect DNS config fields
        $configContent.find('input').each(function () {
          const name = $(this).attr('name');
          if (name && name.startsWith('dns_config[')) {
            const key = name.replace('dns_config[', '').replace(']', '');
            formData.dns_config[key] = $(this).val();
          }
        });

        $button.prop('disabled', true);
        $spinner.show();

        $.post("{{ route('admin.settings.domains.test-connection') }}", {
          _token: "{{ csrf_token() }}",
          ...formData
        })
          .done(function (response) {
            if (response.success) {
              swal({
                type: 'success',
                title: '连接成功',
                text: response.message
              });
            } else {
              swal({
                type: 'error',
                title: '连接失败',
                text: response.message
              });
            }
          })
          .fail(function (xhr) {
            const response = xhr.responseJSON || {};
            swal({
              type: 'error',
              title: '连接失败',
              text: response.message || '发生意外错误。'
            });
          })
          .always(function () {
            $button.prop('disabled', false);
            $spinner.hide();
          });
      });

      // Load provider configuration
      function loadProviderConfig(provider) {
        $.get(`{{ route('admin.settings.domains.provider-schema', ':provider') }}`.replace(':provider', provider))
          .done(function (response) {
            if (response.success) {
              renderConfigForm(response.schema);
              $configBox.show();
            }
          })
          .fail(function () {
            $configBox.hide();
          });
      }

      // Render configuration form
      function renderConfigForm(schema) {
        let html = '<div class="row">';

        Object.keys(schema).forEach(function (key) {
          const field = schema[key];
          const oldValue = `{{ old('dns_config.${key}') }}`.replace('${key}', key);

          html += `
                          <div class="form-group col-md-6">
                            <label for="dns_config_${key}" class="control-label">
                              ${field.description || key} 
                              ${field.required ? '<span class="field-required"></span>' : ''}
                            </label>
                            <div>
                              <input type="${field.sensitive ? 'password' : 'text'}" 
                                     name="dns_config[${key}]" 
                                     id="dns_config_${key}" 
                                     class="form-control" 
                                     value="${oldValue}"
                                     ${field.required ? 'required' : ''} />
                            </div>
                          </div>
                        `;
        });

        html += '</div>';
        $configContent.html(html);
      }

      // Trigger change if provider is pre-selected
      if ($providerSelect.val()) {
        $providerSelect.trigger('change');
      }
    });
  </script>
@endsection