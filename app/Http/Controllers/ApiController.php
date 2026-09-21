<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/** API sesi + data (same-origin, CSRF). */
class ApiController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Email atau kata sandi salah.'], 422);
        }

        Auth::login($user, true);

        return response()->json(['data' => ['user' => $this->payload($user)]]);
    }

    public function logout(): JsonResponse
    {
        Auth::logout();

        return response()->json(['data' => true]);
    }

    /**
     * Snapshot "database" yang dibaca seluruh UI.
     * Analog GET /api/v1/state pada hris-adsy (RemoteStore.fetch).
     */
    public function state(Request $request): JsonResponse
    {
        return response()->json(['data' => [
            'user' => $this->payload($request->user()),
            'notes' => $request->user()->notes()
                ->orderByDesc('created_at')
                ->get()
                ->map(fn (Note $n) => $this->notePayload($n))
                ->values(),
        ]]);
    }

    public function storeNote(Request $request): JsonResponse
    {
        $data = $request->validate(['title' => ['required', 'string', 'max:255']]);

        $note = $request->user()->notes()->create($data);

        return response()->json(['data' => $this->notePayload($note)], 201);
    }

    public function toggleNote(Request $request, Note $note): JsonResponse
    {
        $this->ensureOwner($note);

        $note->update(['done' => ! $note->done]);

        return response()->json(['data' => $this->notePayload($note)]);
    }

    public function deleteNote(Request $request, Note $note): JsonResponse
    {
        $this->ensureOwner($note);

        $note->delete();

        return response()->json(['data' => true]);
    }

    private function ensureOwner(Note $note): void
    {
        abort_if($note->user_id !== auth()->id(), 403, 'Bukan catatan Anda.');
    }

    private function payload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'level' => $user->level,
        ];
    }

    private function notePayload(Note $note): array
    {
        return [
            'id' => $note->id,
            'title' => $note->title,
            'done' => (bool) $note->done,
            'created_at' => $note->created_at?->toIso8601String(),
        ];
    }
}