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
        if (!$user->is_subscribed && !$user->is_admin) {
            return response()->json(['error' => 'Premium subscription required for cloud sync.'], 402);
        }

        $data = $request->validate([
            'twitter_user_id' => 'required|string',
            'twitter_username' => 'nullable|string',
            'content' => 'required|string|max:2000',
            'source_url' => 'nullable|string',
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
        $clientId = $request->query('client_id');

        $query = $request->user()->notes();

        if ($clientId) {
            $note = $query->where('client_id', $clientId)->firstOrFail();
        } else {
            $note = $query->findOrFail($id);
        }

        $note->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function sync(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->is_subscribed && !$user->is_admin) {
            return response()->json(['error' => 'Premium subscription required for cloud sync.'], 402);
        }

        $request->validate([
            'notes' => 'required|array',
            'notes.*.twitter_user_id' => 'required|string',
            'notes.*.twitter_username' => 'nullable|string',
            'notes.*.content' => 'required|string|max:2000',
            'notes.*.source_url' => 'nullable|string',
            'notes.*.client_id' => 'required|string',
            'notes.*.updated_at' => 'required|numeric',
            'notes.*.deleted_at' => 'nullable|numeric',
        ]);

        $syncedCount = 0;

        foreach ($request->notes as $noteData) {
            // Find existing note including deleted ones
            $note = $user->notes()->withTrashed()->where('client_id', $noteData['client_id'])->first();
            
            $incomingUpdatedAt = date('Y-m-d H:i:s', $noteData['updated_at'] / 1000);
            $incomingIsDeleted = !empty($noteData['deleted_at']);

            if (!$note) {
                // New note from client
                $note = new Note([
                    'user_id' => $user->id,
                    'client_id' => $noteData['client_id'],
                    'twitter_user_id' => $noteData['twitter_user_id'],
                    'twitter_username' => $noteData['twitter_username'] ?? null,
                    'content' => strip_tags($noteData['content']),
                    'source_url' => $noteData['source_url'] ?? null,
                ]);
                $note->created_at = $incomingUpdatedAt;
                $note->updated_at = $incomingUpdatedAt;
                
                if ($incomingIsDeleted) {
                    $note->deleted_at = date('Y-m-d H:i:s', $noteData['deleted_at'] / 1000);
                }
                
                $note->save();
                $syncedCount++;
            } else {
                // Resolve conflict using timestamps
                $serverUpdatedAt = $note->updated_at->timestamp * 1000;
                
                // If client side is newer, update server
                if ($noteData['updated_at'] > $serverUpdatedAt) {
                    $note->fill([
                        'twitter_user_id' => $noteData['twitter_user_id'],
                        'twitter_username' => $noteData['twitter_username'] ?? null,
                        'content' => strip_tags($noteData['content']),
                        'source_url' => $noteData['source_url'] ?? null,
                    ]);
                    $note->updated_at = $incomingUpdatedAt;
                    
                    if ($incomingIsDeleted) {
                        $note->deleted_at = date('Y-m-d H:i:s', $noteData['deleted_at'] / 1000);
                    } else {
                        $note->deleted_at = null; // Un-delete if client says it's alive and newer
                    }
                    
                    $note->save();
                    $syncedCount++;
                }
            }
        }

        // Return all notes including recently deleted (e.g. within 30 days)
        // This acts as a tombstone for the client to sync deletions
        $allNotes = $user->notes()->withTrashed()
            ->where(function($query) {
                $query->whereNull('deleted_at')
                      ->orWhere('deleted_at', '>', now()->subDays(30));
            })
            ->get();

        return response()->json([
            'synced' => $syncedCount,
            'notes' => $allNotes,
        ]);
    }
}
