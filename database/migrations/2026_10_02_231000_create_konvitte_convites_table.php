<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('konvitte_convites', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('konvitte_invite_type_id')->constrained('konvitte_invite_types')->restrictOnDelete();
            $table->string('noivos_nome');
            $table->dateTime('data');
            $table->string('local');
            $table->text('texto_biblico')->nullable();
            $table->string('livro_biblico')->nullable();
            $table->string('foto_capa')->nullable();
            $table->string('foto_inicial')->nullable();
            $table->string('musica')->nullable();
            $table->text('texto_casal')->nullable();
            $table->string('foto_informacoes')->nullable();
            $table->text('texto_celebre')->nullable();
            $table->text('texto_orientacoes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('konvitte_convites');
    }
};
