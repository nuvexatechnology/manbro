"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { formatCurrency } from "@/lib/utils";

interface CashfreePaymentModalProps {
  isOpen: boolean;
  orderId: string;
  amount: number;
  customerName: string;
  paymentSessionId?: string;
  environment?: "SANDBOX" | "PRODUCTION";
  onClose: () => void;
  onSuccess: (paymentDetails: any) => void;
  onFailure: (errorMsg: string) => void;
}

export default function CashfreePaymentModal({
  isOpen,
  orderId,
  amount,
  customerName,
  paymentSessionId,
  environment,
  onClose,
  onSuccess,
  onFailure,
}: CashfreePaymentModalProps) {
  const isDevSandbox = paymentSessionId?.startsWith("sandbox_dev_");

  const [isInitializing, setIsInitializing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Connecting to Cashfree Secure Payment Gateway...");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const hasTriggered = useRef(false);

  const launchCashfreeCheckout = useCallback(async () => {
    if (!paymentSessionId) {
      setErrorMessage("Payment session could not be established. Please retry.");
      return;
    }

    if (paymentSessionId.startsWith("sandbox_dev_")) {
      return;
    }

    setIsInitializing(true);
    setErrorMessage("");
    setStatusMessage("Opening Cashfree checkout window...");

    try {
      const win = typeof window !== "undefined" ? (window as any) : null;
      let attempts = 0;
      while (!win?.Cashfree && attempts < 8) {
        await new Promise((r) => setTimeout(r, 350));
        attempts++;
      }

      if (!win?.Cashfree) {
        throw new Error("Cashfree payment gateway SDK could not be loaded. Please disable ad-blockers and retry.");
      }

      const isProd =
        environment === "PRODUCTION" ||
        process.env.NEXT_PUBLIC_CASHFREE_ENV?.toUpperCase() === "PRODUCTION";
      const cashfree = win.Cashfree({
        mode: isProd ? "production" : "sandbox",
      });

      setStatusMessage("Please complete your payment in the Cashfree checkout window.");

      const result = await cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_modal",
      });

      if (result?.error) {
        setIsInitializing(false);
        const errMsg = result.error.message || "Payment cancelled or window closed.";
        setErrorMessage(errMsg);
        onFailure(errMsg);
        return;
      }

      if (result?.redirect) {
        setStatusMessage("Payment completed. Redirecting to order confirmation...");
        return;
      }

      if (result?.paymentDetails) {
        setIsInitializing(false);
        onSuccess(result.paymentDetails);
        return;
      }

      setIsInitializing(false);
    } catch (err: any) {
      console.error("Cashfree checkout error:", err);
      setIsInitializing(false);
      const msg = err?.message || "Failed to launch Cashfree payment gateway.";
      setErrorMessage(msg);
      onFailure(msg);
    }
  }, [paymentSessionId, environment, onFailure, onSuccess]);

  const launchDirectCheckout = useCallback(() => {
    try {
      const win = typeof window !== "undefined" ? (window as any) : null;
      if (win?.Cashfree && paymentSessionId) {
        const isProd =
          environment === "PRODUCTION" ||
          process.env.NEXT_PUBLIC_CASHFREE_ENV?.toUpperCase() === "PRODUCTION";
        const cashfree = win.Cashfree({
          mode: isProd ? "production" : "sandbox",
        });
        cashfree.checkout({
          paymentSessionId,
          redirectTarget: "_self",
        });
      }
    } catch (err: any) {
      console.error("Direct checkout launch error:", err);
    }
  }, [paymentSessionId, environment]);

  const handleSimulatedPayment = (success: boolean) => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      if (success) {
        onSuccess({
          orderId,
          paymentId: `SANDBOX_PAY_${Date.now()}`,
          status: "SUCCESS",
          amount,
          method: "UPI / Test Simulation",
        });
      } else {
        onFailure("Simulated payment cancelled by user.");
      }
    }, 600);
  };

  useEffect(() => {
    if (isOpen && paymentSessionId && !hasTriggered.current) {
      hasTriggered.current = true;
      if (!paymentSessionId.startsWith("sandbox_dev_")) {
        const timer = setTimeout(() => {
          launchCashfreeCheckout();
        }, 400);
        return () => clearTimeout(timer);
      }
    }

    if (!isOpen) {
      hasTriggered.current = false;
      setErrorMessage("");
    }
  }, [isOpen, paymentSessionId, launchCashfreeCheckout]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0F2619] border border-[#284234] rounded-3xl shadow-2xl overflow-hidden text-white animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#091D12] via-[#11301F] to-[#091D12] p-5 border-b border-[#284234] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] font-black text-lg">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white tracking-wide uppercase">Cashfree Payments</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  {isDevSandbox ? "SANDBOX LOCALHOST" : environment === "PRODUCTION" ? "LIVE GATEWAY" : "SANDBOX"}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">Order Ref: #{orderId}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#11301F] border border-[#284234] text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Order Price Details */}
        <div className="px-6 py-4 bg-[#143D28]/40 border-b border-[#284234] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400">Payable Amount</span>
            <div className="text-2xl font-black text-[#d4af37]">{formatCurrency(amount)}</div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-neutral-400">Recipient</span>
            <div className="text-xs font-bold text-white max-w-[140px] truncate">{customerName}</div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 text-center">
          {isDevSandbox ? (
            /* Interactive Sandbox Test Simulator for Localhost */
            <div className="space-y-4 text-left">
              <div className="p-3 bg-[#091D12] border border-[#284234] rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-[#d4af37] font-bold uppercase tracking-wider text-[11px]">
                  <span>🧪</span>
                  <span>Sandbox Mode (Localhost Active)</span>
                </div>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  No real money will be charged and no domain whitelisting is needed. Choose an action to complete your test checkout:
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={() => handleSimulatedPayment(true)}
                  className="w-full py-3.5 px-4 bg-[#d4af37] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#c29e2e] transition shadow-lg shadow-[#d4af37]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                >
                  {isSimulating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Confirming Test Payment...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>Pay with Test UPI / Card (Instant Success)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={() => handleSimulatedPayment(false)}
                  className="w-full py-2.5 px-4 bg-[#11301F] border border-[#284234] text-red-400 hover:text-red-300 text-xs font-semibold rounded-xl hover:border-red-500/40 transition cursor-pointer disabled:opacity-50 text-center"
                >
                  Simulate Payment Failure
                </button>
              </div>
            </div>
          ) : errorMessage ? (\n            /* Error State */
            <div className="space-y-4">
              <div className="w-14 h-14 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto text-red-400 text-2xl">
                ⚠️
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Payment Not Completed</h3>
                <p className="text-xs text-red-300/90 max-w-xs mx-auto">{errorMessage}</p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={launchDirectCheckout}
                  className="w-full py-3 bg-[#d4af37] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#c29e2e] transition cursor-pointer shadow-lg shadow-[#d4af37]/20"
                >
                  Pay via Cashfree Hosted Page (Redirect)
                </button>
                <button
                  type="button"
                  onClick={launchCashfreeCheckout}
                  className="w-full py-2.5 bg-[#143D28] border border-[#284234] text-[#d4af37] font-bold text-xs uppercase tracking-wider rounded-xl hover:border-[#d4af37] transition cursor-pointer"
                >
                  Retry Modal Window
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 bg-[#11301F] border border-[#284234] text-neutral-400 text-xs font-semibold rounded-xl hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Official Cashfree SDK Loading / Active State */
            <div className="space-y-5 py-2">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-[#284234] border-t-[#d4af37] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#d4af37]">
                  ₹
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Cashfree Official Checkout
                </h3>
                <p className="text-xs text-neutral-300 max-w-xs mx-auto leading-relaxed">
                  {statusMessage}
                </p>
              </div>

              <div className="bg-[#091D12] p-3 rounded-xl border border-[#284234] text-[11px] text-neutral-400 text-left space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span>🔒</span>
                  <span>Direct Encrypted Bank Channel</span>
                </div>
                <p>Supports UPI (GPay, PhonePe, Paytm, QR), Debit/Credit Cards & NetBanking directly through Cashfree.</p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={launchCashfreeCheckout}
                  disabled={isInitializing}
                  className="flex-1 py-2.5 bg-[#143D28] border border-[#284234] text-[#d4af37] text-xs font-bold rounded-xl hover:border-[#d4af37] transition cursor-pointer"
                >
                  Reopen Window
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 bg-[#11301F] border border-[#284234] text-neutral-400 text-xs font-semibold rounded-xl hover:text-white transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#091D12] border-t border-[#284234] text-center text-[10px] text-neutral-400 flex items-center justify-center gap-2">
          <span>🛡️</span>
          <span>Powered by Cashfree Payments India • PCI-DSS Compliant</span>
        </div>
      </div>
    </div>
  );
}
