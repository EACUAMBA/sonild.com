<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('konvitte_tables', function (Blueprint $table): void {
            $table->unsignedSmallInteger('capacity')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('konvitte_tables', function (Blueprint $table): void {
            $table->dropColumn('capacity');
        });
    }
};
