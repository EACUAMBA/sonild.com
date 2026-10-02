<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('konvitte_convite_contacts', function (Blueprint $table): void {
            $table->dropColumn('categoria');
        });
    }

    public function down(): void
    {
        Schema::table('konvitte_convite_contacts', function (Blueprint $table): void {
            $table->string('categoria')->nullable()->after('konvitte_convite_id');
        });
    }
};
