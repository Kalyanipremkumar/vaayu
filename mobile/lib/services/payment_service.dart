import 'dart:async';

import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'valuation_service.dart' show PaymentProof, PaymentsUnconfiguredException;

/// Raised when the user dismisses/fails the Razorpay checkout sheet.
class PaymentCancelledException implements Exception {
  PaymentCancelledException([this.message]);
  final String? message;
}

/// Creates a ₹99 Razorpay order server-side, drives the native checkout sheet,
/// and returns a [PaymentProof] (order/payment/signature) to unlock a valuation.
class PaymentService {
  PaymentService(this._client);
  final SupabaseClient _client;

  Future<Map<String, dynamic>> _createOrder() async {
    try {
      final res = await _client.functions.invoke('create-payment-order');
      final data = res.data;
      if (data is! Map) throw Exception('Could not start checkout.');
      return Map<String, dynamic>.from(data);
    } on FunctionException catch (e) {
      final details = e.details;
      final code = details is Map ? details['code']?.toString() : null;
      if (code == 'payments_unconfigured') throw PaymentsUnconfiguredException();
      final msg = details is Map ? details['error']?.toString() : null;
      throw Exception(msg ?? 'Could not start checkout. Please try again.');
    }
  }

  /// Opens the checkout sheet and completes with a verified [PaymentProof].
  /// Throws [PaymentCancelledException] on dismissal/failure,
  /// [PaymentsUnconfiguredException] if Razorpay isn't set up server-side.
  Future<PaymentProof> payForValuation({String? contactEmail, String? contactPhone}) async {
    final order = await _createOrder();
    final orderId = order['orderId']?.toString();
    final keyId = order['keyId']?.toString();
    final amount = order['amount'];
    if (orderId == null || keyId == null) {
      throw Exception('Could not start checkout. Please try again.');
    }

    final completer = Completer<PaymentProof>();
    final razorpay = Razorpay();

    razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, (PaymentSuccessResponse r) {
      if (r.orderId != null && r.paymentId != null && r.signature != null) {
        if (!completer.isCompleted) {
          completer.complete(PaymentProof(
            orderId: r.orderId!,
            paymentId: r.paymentId!,
            signature: r.signature!,
          ));
        }
      } else if (!completer.isCompleted) {
        completer.completeError(PaymentCancelledException('Payment could not be verified.'));
      }
    });
    razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, (PaymentFailureResponse r) {
      if (!completer.isCompleted) {
        completer.completeError(PaymentCancelledException(r.message));
      }
    });

    razorpay.open({
      'key': keyId,
      'order_id': orderId,
      'amount': amount,
      'currency': order['currency'] ?? 'INR',
      'name': 'Vaayu',
      'description': 'Artwork valuation',
      'timeout': 300,
      'prefill': {
        if (contactEmail != null && contactEmail.isNotEmpty) 'email': contactEmail,
        if (contactPhone != null && contactPhone.isNotEmpty) 'contact': contactPhone,
      },
      'theme': {'color': '#3E1324'},
    });

    try {
      return await completer.future;
    } finally {
      // Razorpay needs a moment to deliver the final event before teardown.
      Future.delayed(const Duration(seconds: 2), razorpay.clear);
    }
  }
}
