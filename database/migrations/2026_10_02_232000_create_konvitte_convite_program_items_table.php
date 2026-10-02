<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('konvitte_convite_program_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('konvitte_convite_id')->constrained('konvitte_convites')->cascadeOnDelete();
            $table->string('hora', 5);
            $table->string('nome');
            $table->string('localizacao')->nullable();
            $table->string('google_maps_link')->nullable();
            $table->string('icon', 40)->default('calendar');
            $table->unsignedInteger('ordem')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('konvitte_convite_program_items');
    }
};
