<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('body')->nullable();
            $table->string('color', 20)->default('violet');
            $table->boolean('pinned')->default(false);
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->boolean('notes_seeded')->default(false)->after('settings');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('notes_seeded');
        });
    }
};
