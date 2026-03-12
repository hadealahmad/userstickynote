<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('twitter_user_id');
            $table->string('twitter_username')->nullable();
            $table->text('content');
            $table->string('source_url')->nullable();
            $table->string('client_id')->nullable(); // UUID from extension for upsert
            $table->timestamps();

            $table->index(['user_id', 'twitter_user_id']);
            $table->unique(['user_id', 'client_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
