<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('konvitte_convites', function (Blueprint $table): void {
            $table->renameColumn('noivos_nome', 'nome_noiva');
            $table->string('nome_noivo')->after('nome_noiva');
        });
    }

    public function down(): void
    {
        Schema::table('konvitte_convites', function (Blueprint $table): void {
            $table->dropColumn('nome_noivo');
            $table->renameColumn('nome_noiva', 'noivos_nome');
        });
    }
};
