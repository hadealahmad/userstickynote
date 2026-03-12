<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class WebNoteController extends Controller
{
    public function store(Request $request)
    {
        if (!$request->user()->is_subscribed) {
            return Redirect::back()->with(
                "error",
                "Premium subscription required to create notes.",
            );
        }

        $request->validate([
            "twitter_user_id" => "required|string",
            "content" => "required|string|max:2000",
        ]);

        $request
            ->user()
            ->notes()
            ->create([
                "twitter_user_id" => $request->twitter_user_id,
                "twitter_username" => $request->twitter_user_id, // Default to user ID if nickname not provided
                "content" => strip_tags($request->content),
                "client_id" => bin2hex(random_bytes(10)), // Generate a client ID for web-created notes
            ]);

        return Redirect::back()->with("message", "Note added!");
    }

    public function update(Request $request, Note $note)
    {
        if ($note->user_id !== auth()->id()) {
            abort(403);
        }

        if (!$request->user()->is_subscribed) {
            return Redirect::back()->with(
                "error",
                "Premium subscription required to update notes.",
            );
        }

        $request->validate([
            "content" => "required|string|max:2000",
        ]);

        $note->update([
            "content" => strip_tags($request->content),
        ]);

        return Redirect::back()->with("message", "Note updated!");
    }

    public function destroy(Request $request, Note $note)
    {
        if ($note->user_id !== auth()->id()) {
            abort(403);
        }

        if (!$request->user()->is_subscribed) {
            return Redirect::back()->with(
                "error",
                "Premium subscription required to delete notes.",
            );
        }

        $note->delete();

        return Redirect::back()->with("message", "Note deleted!");
    }
}
