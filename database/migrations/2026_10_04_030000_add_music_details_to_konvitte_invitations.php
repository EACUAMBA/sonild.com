<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('konvitte_invitations', function (Blueprint $table): void {
            $table->string('music_title')->nullable();
            $table->string('music_artist')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('konvitte_invitations', function (Blueprint $table): void {
            $table->dropColumn(['music_title', 'music_artist']);
        });
    }
};
