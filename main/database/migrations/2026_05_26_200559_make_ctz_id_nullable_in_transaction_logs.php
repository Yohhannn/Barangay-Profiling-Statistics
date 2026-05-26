<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transaction_logs', function (Blueprint $table) {
            $table->dropForeign(['ctz_id']);
            $table->unsignedBigInteger('ctz_id')->nullable()->change();
            $table->foreign('ctz_id')->references('ctz_id')->on('citizens')->onDelete('set null')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('transaction_logs', function (Blueprint $table) {
            $table->dropForeign(['ctz_id']);
            $table->unsignedBigInteger('ctz_id')->nullable(false)->change();
            $table->foreign('ctz_id')->references('ctz_id')->on('citizens')->onDelete('cascade')->onUpdate('cascade');
        });
    }
};
