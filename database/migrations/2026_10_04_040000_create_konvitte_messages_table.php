<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('konvitte_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('konvitte_invitation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('konvitte_guest_id')->constrained()->cascadeOnDelete();
            $table->text('text');
            $table->timestamps();
            $table->index(['konvitte_invitation_id', 'konvitte_guest_id', 'id'], 'konvitte_messages_history_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('konvitte_messages');
    }
};
