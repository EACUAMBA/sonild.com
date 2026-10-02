<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('konvitte_convite_mesas', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('konvitte_convite_id')->constrained('konvitte_convites')->cascadeOnDelete();
            $table->string('nome');
            $table->timestamps();
            $table->unique(['konvitte_convite_id', 'nome']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('konvitte_convite_mesas');
    }
};
