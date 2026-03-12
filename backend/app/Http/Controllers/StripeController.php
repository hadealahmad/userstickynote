<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Webhook;

class StripeController extends Controller
{
    public function checkout(Request $request)
    {
        Stripe::setApiKey(config("services.stripe.secret"));

        $session = Session::create([
            "payment_method_types" => ["card"],
            "line_items" => [
                [
                    "price_data" => [
                        "currency" => "usd",
                        "product_data" => [
                            "name" =>
                                "Twitter Sticky Notes - 1 Year Cloud Sync",
                        ],
                        "unit_amount" => 300, // $3.00
                    ],
                    "quantity" => 1,
                ],
            ],
            "mode" => "payment",
            "success_url" => route("dashboard") . "?payment=success",
            "cancel_url" => route("dashboard") . "?payment=cancel",
            "metadata" => [
                "user_id" => auth()->id(),
            ],
        ]);

        return redirect($session->url);
    }

    public function webhook(Request $request)
    {
        Stripe::setApiKey(config("services.stripe.secret"));
        $payload = $request->getContent();
        $sig_header = $request->header("Stripe-Signature");
        $event = null;

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sig_header,
                config("services.stripe.webhook_secret"),
            );
        } catch (\UnexpectedValueException $e) {
            return response()->json(["error" => "Invalid payload"], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            return response()->json(["error" => "Invalid signature"], 400);
        }

        if ($event->type == "checkout.session.completed") {
            $session = $event->data->object;
            $userId = $session->metadata->user_id;

            \App\Models\User::where("id", $userId)->update([
                "is_subscribed" => true,
                "subscription_ends_at" => now()->addYear(),
            ]);
        }

        return response()->json(["status" => "success"]);
    }
}
