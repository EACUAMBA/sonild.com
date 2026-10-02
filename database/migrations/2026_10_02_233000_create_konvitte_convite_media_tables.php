<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('konvitte_convite_galleries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('konvitte_convite_id')->constrained('konvitte_convites')->cascadeOnDelete();
            $table->string('path');
            $table->string('original_name');
            $table->unsignedBigInteger('size');
            $table->timestamps();
        });
        Schema::create('konvitte_convite_contacts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('konvitte_convite_id')->constrained('konvitte_convites')->cascadeOnDelete();
            $table->string('categoria');
            $table->string('nome');
            $table->string('telefone')->nullable();
            $table->string('email')->nullable();
            $table->unsignedInteger('ordem')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('konvitte_convite_contacts');
        Schema::dropIfExists('konvitte_convite_galleries');
    }
};
