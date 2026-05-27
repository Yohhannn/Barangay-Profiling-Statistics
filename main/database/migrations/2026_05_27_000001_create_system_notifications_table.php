<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_notifications', function (Blueprint $table) {
            $table->id('notif_id');
            $table->unsignedBigInteger('sys_id');
            $table->string('type', 50);
            $table->string('title', 255);
            $table->text('message');
            $table->string('link', 500)->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('sys_id')->references('sys_id')->on('system_accounts')->onDelete('cascade');
            $table->index(['sys_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_notifications');
    }
};
