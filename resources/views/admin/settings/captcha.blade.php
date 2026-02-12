@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'captcha'])

@section('title')
  验证码设置
@endsection

@section('content-header')
  <h1>验证码设置<small>为身份验证表单配置验证码保护。</small></h1>
  <ol class="breadcrumb">
    <li><a href="{{ route('admin.index') }}">管理</a></li>
    <li class="active">设置</li>
  </ol>
@endsection

@section('content')
  @yield('settings::nav')
  <div class="row">
    <div class="col-xs-12">
      <form action="{{ route('admin.settings.captcha') }}" method="POST">
        <div class="box">
          <div class="box-header with-border">
            <h3 class="box-title">验证码提供商</h3>
          </div>
          <div class="box-body">
            <div class="row">
              <div class="form-group col-md-4">
                <label class="control-label">提供商</label>
                <div>
                  <select name="pterodactyl:captcha:provider" class="form-control" id="captcha-provider">
                    @foreach($providers as $key => $name)
                      <option value="{{ $key }}" @if(old('pterodactyl:captcha:provider', config('pterodactyl.captcha.provider', 'none')) === $key) selected @endif>{{ $name }}</option>
                    @endforeach
                  </select>
                  <p class="text-muted"><small>选择用于身份验证表单的验证码提供商。</small></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="box" id="turnstile-settings" style="display: none;">
          <div class="box-header with-border">
            <h3 class="box-title">Cloudflare Turnstile 配置</h3>
          </div>
          <div class="box-body">
            <div class="row">
              <div class="form-group col-md-6">
                <label class="control-label">站点密钥</label>
                <div>
                  <input type="text" class="form-control" name="pterodactyl:captcha:turnstile:site_key"
                    value="{{ old('pterodactyl:captcha:turnstile:site_key', config('pterodactyl.captcha.turnstile.site_key', '')) }}" />
                  <p class="text-muted"><small>由 Cloudflare Turnstile 提供的站点密钥。这用于前端小部件。</small></p>
                </div>
              </div>
              <div class="form-group col-md-6">
                <label class="control-label">密钥</label>
                <div>
                  <input type="password" class="form-control" name="pterodactyl:captcha:turnstile:secret_key"
                    value="{{ old('pterodactyl:captcha:turnstile:secret_key', config('pterodactyl.captcha.turnstile.secret_key', '')) }}" />
                  <p class="text-muted"><small>由 Cloudflare Turnstile 提供的密钥。这用于服务器端验证。</small></p>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <div class="alert alert-info">
                  <strong>设置说明：</strong>
                  <ol>
                    <li>访问 <a href="https://dash.cloudflare.com/?to=/:account/turnstile" target="_blank">Cloudflare Turnstile 仪表板</a></li>
                    <li>创建新站点或选择现有站点</li>
                    <li>将您的域名添加到站点配置中</li>
                    <li>从仪表板复制站点密钥和密钥</li>
                    <li>将它们粘贴到上面的字段中</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="box" id="hcaptcha-settings" style="display: none;">
          <div class="box-header with-border">
            <h3 class="box-title">hCaptcha 配置</h3>
          </div>
          <div class="box-body">
            <div class="row">
              <div class="form-group col-md-6">
                <label class="control-label">站点密钥</label>
                <div>
                  <input type="text" class="form-control" name="pterodactyl:captcha:hcaptcha:site_key"
                    value="{{ old('pterodactyl:captcha:hcaptcha:site_key', config('pterodactyl.captcha.hcaptcha.site_key', '')) }}" />
                  <p class="text-muted"><small>由 hCaptcha 提供的站点密钥。这用于前端小部件。</small></p>
                </div>
              </div>
              <div class="form-group col-md-6">
                <label class="control-label">密钥</label>
                <div>
                  <input type="password" class="form-control" name="pterodactyl:captcha:hcaptcha:secret_key"
                    value="{{ old('pterodactyl:captcha:hcaptcha:secret_key', config('pterodactyl.captcha.hcaptcha.secret_key', '')) }}" />
                  <p class="text-muted"><small>由 hCaptcha 提供的密钥。这用于服务器端验证。</small></p>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <div class="alert alert-info">
                  <strong>设置说明：</strong>
                  <ol>
                    <li>访问 <a href="https://dashboard.hcaptcha.com/sites" target="_blank">hCaptcha 仪表板</a></li>
                    <li>创建新站点或选择现有站点</li>
                    <li>将您的域名添加到站点配置中</li>
                    <li>从仪表板复制站点密钥和密钥</li>
                    <li>将它们粘贴到上面的字段中</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="box" id="recaptcha-settings" style="display: none;">
          <div class="box-header with-border">
            <h3 class="box-title">Google reCAPTCHA v3 配置</h3>
          </div>
          <div class="box-body">
            <div class="row">
              <div class="form-group col-md-6">
                <label class="control-label">站点密钥</label>
                <div>
                  <input type="text" class="form-control" name="pterodactyl:captcha:recaptcha:site_key"
                    value="{{ old('pterodactyl:captcha:recaptcha:site_key', config('pterodactyl.captcha.recaptcha.site_key', '')) }}" />
                  <p class="text-muted"><small>由 Google reCAPTCHA v3 提供的站点密钥。这用于前端集成。</small></p>
                </div>
              </div>
              <div class="form-group col-md-6">
                <label class="control-label">密钥</label>
                <div>
                  <input type="password" class="form-control" name="pterodactyl:captcha:recaptcha:secret_key"
                    value="{{ old('pterodactyl:captcha:recaptcha:secret_key', config('pterodactyl.captcha.recaptcha.secret_key', '')) }}" />
                  <p class="text-muted"><small>由 Google reCAPTCHA v3 提供的密钥。这用于服务器端验证。</small></p>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <div class="alert alert-info">
                  <strong>reCAPTCHA v3 设置说明：</strong>
                  <ol>
                    <li>访问 <a href="https://www.google.com/recaptcha/admin" target="_blank">Google reCAPTCHA 管理控制台</a></li>
                    <li>创建新站点并选择 <strong>reCAPTCHA v3</strong></li>
                    <li>将您的域名添加到站点配置中</li>
                    <li>从仪表板复制站点密钥和密钥</li>
                    <li>将它们粘贴到上面的字段中</li>
                  </ol>
                  <p><strong>注意：</strong> reCAPTCHA v3 在后台无形运行，并根据用户交互返回分数（0.0-1.0）。默认使用 0.5 的阈值。</p>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div class="box box-primary">
          <div class="box-footer">
            {{ csrf_field() }}
            <button type="submit" name="_method" value="PATCH" class="btn btn-sm btn-primary pull-right">保存</button>
          </div>
        </div>
      </form>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const providerSelect = document.getElementById('captcha-provider');
      const turnstileSettings = document.getElementById('turnstile-settings');
      const hcaptchaSettings = document.getElementById('hcaptcha-settings');
      const recaptchaSettings = document.getElementById('recaptcha-settings');

      function toggleSettings() {
        const provider = providerSelect.value;
        
        // Hide all provider-specific settings first
        turnstileSettings.style.display = 'none';
        hcaptchaSettings.style.display = 'none';
        recaptchaSettings.style.display = 'none';
        
        if (provider === 'turnstile') {
          turnstileSettings.style.display = 'block';
        } else if (provider === 'hcaptcha') {
          hcaptchaSettings.style.display = 'block';
        } else if (provider === 'recaptcha') {
          recaptchaSettings.style.display = 'block';
        }
      }

      providerSelect.addEventListener('change', toggleSettings);
      
      // Initialize on page load with a small delay to ensure DOM is ready
      setTimeout(toggleSettings, 100);
    });
  </script>
@endsection