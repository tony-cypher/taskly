<?php

use Illuminate\Http\Request;

$res = app()->handle(Request::create('/api/tasks', 'GET', [], [], [], ['HTTP_ACCEPT' => 'application/json']));
echo 'isolated unauth status: '.$res->status().PHP_EOL;
echo 'body: '.substr($res->getContent() ?: '', 0, 150).PHP_EOL;
