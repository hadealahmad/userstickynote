<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notes = $request->user()
            ->notes()
            ->latest()
            ->get();

        return response()->json(['notes' => $notes]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Enforce subscription for cloud sync
        if (!$user->is_subscribed) {
            return response()->json(['error' => 'Premium subscription required for cloud sync.'], 402);
        }

        $data = $request->validate([
            'twitter_user_id' => 'required|string',
            'twitter_username' => 'nullable|string',
            'content' => 'required|string|max:2000',
            'source_url' => 'nullable|string|url',
            'client_id' => 'nullable|string|max:100',
        ]);

        // Sanitize content
        $data['content'] = strip_tags($data['content']);

        $note = $request->user()->notes()->updateOrCreate(
            ['client_id' => $data['client_id'] ?? null,
             'user_id' => $request->user()->id],
            $data
        );

        return response()->json(['note' => $note], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $note = $request->user()->notes()->findOrFail($id);
        $note->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function sync(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->is_subscribed) {
            return response()->json(['error' => 'Premium subscription required for cloud sync.'], 402);
        }

        $request->validate([
            'notes' => 'required|array',
            'notes.*.twitter_user_id' => 'required|string',
            'notes.*.twitter_username' => 'nullable|string',
            'notes.*.content' => 'required|string|max:2000',
            'notes.*.source_url' => 'nullable|string',
            'notes.*.client_id' => 'required|string',
        ]);

        $user = $request->user();
        $synced = [];

        foreach ($request->notes as $noteData) {
            $note = $user->notes()->updateOrCreate(
                ['client_id' => $noteData['client_id']],
                [
                    'twitter_user_id' => $noteData['twitter_user_id'],
                    'twitter_username' => $noteData['twitter_username'] ?? null,
                    'content' => strip_tags($noteData['content']),
                    'source_url' => $noteData['source_url'] ?? null,
                ]
            );
            $synced[] = $note;
        }

        $allNotes = $user->notes()->latest()->get();

        return response()->json([
            'synced' => count($synced),
            'notes' => $allNotes,
        ]);
    }
}
