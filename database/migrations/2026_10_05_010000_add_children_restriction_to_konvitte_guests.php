<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('konvitte_guests', function (Blueprint $table): void {
            $table->boolean('not_extended_to_children')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('konvitte_guests', function (Blueprint $table): void {
            $table->dropColumn('not_extended_to_children');
        });
    }
};
