import PlatformConfig, {
    DEFAULT_PLATFORM_CONFIG,
    DEFAULT_STANDARD_RATE_CARD,
} from "../models/platformConfig.model.js";

export { DEFAULT_PLATFORM_CONFIG, DEFAULT_STANDARD_RATE_CARD };

// Dynamic in-memory instances (mutated in-place to ensure backward compatibility for all imports)
export const PLATFORM_CONFIG = { ...DEFAULT_PLATFORM_CONFIG };
export const STANDARD_RATE_CARD = [...DEFAULT_STANDARD_RATE_CARD];

/**
 * Initialize dynamic configuration from MongoDB.
 * Called on server bootstrap and whenever config changes.
 */
export const initPlatformConfig = async () => {
    try {
        let doc = await PlatformConfig.findOne({ key: "default_platform_config" });
        if (!doc) {
            doc = await PlatformConfig.create({
                key: "default_platform_config",
                config: DEFAULT_PLATFORM_CONFIG,
                rateCard: DEFAULT_STANDARD_RATE_CARD,
            });
        }

        if (doc.config) {
            const rawConfig = doc.config.toObject ? doc.config.toObject() : doc.config;
            Object.assign(PLATFORM_CONFIG, rawConfig);
        }

        if (Array.isArray(doc.rateCard) && doc.rateCard.length > 0) {
            const rawRateCard = doc.rateCard.map((item) =>
                item.toObject ? item.toObject() : item,
            );
            STANDARD_RATE_CARD.splice(0, STANDARD_RATE_CARD.length, ...rawRateCard);
        }

        return {
            config: { ...PLATFORM_CONFIG },
            rateCard: [...STANDARD_RATE_CARD],
        };
    } catch (error) {
        console.error("Failed to load platform config from DB, using fallback defaults:", error.message);
        return {
            config: { ...PLATFORM_CONFIG },
            rateCard: [...STANDARD_RATE_CARD],
        };
    }
};

/**
 * Save updated configuration and rate card to MongoDB and refresh in-memory cache.
 */
export const savePlatformConfigToDB = async ({ config, rateCard, updatedBy }) => {
    let doc = await PlatformConfig.findOne({ key: "default_platform_config" });
    if (!doc) {
        doc = new PlatformConfig({
            key: "default_platform_config",
            config: { ...DEFAULT_PLATFORM_CONFIG },
            rateCard: [...DEFAULT_STANDARD_RATE_CARD],
        });
    }

    if (config && typeof config === "object") {
        const mergedConfig = { ...doc.config.toObject(), ...config };
        doc.config = mergedConfig;
        Object.assign(PLATFORM_CONFIG, mergedConfig);
    }

    if (Array.isArray(rateCard)) {
        doc.rateCard = rateCard;
        STANDARD_RATE_CARD.splice(0, STANDARD_RATE_CARD.length, ...rateCard);
    }

    if (updatedBy) {
        doc.updatedBy = updatedBy;
    }

    await doc.save();

    return {
        config: { ...PLATFORM_CONFIG },
        rateCard: [...STANDARD_RATE_CARD],
    };
};

const CROSS_SELL_MAP = {
    Electrical: [
        {
            serviceCode: "ac-service-basic",
            title: "AC Deep Cleaning",
            description: "Prevent summer breakdowns with a deep cleaning visit.",
        },
        {
            serviceCode: "switchboard-repair",
            title: "Safety Check for Switchboards",
            description:
                "Get nearby boards inspected before small faults turn risky.",
        },
    ],
    Plumbing: [
        {
            serviceCode: "tap-replacement",
            title: "Kitchen Tap Service",
            description: "Bundle a tap check-up with this plumbing visit.",
        },
    ],
    Cleaning: [
        {
            serviceCode: "deep-cleaning-room",
            title: "Full Home Deep Cleaning",
            description:
                "Schedule a follow-up cleaning and save another emergency trip.",
        },
    ],
};

export const getRateCardItem = (serviceCode) =>
    STANDARD_RATE_CARD.find((item) => item.serviceCode === serviceCode) || null;

export const normaliseCoordinates = (coordinates) => {
    if (!coordinates) {
        return null;
    }

    const lat = Number(
        coordinates.lat ?? coordinates.latitude ?? coordinates.coordinates?.[1],
    );
    const lng = Number(
        coordinates.lng ?? coordinates.longitude ?? coordinates.coordinates?.[0],
    );

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }

    return {
        type: "Point",
        coordinates: [lng, lat],
    };
};

export const buildVoiceInput = (
    voiceInput,
    fallbackText = "",
    speakerRole = "customer",
) => {
    if (!voiceInput && !fallbackText) {
        return {
            transcript: "",
            language: "Hindi",
            audioUrl: "",
            speakerRole,
        };
    }

    return {
        transcript: (voiceInput?.transcript || fallbackText || "").trim(),
        language: (voiceInput?.language || "Hindi").trim(),
        audioUrl: (voiceInput?.audioUrl || "").trim(),
        speakerRole,
    };
};

export const buildPricingBreakdown = ({
    pricingModel,
    serviceCode,
    rocketMode = false,
    coinsRedeemed = 0,
    finalQuotedAmount = 0,
}) => {
    const rateCardItem =
        pricingModel === "standard" ? getRateCardItem(serviceCode) : null;
    const standardRate = rateCardItem?.price || 0;
    const inspectionFee =
        pricingModel === "inspection" ? PLATFORM_CONFIG.inspectionFee : 0;
    const rocketModeFee = rocketMode ? PLATFORM_CONFIG.rocketModeUserFee : 0;
    const subtotal =
        standardRate +
        inspectionFee +
        PLATFORM_CONFIG.trustSafetyFee +
        rocketModeFee +
        Math.max(0, Number(finalQuotedAmount || 0));

    const totalUserPayable = Math.max(0, subtotal - Math.max(0, coinsRedeemed));
    const workerPayoutEstimate =
        standardRate +
        inspectionFee +
        Math.max(0, Number(finalQuotedAmount || 0)) +
        (rocketMode ? PLATFORM_CONFIG.rocketModeWorkerBonus : 0);
    const platformRevenue =
        PLATFORM_CONFIG.trustSafetyFee +
        (rocketMode ? PLATFORM_CONFIG.rocketModePlatformShare : 0);

    return {
        pricingModel,
        serviceCode: rateCardItem?.serviceCode || serviceCode || "",
        serviceLabel: rateCardItem?.title || "",
        standardRate,
        inspectionFee,
        trustSafetyFee: PLATFORM_CONFIG.trustSafetyFee,
        rocketModeFee,
        finalQuotedAmount: Math.max(0, Number(finalQuotedAmount || 0)),
        coinsRedeemed: Math.max(0, Number(coinsRedeemed || 0)),
        subtotal,
        totalUserPayable,
        workerPayoutEstimate,
        platformRevenue,
    };
};

export const getCrossSellRecommendations = (category) =>
    CROSS_SELL_MAP[category] || CROSS_SELL_MAP.General || [];
