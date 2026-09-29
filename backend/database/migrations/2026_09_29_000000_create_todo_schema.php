<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->boolean('is_guest')->default(false)->after('password');
            $table->string('avatar')->nullable()->after('is_guest');
            $table->boolean('onboarded')->default(false)->after('avatar');
            $table->string('theme', 10)->default('light')->after('onboarded');
            $table->json('settings')->nullable()->after('theme');
        });

        Schema::create('boards', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('color', 20)->default('violet');
            $table->integer('position')->default(0);
            $table->timestamps();
        });

        Schema::create('tasks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('board_id')->nullable()->constrained()->cascadeOnSetNull();
            $table->string('title');
            $table->text('description')->nullable();
            $table->boolean('completed')->default(false);
            $table->string('priority', 10)->default('low'); // low | medium | high
            $table->string('category', 40)->nullable(); // e.g. "Motion design"
            $table->string('tag', 40)->nullable(); // e.g. "Logo"
            $table->integer('progress')->default(0); // 0-100
            $table->timestamp('due_at')->nullable();
            $table->timestamp('remind_at')->nullable();
            $table->integer('position')->default(0);
            $table->timestamps();
        });

        Schema::create('events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->string('category', 40)->nullable(); // e.g. Design / Client
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->string('status', 20)->default('pending'); // pending | accepted | declined
            $table->timestamps();
        });

        Schema::create('app_notifications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 40); // event | message | reminder | assignment
            $table->string('title');
            $table->text('body')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->boolean('read_at_flag')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_notifications');
        Schema::dropIfExists('events');
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('boards');
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['is_guest', 'avatar', 'onboarded', 'theme', 'settings']);
        });
    }
};
