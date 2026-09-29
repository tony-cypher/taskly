<?php

// Temporary end-to-end verification script (not part of the app).

use App\Models\User;
use Illuminate\Support\Facades\Hash;

function check(string $label, bool $ok, string $extra = ''): void
{
    echo ($ok ? 'PASS' : 'FAIL').' '.$label.($extra !== '' ? ' -- '.$extra : '').PHP_EOL;
}

// axios always sends Accept: application/json; without it Laravel would redirect instead of JSON.
define('JSON_HEADERS', ['HTTP_ACCEPT' => 'application/json']);

// --- Guest mode ---
$guestRes = app()->handle(Illuminate\Http\Request::create('/api/auth/guest', 'POST'));
$guest = json_decode($guestRes->getContent(), true);
check('guest creates session', $guestRes->status() === 201 && ($guest['token'] ?? false) && ($guest['user']['is_guest'] ?? false));

$token = $guest['token'];
$guestId = $guest['user']['id'];

// Guest token resume
$resumeRes = app()->handle(Illuminate\Http\Request::create('/api/auth/guest', 'POST', ['token' => $token]));
$resume = json_decode($resumeRes->getContent(), true);
check('guest resume returns same user', ($resume['user']['id'] ?? 0) === $guestId);

// --- Authenticated data via middleware ---
$h = ['Authorization' => 'Bearer '.$token];

$getStats = app()->handle(Illuminate\Http\Request::create('/api/stats', 'GET', [], [], [], ['HTTP_Authorization' => $h['Authorization']]));
$stats = json_decode($getStats->getContent(), true);
check('stats seeded for guest', isset($stats['total']) && $stats['total'] >= 6, json_encode($stats));

$getTasks = app()->handle(Illuminate\Http\Request::create('/api/tasks', 'GET', [], [], [], ['HTTP_Authorization' => $h['Authorization']]));
$tasks = json_decode($getTasks->getContent(), true)['data'] ?? [];
check('tasks list', count($tasks) >= 6, count($tasks).' tasks');

// Create task
$createRes = app()->handle(Illuminate\Http\Request::create('/api/tasks', 'POST', ['title' => 'Smoke test task', 'priority' => 'high', 'progress' => 25], [], [], ['HTTP_Authorization' => $h['Authorization']]));
$created = json_decode($createRes->getContent(), true)['data'] ?? [];
check('task create', isset($created['id']) && $created['title'] === 'Smoke test task');

$taskId = $created['id'] ?? 0;

// Toggle
$toggleRes = app()->handle(Illuminate\Http\Request::create("/api/tasks/{$taskId}/toggle", 'PATCH', [], [], [], ['HTTP_Authorization' => $h['Authorization']]));
$toggle = json_decode($toggleRes->getContent(), true)['data'] ?? [];
check('task toggle -> completed', ($toggle['completed'] ?? false) === true);

// Update
$updateRes = app()->handle(Illuminate\Http\Request::create("/api/tasks/{$taskId}", 'PUT', ['title' => 'Smoke test updated', 'progress' => 80], [], [], ['HTTP_Authorization' => $h['Authorization']]));
$updated = json_decode($updateRes->getContent(), true)['data'] ?? [];
check('task update', ($updated['title'] ?? '') === 'Smoke test updated');

// Reorder
$ids = array_column($tasks, 'id');
$reorderPayload = json_encode(['ids' => array_reverse($ids)]);
$reorderRes = app()->handle(Illuminate\Http\Request::create('/api/tasks/reorder', 'POST', [], [], [], ['HTTP_Authorization' => $h['Authorization'], 'CONTENT_TYPE' => 'application/json'], $reorderPayload));
check('task reorder', $reorderRes->status() === 200);

// Events + RSVP
$getEvents = app()->handle(Illuminate\Http\Request::create('/api/events', 'GET', [], [], [], ['HTTP_Authorization' => $h['Authorization']]));
$events = json_decode($getEvents->getContent(), true);
$pending = collect($events)->firstWhere('status', 'pending');
check('events list + pending exists', is_array($events) && $pending !== null);

$evtId = $pending['id'] ?? 0;
$rsvpRes = app()->handle(Illuminate\Http\Request::create("/api/events/{$evtId}/rsvp", 'POST', ['status' => 'accepted'], [], [], ['HTTP_Authorization' => $h['Authorization']]));
$rsvp = json_decode($rsvpRes->getContent(), true);
check('event rsvp accept', ($rsvp['status'] ?? '') === 'accepted');

// Notifications
$notifRes = app()->handle(Illuminate\Http\Request::create('/api/notifications', 'GET', [], [], [], ['HTTP_Authorization' => $h['Authorization']]));
$notif = json_decode($notifRes->getContent(), true);
check('notifications list', isset($notif['items']) && count($notif['items']) >= 3, 'unread='.$notif['unread']);

$readAllRes = app()->handle(Illuminate\Http\Request::create('/api/notifications/read-all', 'POST', [], [], [], ['HTTP_Authorization' => $h['Authorization']]));
check('mark all read', $readAllRes->status() === 200);

// Search
$searchRes = app()->handle(Illuminate\Http\Request::create('/api/search', 'GET', ['q' => 'meeting'], [], [], ['HTTP_Authorization' => $h['Authorization']]));
$search = json_decode($searchRes->getContent(), true);
check('search finds results', count($search['tasks'] ?? []) + count($search['events'] ?? []) > 0);

// Export
$exportRes = app()->handle(Illuminate\Http\Request::create('/api/export', 'GET', [], [], [], ['HTTP_Authorization' => $h['Authorization']]));
check('export CSV', str_contains($exportRes->headers->get('Content-Disposition') ?? '', 'todo-export') , substr($exportRes->getContent(), 0, 40));

// Register + login
$uniq = 'user'.rand(1000, 9999);
$regRes = app()->handle(Illuminate\Http\Request::create('/api/auth/register', 'POST', ['name' => 'Test User', 'email' => "{$uniq}@example.com", 'password' => 'password1'], [], [], JSON_HEADERS));
$reg = json_decode($regRes->getContent(), true);
check('register', $regRes->status() === 201 && ($reg['user']['is_guest'] ?? true) === false);

$loginRes = app()->handle(Illuminate\Http\Request::create('/api/auth/login', 'POST', ['email' => "{$uniq}@example.com", 'password' => 'password1'], [], [], JSON_HEADERS));
$login = json_decode($loginRes->getContent(), true);
check('login', $loginRes->status() === 200 && isset($login['token']), 'status='.$loginRes->status());

// Wrong password rejected
$badRes = app()->handle(Illuminate\Http\Request::create('/api/auth/login', 'POST', ['email' => "{$uniq}@example.com", 'password' => 'wrongpass'], [], [], JSON_HEADERS));
check('bad login rejected', $badRes->status() === 422 || $badRes->status() === 401);

// Unauthenticated rejected
$unauthRes = app()->handle(Illuminate\Http\Request::create('/api/tasks', 'GET', [], [], [], JSON_HEADERS));
check('unauth rejected', $unauthRes->status() === 401, 'status='.$unauthRes->status());

echo PHP_EOL.'DONE'.PHP_EOL;
