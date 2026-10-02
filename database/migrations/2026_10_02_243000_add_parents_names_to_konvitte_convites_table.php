<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('konvitte_convites', function (Blueprint $table): void {
            $table->string('nome_pai_noivo')->nullable()->after('nome_noivo');
            $table->string('nome_mae_noivo')->nullable()->after('nome_pai_noivo');
            $table->string('nome_pai_noiva')->nullable()->after('nome_mae_noivo');
            $table->string('nome_mae_noiva')->nullable()->after('nome_pai_noiva');
        });
    }

    public function down(): void
    {
        Schema::table('konvitte_convites', function (Blueprint $table): void {
            $table->dropColumn(['nome_pai_noivo', 'nome_mae_noivo', 'nome_pai_noiva', 'nome_mae_noiva']);
        });
    }
};
