<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->unique()->after('id');
            $table->string('google_avatar')->nullable()->after('google_id');
            $table->boolean('is_admin')->default(false)->after('email');
            $table->boolean('is_subscribed')->default(false)->after('is_admin');
            $table->timestamp('subscription_ends_at')->nullable()->after('is_subscribed');
            $table->string('password')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['google_id', 'google_avatar', 'is_admin', 'is_subscribed', 'subscription_ends_at']);
            $table->string('password')->nullable(false)->change();
        });
    }
};
