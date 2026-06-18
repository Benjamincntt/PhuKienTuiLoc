/** Bật VNPay/Momo trên UI. AnTea: false. Site khác: true + backend Payments:OnlineEnabled. */
export const onlinePaymentEnabled =
  import.meta.env.VITE_ONLINE_PAYMENT_ENABLED === "true"
