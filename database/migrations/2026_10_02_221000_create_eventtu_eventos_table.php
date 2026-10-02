<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('eventtu_eventos', function (Blueprint $table): void {
            $table->id();
            $table->string('nome');
            $table->dateTime('data');
            $table->foreignId('eventtu_event_type_id')->constrained('eventtu_event_types')->restrictOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eventtu_eventos');
    }
};
