<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('guest', [AuthController::class, 'guest']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->group(function (): void {
    // Profile / onboarding
    Route::put('profile', [ProfileController::class, 'update']);
    Route::post('onboarding/complete', [ProfileController::class, 'completeOnboarding']);

    // Boards
    Route::apiResource('boards', BoardController::class)->except('show');

    // Tasks
    Route::get('tasks', [TaskController::class, 'index']);
    Route::post('tasks', [TaskController::class, 'store']);
    Route::put('tasks/{task}', [TaskController::class, 'update']);
    Route::patch('tasks/{task}/toggle', [TaskController::class, 'toggle']);
    Route::delete('tasks/{task}', [TaskController::class, 'destroy']);
    Route::post('tasks/reorder', [TaskController::class, 'reorder']);

    // Events / calendar
    Route::get('events', [EventController::class, 'index']);
    Route::post('events', [EventController::class, 'store']);
    Route::put('events/{event}', [EventController::class, 'update']);
    Route::post('events/{event}/rsvp', [EventController::class, 'rsvp']);
    Route::delete('events/{event}', [EventController::class, 'destroy']);

    // Notes
    Route::get('notes', [NoteController::class, 'index']);
    Route::post('notes', [NoteController::class, 'store']);
    Route::put('notes/{note}', [NoteController::class, 'update']);
    Route::patch('notes/{note}/pin', [NoteController::class, 'pin']);
    Route::delete('notes/{note}', [NoteController::class, 'destroy']);

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy']);
    Route::delete('notifications', [NotificationController::class, 'clear']);

    // Dashboard stats, global search, data export
    Route::get('stats', [StatsController::class, 'summary']);
    Route::get('search', [SearchController::class, 'index']);
    Route::get('export', [ExportController::class, 'download']);
});
