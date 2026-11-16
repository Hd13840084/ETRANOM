/**
 * ETRANOM - PARTY SYSTEM
 * Central Configuration
 * Version: 1.0.0
 */

export const PARTY_CONFIG = Object.freeze({

    // ظرفیت گروه
    MAX_MEMBERS: 4,
    MIN_MEMBERS_TO_START: 2,

    // مدت اعتبار دعوت‌نامه (۲ دقیقه)
    INVITE_DURATION: 2 * 60 * 1000,

    // محدودیت‌های گروه
    MAX_PENDING_INVITES: 10,
    MAX_ACTIVE_PARTIES_PER_PLAYER: 1,

    // وضعیت گروه
    PARTY_STATUS: Object.freeze({
        WAITING: "waiting",
        PREPARING: "preparing",
        STARTED: "started",
        DISBANDED: "disbanded"
    }),

    // نقش اعضا
    MEMBER_ROLE: Object.freeze({
        LEADER: "leader",
        MEMBER: "member"
    }),

    // وضعیت بازیکنان
    MEMBER_STATUS: Object.freeze({
        ONLINE: "online",
        OFFLINE: "offline",
        READY: "ready",
        NOT_READY: "not_ready",
        LOADING: "loading",
        IN_COMBAT: "in_combat"
    }),

    // وضعیت دعوت‌ها
    INVITE_STATUS: Object.freeze({
        PENDING: "pending",
        ACCEPTED: "accepted",
        DECLINED: "declined",
        EXPIRED: "expired",
        CANCELLED: "cancelled"
    }),

    // مناطق قابل انتخاب
    REGIONS: Object.freeze([

        {
            id: "burnt_forest",
            name: "جنگل سوخته",
            minLevel: 1,
            maxLevel: 5
        },

        {
            id: "thornbush_grove",
            name: "بیشه خارزار",
            minLevel: 1,
            maxLevel: 5
        },

        {
            id: "ash_hills",
            name: "تپه‌های خاکستر",
            minLevel: 1,
            maxLevel: 5
        },

        {
            id: "verdash_river",
            name: "رود ورداش",
            minLevel: 1,
            maxLevel: 5
        },

        {
            id: "southern_plains",
            name: "دشت جنوبی",
            minLevel: 1,
            maxLevel: 5
        }

    ]),

    // تنظیمات آماده‌باش
    READY_CHECK: Object.freeze({
        REQUIRE_ALL_MEMBERS: true,
        LEADER_MUST_BE_READY: true
    }),

    // تنظیمات اتصال
    CONNECTION: Object.freeze({
        HEARTBEAT_INTERVAL: 15000,
        OFFLINE_TIMEOUT: 45000,
        RECONNECT_ATTEMPTS: 5,
        RECONNECT_DELAY: 3000
    })

});


// دریافت اطلاعات منطقه
export function getPartyRegion(regionId) {

    return PARTY_CONFIG.REGIONS.find(
        region => region.id === regionId
    ) || null;

}


// بررسی ظرفیت گروه
export function hasPartyCapacity(memberCount) {

    return Number.isInteger(memberCount) &&
        memberCount < PARTY_CONFIG.MAX_MEMBERS;

}


// بررسی سطح بازیکن برای ورود به منطقه
export function canEnterRegion(playerLevel, regionId) {

    const region = getPartyRegion(regionId);

    if (!region) return false;

    return playerLevel >= region.minLevel &&
        playerLevel <= region.maxLevel;

}


// بررسی امکان شروع گروه
export function canStartParty(memberCount) {

    return memberCount >= PARTY_CONFIG.MIN_MEMBERS_TO_START &&
        memberCount <= PARTY_CONFIG.MAX_MEMBERS;

  }
