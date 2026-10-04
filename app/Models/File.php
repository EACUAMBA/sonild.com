<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

#[Fillable(['name', 'path', 'format', 'size'])]
class File extends Model
{
    public static function storeUpload(UploadedFile $upload): static
    {
        return static::create([
            'name' => $upload->getClientOriginalName(),
            'path' => $upload->store('files', 'public'),
            'format' => strtolower($upload->extension() ?: 'unknown'),
            'size' => $upload->getSize(),
        ]);
    }

    public function url(): string
    {
        return Storage::disk('public')->url($this->path);
    }
}
