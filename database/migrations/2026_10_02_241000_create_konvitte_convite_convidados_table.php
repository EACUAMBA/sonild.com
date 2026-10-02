<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('konvitte_convite_convidados', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('konvitte_convite_id')->constrained('konvitte_convites')->cascadeOnDelete();
            $table->foreignId('konvitte_convite_mesa_id')->nullable()->constrained('konvitte_convite_mesas')->nullOnDelete();
            $table->string('nome');
            $table->unsignedSmallInteger('numero_maximo_convidados')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('konvitte_convite_convidados');
    }
};
