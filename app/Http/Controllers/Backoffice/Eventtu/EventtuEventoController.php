<?php

namespace App\Http\Controllers\Backoffice\Eventtu;

use App\Http\Controllers\Controller;
use App\Models\Eventtu\EventtuEvento;
use App\Models\Eventtu\EventtuEventType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EventtuEventoController extends Controller
{
    public function index(): Response
    {
        $this->ensureAccess();
        return Inertia::render('backoffice/Eventtu/Events', [
            'eventos' => EventtuEvento::query()->with('eventType:id,name,code')->latest('data')->paginate(12)->through(fn(EventtuEvento $evento) => [
                'id' => $evento->id,
                'nome' => $evento->nome,
                'data' => $evento->data?->toIso8601String(),
                'eventType' => $evento->eventType ? ['name' => $evento->eventType->name, 'code' => $evento->eventType->code] : null,
            ]),
            'eventTypes' => EventtuEventType::query()->orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    private function ensureAccess(): void
    {
        abort_unless(request()->user()?->hasModulePermission('backoffice', 'ACL'), 403);
    }

    public function types(): Response
    {
        $this->ensureAccess();
        return Inertia::render('backoffice/Eventtu/EventTypes', [
            'eventTypes' => EventtuEventType::query()->withCount('eventos')->orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->ensureAccess();
        $data = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'data' => ['required', 'date'],
            'eventtuEventTypeId' => ['required', 'integer', 'exists:eventtu_event_types,id'],
        ]);
        EventtuEvento::create(['nome' => $data['nome'], 'data' => $data['data'], 'eventtu_event_type_id' => $data['eventtuEventTypeId']]);
        return back()->with('success', 'Evento criado com sucesso.');
    }

    public function storeType(Request $request): RedirectResponse
    {
        $this->ensureAccess();
        $data = $request->validate(['name' => ['required', 'string', 'max:120', 'unique:eventtu_event_types,name'], 'code' => ['nullable', 'string', 'max:80', 'unique:eventtu_event_types,code']]);
        EventtuEventType::create(['name' => $data['name'], 'code' => $data['code'] ?: Str::upper(Str::slug($data['name'], '_'))]);
        return back()->with('success', 'Tipo de evento criado com sucesso.');
    }

    public function updateType(Request $request, EventtuEventType $eventType): RedirectResponse
    {
        $this->ensureAccess();
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:eventtu_event_types,name,' . $eventType->id],
            'code' => ['nullable', 'string', 'max:80', 'unique:eventtu_event_types,code,' . $eventType->id],
        ]);
        $eventType->update(['name' => $data['name'], 'code' => $data['code'] ?: Str::upper(Str::slug($data['name'], '_'))]);
        return back()->with('success', 'Tipo de evento atualizado com sucesso.');
    }

    public function destroyType(EventtuEventType $eventType): RedirectResponse
    {
        $this->ensureAccess();
        if ($eventType->eventos()->exists()) {
            return back()->withErrors(['eventType' => 'Este tipo não pode ser eliminado porque já está associado a eventos.']);
        }
        $eventType->delete();
        return back()->with('success', 'Tipo de evento eliminado com sucesso.');
    }
}
