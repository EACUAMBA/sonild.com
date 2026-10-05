<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('konvitte_messages', function (Blueprint $table): void {
            $table->boolean('hidden_by_guest')->default(false);
            $table->boolean('hidden_by_admin')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('konvitte_messages', fn(Blueprint $table) => $table->dropColumn(['hidden_by_guest', 'hidden_by_admin']));
    }
};
