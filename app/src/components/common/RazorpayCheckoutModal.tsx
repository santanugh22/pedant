import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface RazorpayCheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (paymentData: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => void;
  orderId: string;
  amount: number; // in rupees
  keyId: string;
  userName?: string;
  userEmail?: string;
}

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  visible,
  onClose,
  onSuccess,
  orderId,
  amount,
  keyId,
  userName = 'Feedants Participant',
  userEmail = 'user@feedants.com',
}) => {
  if (!visible) return null;

  // Web fallback or mock for testing in simulator/browser
  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.backdrop}>
          <View style={styles.webModalContent}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Razorpay Test Checkout</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.body}>
              <Text style={styles.infoLabel}>Order ID:</Text>
              <Text style={styles.infoValue}>{orderId}</Text>

              <Text style={styles.infoLabel}>Amount:</Text>
              <Text style={styles.infoValue}>₹ {amount}</Text>

              <Text style={styles.note}>
                This is running in web test mode. Click "Simulate Successful Payment" to test the full payment verification flow.
              </Text>

              <TouchableOpacity
                style={styles.payButton}
                activeOpacity={0.8}
                onPress={() => {
                  onSuccess({
                    razorpayOrderId: orderId,
                    razorpayPaymentId: `pay_web_${Date.now()}`,
                    razorpaySignature: 'test_mock_signature',
                  });
                }}
              >
                <Text style={styles.payButtonText}>Simulate Successful Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Native WebView checkout
  const amountInPaise = Math.round(amount * 100);
  const checkoutHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #F6F8F9;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .loader {
            text-align: center;
            color: #0E6E71;
          }
        </style>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body>
        <div class="loader">
          <h3>Connecting to Razorpay Secure Checkout...</h3>
        </div>
        <script>
          const options = {
            key: "${keyId}",
            amount: "${amountInPaise}",
            currency: "INR",
            name: "Feedants",
            description: "Competition Entry Fee",
            order_id: "${orderId}",
            prefill: {
              name: "${userName}",
              email: "${userEmail}"
            },
            theme: {
              color: "#0E6E71"
            },
            handler: function (response) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SUCCESS',
                payload: {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                }
              }));
            },
            modal: {
              ondismiss: function () {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DISMISSED' }));
              }
            }
          };
          const rzp = new Razorpay(options);
          rzp.on('payment.failed', function (response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'FAILED',
              error: response.error
            }));
          });
          rzp.open();
        </script>
      </body>
    </html>
  `;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Razorpay Secure Payment</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <WebView
          source={{ html: checkoutHtml }}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'SUCCESS') {
                onSuccess(data.payload);
              } else if (data.type === 'DISMISSED' || data.type === 'FAILED') {
                onClose();
              }
            } catch (err) {
              onClose();
            }
          }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Opening Razorpay Checkout...</Text>
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  webModalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    width: '100%',
    maxWidth: 450,
    padding: spacing.xl,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  body: {
    paddingVertical: spacing.lg,
  },
  infoLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  note: {
    ...typography.caption,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radius.md,
    marginVertical: spacing.lg,
  },
  payButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
