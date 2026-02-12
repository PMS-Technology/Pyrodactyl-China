@include('partials/admin.settings.notice')

@section('settings::nav')
    @yield('settings::notice')
    <div class="row">
        <div class="col-xs-12">
            <div class="nav-tabs-custom nav-tabs-floating">
                <ul class="nav nav-tabs">
                    <li @if($activeTab === 'basic')class="active"@endif><a href="{{ route('admin.settings') }}">常规</a></li>
                    <li @if($activeTab === 'mail')class="active"@endif><a href="{{ route('admin.settings.mail') }}">邮件</a></li>
                    <li @if($activeTab === 'captcha')class="active"@endif><a href="{{ route('admin.settings.captcha') }}">验证码</a></li>
                    <li @if($activeTab === 'domains')class="active"@endif><a href="{{ route('admin.settings.domains.index') }}">域名</a></li>
                    <li @if($activeTab === 'advanced')class="active"@endif><a href="{{ route('admin.settings.advanced') }}">高级</a></li>
                </ul>
            </div>
        </div>
    </div>
@endsection
