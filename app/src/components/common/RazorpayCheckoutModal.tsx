import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
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
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLiveWebView, setShowLiveWebView] = useState(false);

  if (!visible) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess({
        razorpayOrderId: orderId,
        razorpayPaymentId: `pay_demo_${Date.now()}`,
        razorpaySignature: 'test_mock_signature',
      });
    }, 700);
  };

  // Live Razorpay WebView HTML (if user explicitly chooses Live Gateway)
  const amountInPaise = Math.round(amount * 100);
  const checkoutHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f8fafc; font-family: sans-serif; }
          .loader { text-align: center; color: #0E6E71; }
        </style>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body>
        <div class="loader">
          <h3>Connecting to Razorpay Secure Gateway...</h3>
        </div>
        <script>
          try {
            const options = {
              key: "${keyId}",
              amount: "${amountInPaise}",
              currency: "INR",
              name: "Feedants",
              description: "Competition Entry Fee",
              order_id: "${orderId}",
              prefill: { name: "${userName}", email: "${userEmail}" },
              theme: { color: "#0E6E71" },
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
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FAILED', error: response.error }));
            });
            rzp.open();
          } catch(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FAILED', error: e.message }));
          }
        </script>
      </body>
    </html>
  `;

  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 24)
  );
  const bottomInset = Math.max(insets.bottom, spacing.lg);

  if (showLiveWebView && Platform.OS !== 'web') {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={() => setShowLiveWebView(false)}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <View style={[styles.container, { paddingTop: topInset }]}>
          <View style={styles.liveHeader}>
            <View style={styles.liveHeaderTitleContainer}>
              <Text style={styles.headerTitle}>Razorpay Live Gateway</Text>
              <Text style={styles.liveHeaderSubtitle}>Secure 256-bit Encrypted SSL Session</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowLiveWebView(false)}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Close live gateway"
            >
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <WebView
            source={{ html: checkoutHtml }}
            style={styles.webView}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'SUCCESS') {
                  onSuccess(data.payload);
                } else {
                  setShowLiveWebView(false);
                }
              } catch {
                setShowLiveWebView(false);
              }
            }}
          />
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <View style={[styles.backdrop, { paddingTop: topInset + 12 }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheetContainer, { paddingBottom: bottomInset }]}>
          {/* Top handle pill for bottom sheet */}
          <View style={styles.handleBar}>
            <View style={styles.handle} />
          </View>

          {/* Razorpay Brand Header */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.razorpayBadge}>
                <Text style={styles.razorpayBadgeText}>Razorpay</Text>
              </View>
              <Text style={styles.securedText}>🔒 Trusted Business</Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Close checkout modal"
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>
            {/* Amount Banner */}
            <View style={styles.amountBanner}>
              <View>
                <Text style={styles.merchantTitle}>Feedants Talent Platform</Text>
                <Text style={styles.orderSubtitle}>Order: {orderId}</Text>
              </View>
              <View style={styles.amountPill}>
                <Text style={styles.amountText}>₹{amount}</Text>
              </View>
            </View>

            {/* Test Mode Notification */}
            <View style={styles.testModeNotice}>
              <Ionicons name="flask-outline" size={16} color="#0D9488" style={{ marginRight: 6 }} />
              <Text style={styles.testNoticeText}>
                Demo Checkout Active &bull; Test Razorpay transaction
              </Text>
            </View>

            {/* Payment Method Selector */}
            <Text style={styles.sectionHeader}>Choose Payment Method</Text>

            {/* UPI Option */}
            <TouchableOpacity
              style={[styles.methodCard, selectedMethod === 'upi' && styles.methodCardActive]}
              onPress={() => setSelectedMethod('upi')}
              activeOpacity={0.8}
            >
              <View style={styles.methodIconCircle}>
                <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.methodDetails}>
                <Text style={styles.methodName}>UPI / QR (Instant)</Text>
                <Text style={styles.methodSubtitle}>Google Pay, PhonePe, Paytm, BHIM</Text>
              </View>
              <Ionicons
                name={selectedMethod === 'upi' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selectedMethod === 'upi' ? colors.primary : '#CBD5E1'}
              />
            </TouchableOpacity>

            {/* Cards Option */}
            <TouchableOpacity
              style={[styles.methodCard, selectedMethod === 'card' && styles.methodCardActive]}
              onPress={() => setSelectedMethod('card')}
              activeOpacity={0.8}
            >
              <View style={styles.methodIconCircle}>
                <Ionicons name="card-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.methodDetails}>
                <Text style={styles.methodName}>Debit / Credit Card</Text>
                <Text style={styles.methodSubtitle}>Visa, MasterCard, RuPay, Maestro</Text>
              </View>
              <Ionicons
                name={selectedMethod === 'card' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selectedMethod === 'card' ? colors.primary : '#CBD5E1'}
              />
            </TouchableOpacity>

            {/* Net Banking Option */}
            <TouchableOpacity
              style={[styles.methodCard, selectedMethod === 'netbanking' && styles.methodCardActive]}
              onPress={() => setSelectedMethod('netbanking')}
              activeOpacity={0.8}
            >
              <View style={styles.methodIconCircle}>
                <MaterialCommunityIcons name="bank-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.methodDetails}>
                <Text style={styles.methodName}>Net Banking</Text>
                <Text style={styles.methodSubtitle}>HDFC, ICICI, SBI, Axis & all Indian banks</Text>
              </View>
              <Ionicons
                name={selectedMethod === 'netbanking' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selectedMethod === 'netbanking' ? colors.primary : '#CBD5E1'}
              />
            </TouchableOpacity>

            {/* User Details Preview */}
            <View style={styles.userInfoBox}>
              <Text style={styles.userLabel}>Paying as:</Text>
              <Text style={styles.userValue}>{userName} &bull; {userEmail}</Text>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={styles.payBtn}
              onPress={handleSimulatePayment}
              disabled={isProcessing}
              activeOpacity={0.88}
            >
              {isProcessing ? (
                <View style={styles.processingRow}>
                  <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
                  <Text style={styles.payBtnText}>Verifying Payment...</Text>
                </View>
              ) : (
                <View style={styles.processingRow}>
                  <Ionicons name="lock-closed" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.payBtnText}>Pay ₹{amount} (Confirm Registration)</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Alternative toggle to launch live webview if key is live */}
            {Platform.OS !== 'web' && (
              <TouchableOpacity
                style={styles.liveGatewayLink}
                onPress={() => setShowLiveWebView(true)}
              >
                <Text style={styles.liveGatewayText}>
                  Switch to Live Razorpay Web Gateway →
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '92%',
  },
  handleBar: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 2,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  liveHeaderTitleContainer: {
    flex: 1,
  },
  liveHeaderSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  razorpayBadge: {
    backgroundColor: '#0C2340',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
  },
  razorpayBadgeText: {
    color: '#00BAF2',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  securedText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBody: {
    padding: spacing.lg,
  },
  amountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  merchantTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  orderSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  amountPill: {
    backgroundColor: colors.primaryTint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#BFE5DC',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  testModeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: spacing.lg,
  },
  testNoticeText: {
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  methodCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0FAF8',
  },
  methodIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  methodDetails: {
    flex: 1,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  methodSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  userInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  userLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 6,
  },
  userValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  payBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  liveGatewayLink: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: 4,
  },
  liveGatewayText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
