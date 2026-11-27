/** ETRANOM V1977 — extensible currency ledger and atomic wallet operations. */
export const ECONOMY_LEDGER_VERSION_V1977 = '1977.0.0';
const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const arr = v => Array.isArray(v) ? v : [];
const n = (v, d = 0) => Number.isSafeInteger(Number(v)) ? Number(v) : d;
const clone = v => structuredClone(v);
export function defineCurrencyCatalogV1977(entries = []) { const seen = new Set(); return Object.freeze(arr(entries).map(x => { const id = String((x === null || x === void 0 ? void 0 : x.id) || '').trim(); if (!id || seen.has(id))
    throw new Error('invalid_or_duplicate_currency_id'); seen.add(id); const precision = Math.max(0, Math.min(6, n(x.precision, 0))); return Object.freeze({ id, name: String(x.name || id), symbol: String(x.symbol || ''), precision, tradable: x.tradable !== false, displayOrder: n(x.displayOrder, 100) }); }).sort((a, b) => a.displayOrder - b.displayOrder)); }
export function normalizeWalletV1977(wallet = {}) { var _a; const balances = {}; for (const [id, value] of Object.entries(obj((_a = wallet.balances) !== null && _a !== void 0 ? _a : wallet))) {
    if (id === 'balances' || id === 'version')
        continue;
    const amount = n(value, 0);
    if (amount < 0)
        throw new Error('negative_wallet_balance');
    balances[id] = amount;
} return { version: ECONOMY_LEDGER_VERSION_V1977, balances }; }
export function planWalletMutationV1977(wallet = {}, mutation = {}) { const current = normalizeWalletV1977(wallet), currencyId = String(mutation.currencyId || 'gold'), amount = n(mutation.amount, NaN), direction = String(mutation.direction || ''); if (!currencyId || !Number.isSafeInteger(amount) || amount <= 0)
    throw new Error('invalid_wallet_mutation'); if (!['credit', 'debit'].includes(direction))
    throw new Error('invalid_wallet_direction'); const before = current.balances[currencyId] || 0; if (direction === 'debit' && before < amount)
    throw new Error('insufficient_funds'); const after = direction === 'credit' ? before + amount : before - amount; if (!Number.isSafeInteger(after) || after < 0)
    throw new Error('wallet_balance_overflow'); current.balances[currencyId] = after; return { wallet: current, entry: { currencyId, amount, direction, balanceBefore: before, balanceAfter: after, reason: String(mutation.reason || 'unspecified'), referenceId: mutation.referenceId ? String(mutation.referenceId) : null } }; }
/** Transaction adapter: transact(userId, fn(tx)); tx.getReceipt, tx.getWallet, tx.setWallet, tx.appendLedgerEntry. */
export function createEconomyLedgerServiceV1977({ store, currencyCatalog = [] } = {}) { if (!store || typeof store.transact !== 'function')
    throw new Error('serializable_economy_store_required'); const currencies = defineCurrencyCatalogV1977(currencyCatalog); const known = new Set(currencies.map(x => x.id)); return Object.freeze({ version: ECONOMY_LEDGER_VERSION_V1977, currencies, async mutate(input = {}) { const userId = String(input.userId || ''), requestId = String(input.requestId || ''); if (!userId || !requestId)
        throw new Error('wallet_mutation_identity_required'); return store.transact(userId, async (tx) => { const prior = await tx.getReceipt(requestId); if (prior)
        return { ...clone(prior), duplicate: true }; const mutation = { ...input }; if (known.size && !known.has(String(mutation.currencyId || 'gold')))
        throw new Error('unknown_currency'); const planned = planWalletMutationV1977(await tx.getWallet(), mutation); await tx.setWallet(clone(planned.wallet)); await tx.appendLedgerEntry({ ...planned.entry, userId, requestId, createdAt: input.createdAt || null }); const receipt = { userId, requestId, wallet: planned.wallet, entry: planned.entry, settled: true }; await tx.setReceipt(requestId, clone(receipt)); return { ...receipt, duplicate: false }; }); } }); }
export function createInMemoryEconomyStoreV1977() { const wallets = new Map(), receipts = new Map(), entries = [], locks = new Map(); return { wallets, receipts, entries, async transact(userId, fn) { const prev = locks.get(userId) || Promise.resolve(); let release; const gate = new Promise(r => release = r), queued = prev.then(() => gate); locks.set(userId, queued); await prev; try {
        return await fn({ getReceipt: async (id) => receipts.get(`${userId}:${id}`) || null, setReceipt: async (id, v) => receipts.set(`${userId}:${id}`, clone(v)), getWallet: async () => clone(wallets.get(userId) || { balances: { gold: 0 } }), setWallet: async (v) => wallets.set(userId, clone(v)), appendLedgerEntry: async (e) => entries.push(clone(e)) });
    }
    finally {
        release();
        if (locks.get(userId) === queued)
            locks.delete(userId);
    } } }; }
