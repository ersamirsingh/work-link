import mongoose from "mongoose";

export const DEFAULT_PLATFORM_CONFIG = {
    inspectionFee: 50,
    trustSafetyFee: 15,
    leadFee: 20,
    workerBoostFee: 10,
    rocketModeUserFee: 50,
    rocketModeWorkerBonus: 30,
    rocketModePlatformShare: 20,
    verifiedProFee: 149,
    verifiedProDurationDays: 30,
    verifiedProEarlyAccessSeconds: 10,
    workerCreditLimit: -200,
    manualFiveStarCoinReward: 25,
    disputeWindowHours: 2,
    abandonedRefundHours: 24,
    warrantyDays: 7,
    defaultSearchRadiusKm: 5,
    securityDeposit: 50,
};

export const DEFAULT_STANDARD_RATE_CARD = [
    {
        serviceCode: "fan-installation",
        title: "Fan Installation",
        category: "Electrical",
        price: 150,
    },
    {
        serviceCode: "switchboard-repair",
        title: "Switchboard Repair",
        category: "Electrical",
        price: 120,
    },
    {
        serviceCode: "tap-replacement",
        title: "Tap Replacement",
        category: "Plumbing",
        price: 180,
    },
    {
        serviceCode: "pipe-leak-fix",
        title: "Pipe Leak Fix",
        category: "Plumbing",
        price: 220,
    },
    {
        serviceCode: "ac-service-basic",
        title: "AC Service (Basic)",
        category: "Appliance",
        price: 499,
    },
    {
        serviceCode: "deep-cleaning-room",
        title: "Deep Cleaning (1 Room)",
        category: "Cleaning",
        price: 299,
    },
    {
        serviceCode: "door-lock-repair",
        title: "Door Lock Repair",
        category: "Carpentry",
        price: 199,
    },
];

const rateCardItemSchema = new mongoose.Schema(
    {
        serviceCode: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false },
);

const platformConfigSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            default: "default_platform_config",
        },
        config: {
            inspectionFee: { type: Number, default: 50 },
            trustSafetyFee: { type: Number, default: 15 },
            leadFee: { type: Number, default: 20 },
            workerBoostFee: { type: Number, default: 10 },
            rocketModeUserFee: { type: Number, default: 50 },
            rocketModeWorkerBonus: { type: Number, default: 30 },
            rocketModePlatformShare: { type: Number, default: 20 },
            verifiedProFee: { type: Number, default: 149 },
            verifiedProDurationDays: { type: Number, default: 30 },
            verifiedProEarlyAccessSeconds: { type: Number, default: 10 },
            workerCreditLimit: { type: Number, default: -200 },
            manualFiveStarCoinReward: { type: Number, default: 25 },
            disputeWindowHours: { type: Number, default: 2 },
            abandonedRefundHours: { type: Number, default: 24 },
            warrantyDays: { type: Number, default: 7 },
            defaultSearchRadiusKm: { type: Number, default: 5 },
            securityDeposit: { type: Number, default: 50 },
        },
        rateCard: {
            type: [rateCardItemSchema],
            default: () => DEFAULT_STANDARD_RATE_CARD,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true },
);

const PlatformConfig = mongoose.model("PlatformConfig", platformConfigSchema);

export default PlatformConfig;
