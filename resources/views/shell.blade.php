<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">
<base href="{{ rtrim(url('/'), '/') }}/">{{-- URL relatif tetap ke akar aplikasi meski rute /panel/... --}}
<title>{{ $cfg['appName'] }}</title>
{{-- Terapkan tema gelap sebelum CSS/JS termuat (hindari flash). --}}
<script>(function(){var t=localStorage.getItem('sample.theme');var dark=t==='dark'||((t===null||t==='system')&&matchMedia('(prefers-color-scheme: dark)').matches);if(dark)document.documentElement.classList.add('dark');})();</script>
<script>window.CFG = @json($cfg);</script>{{-- Jembatan server → client, analog QUANTA_CFG pada hris-adsy. --}}
@vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
{{-- Tiga bagian; hanya satu yang ditampilkan oleh routeTop() (resources/js/app.js).
     #login  -> vanilla JS renderLogin()
     #panel  -> vanilla JS Panel.render()
     #member -> Alpine (x-data wrapper), template lengkap di member-body.blade.php
     Pattern ini analog app.blade.php pada hris-adsy. --}}
<div id="login" hidden></div>
<div id="panel" hidden></div>
<div id="member" class="min-h-screen" x-data x-cloak hidden>
    @include('member-body')
</div>
</body>
</html>