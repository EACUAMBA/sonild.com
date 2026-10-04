<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('konvitte_guest_rsvps', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('konvitte_guest_id')
                ->unique('konvitte_rsvps_guest_unique')
                ->constrained('konvitte_guests', indexName: 'konvitte_rsvps_guest_fk')
                ->cascadeOnDelete();
            $table->enum('status', ['PENDING', 'CONFIRMED', 'DECLINED'])->default('PENDING');
            $table->text('message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('konvitte_guest_rsvps');
    }
};
