<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('konvitte_invitations', function (Blueprint $table): void {
            $table->string('google_maps_link', 500)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('konvitte_invitations', function (Blueprint $table): void {
            $table->dropColumn('google_maps_link');
        });
    }
};
